import { create } from "zustand"
import { createUser, deleteUser } from "@/utils/actions/admin actions";
import { supabase } from "../supabase/client";
import { makeLink, prepareForGroupsTable, prepareForUsersTable } from "../supabase/utils";
import { projectActions } from "./useProject";
import { createDataLoadingHook } from "./utils/createStore";
import { format } from "date-fns";
import { toastsActions } from "./useToasts";
import { useTime } from "./useTime";
import { isAdmin } from "./useUser";

export const useAdmin = create((set, get) => ({
    classes: [],
    majors: [],
    allMembers: [],
    staff: [],

    // --------------------------------------
    // -------- Load initial Data -------------
    // -------------------------------------

    loadData: async () => {
        if (!isAdmin()) return;
        if (get().allMembers.length > 0) return;

        const { data: classes, error: allClassesError } = await supabase.from('groups').select('*').eq('type', 'class');
        if (allClassesError) toastsActions.addFromError(allClassesError, 'שגיאה בטעינת הכיתות')
        const { data: majors, error: allMajorsError } = await supabase.from('groups').select('*').eq('type', 'major');
        if (allMajorsError) toastsActions.addFromError(allMajorsError, 'שגיאה בטעינת המסלולים')
        let { data: allMembers, error: allMembersError } = await supabase
            .from('users')
            .select(`
                id,
                first_name,
                last_name,
                username,
                role,
                is_admin,
                user_profiles( profile ),
                groups:users_groups!left (
                    group_id
                )
            `).eq('active', true);
        if (allMembersError) toastsActions.addFromError(allMembersError, 'שגיאה בטעינת המשתמשים');
        allMembers.forEach(member => member.groups = member.groups.map(g => g.group_id));
        set({ classes, majors, allMembers });
    },

    loadStaff: async () => {
        if (!isAdmin()) return;
        if (get().staff.length > 0) return;
        const { data, error } = await supabase.from('users').select('*').eq('role', 'staff');
        if (error) toastsActions.addFromError(error, 'שגיאה בטעינת הצוות');
        set({ staff: data });
    },

    // ------------------------------
    // Users
    // ------------------------------
    createMember: async (memberData) => {
        if (!isAdmin()) return;
        const newID = await createUser(memberData.username, memberData.first_name, memberData.last_name);
        if (!newID) {
            toastsActions.addToast({ message: 'Failed to create user', type: 'error' });
            return;
        }
        const { error: updateError } = await supabase.from('users').update(prepareForUsersTable(memberData)).eq('id', newID);
        if (updateError) toastsActions.addFromError(updateError, 'שגיאה בעדכון המשתמש');
        const newMemberData = { ...memberData, id: newID, groups: memberData.groups || [] };
        set(state => ({
            allMembers: state.allMembers.concat(newMemberData)
        }));
        return newID;
    },
    updateMember: async (memberId, updates) => {
        if (!isAdmin()) return;
        const cleanedUpdates = prepareForUsersTable(updates);
        const { error: updateError } = await supabase.from('users').update(cleanedUpdates).eq('id', memberId);
        if (updateError) toastsActions.addFromError(updateError, 'שגיאה בעדכון המשתמש');
        set(state => ({
            allMembers: state.allMembers.map(member => member.id === memberId ? { ...member, ...updates } : member)
        }));
    },
    deleteMember: async (member) => {
        if (!isAdmin()) return;
        const { error: deleteError } = await deleteUser(member.id);
        if (deleteError) toastsActions.addFromError(deleteError, 'שגיאה במחיקת המשתמש');
        const { error: deleteUserError } = await supabase.from('users').update({active: false}).eq('id', member.id);
        if (deleteUserError) toastsActions.addFromError(deleteUserError, 'שגיאה בעדכון המשתמש');
        const { error: deleteGroupsError } = await supabase.from('users_groups').delete().eq('user_id', member.id);
        if (deleteGroupsError) toastsActions.addFromError(deleteGroupsError, 'שגיאה במחיקת המשתמש מהקבוצות');
        set(state => ({
            allMembers: state.allMembers.filter(m => m.id !== member.id)
        }));
    },

    // ------------------------------
    // Groups
    // ------------------------------
    addUserToGroup: async (groupId, userId) => {
        if (!isAdmin()) return;
        const { error: insertError } = await supabase.from('users_groups').insert({ user_id: userId, group_id: groupId });
        if (insertError) toastsActions.addFromError(insertError, 'שגיאה בהוספת משתמש לקבוצה');
        set(state => ({
            allMembers: state.allMembers.map(member => member.id === userId ? { ...member, groups: [...member.groups, groupId] } : member)
        }));
    },
    removeUserFromGroup: async (groupId, userId) => {
        if (!isAdmin()) return;
        const { error: deleteError } = await supabase.from('users_groups').delete().eq('user_id', userId).eq('group_id', groupId);
        if (deleteError) toastsActions.addFromError(deleteError, 'שגיאה בהסרת משתמש מהקבוצה');  
        set(state => ({
            allMembers: state.allMembers.map(member => member.id === userId ? { ...member, groups: member.groups.filter(g => g !== groupId) } : member)
        }));
    },
    createGroup: async (name, type) => {
        if (!isAdmin()) return;
        const groupData = { name, type };
        const { data: newGroupData, error: insertError } = await supabase.from('groups').insert(prepareForGroupsTable(groupData)).select().single();
        if (insertError) toastsActions.addFromError(insertError, 'שגיאה ביצירת קבוצה');
        if (type === 'class') set(state => ({ classes: [...state.classes, newGroupData] }));
        if (type === 'major') set(state => ({ majors: [...state.majors, newGroupData] }));
    },
    updateGroup: async (groupId, updates) => {
        if (!isAdmin()) return;
        const { data, error: updateError } = await supabase.from('groups').update(prepareForGroupsTable(updates)).eq('id', groupId).select();
        if (updateError) toastsActions.addFromError(updateError, 'שגיאה בעדכון קבוצה');
        if (data.type === 'class') set(state => ({ classes: state.classes.map(group => group.id === groupId ? { ...group, ...updates } : group) }));
        if (data.type === 'major') set(state => ({ majors: state.majors.map(major => major.id === groupId ? { ...major, ...updates } : major) }));
    },
    deleteGroup: async (groupId) => {
        if (!isAdmin()) return;
        const currentClass = get().classes.find(group => group.id === groupId);
        const currentMajor = get().majors.find(major => major.id === groupId);
        const { error: deleteError } = await supabase.from('groups').delete().eq('id', groupId);
        if (deleteError) toastsActions.addFromError(deleteError, 'שגיאה במחיקת קבוצה');
        if (currentClass) set(state => ({ classes: state.classes.filter(group => group.id !== groupId) }));
        if (currentMajor) set(state => ({ majors: state.majors.filter(major => major.id !== groupId) }));
    },


    // ------------------------------
    // Projects
    // ------------------------------
    loadProjects: async () => {
        if (!isAdmin()) return;
        const allMembers = get().allMembers;
        if (allMembers.some(member => member.project)) return;
        const currTerm = useTime.getState().currTerm;
        if (!currTerm) return;
        const { data, error: getProjectsError } = await supabase.from('projects').select(`
            *,
            master:staff_public!master(id:user_id,first_name, last_name, avatar_url)
            `).contains('term', [currTerm.id]);
        if (getProjectsError) toastsActions.addFromError(getProjectsError, 'שגיאה בטעינת הפרויקטים');
        const newAllMembers = allMembers.map(member => {
            const project = data.find(p => p.student_id === member.id);
            const res = { ...member }
            if (project) res.project = project;
            return res;
        })
        set({ allMembers: newAllMembers });
    },
    assignMasterToProject: async (studentId, projectId, masterId) => {
        if (!isAdmin()) return;
        const { error: projectError } = await supabase.from('projects').update({ status: 'active', master: masterId }).eq('id', projectId);
        if (projectError) toastsActions.addFromError(projectError, 'שגיאה בהקצאת מנחה לפרויקט');

        let master = get().allMembers.find(member => member.id === masterId);
        if (!master) master = get().allMembers.find(staff => staff.id === masterId);
        if (!master) {
            const { data: masterData, error: masterError } = await supabase.from('users').select('*').eq('id', masterId).single();
            if (masterError) toastsActions.addFromError(masterError, 'שגיאה בטעינת נתוני המנחה');
            master = masterData;
        }

        if (get().allMembers.length > 0) {
            set(state => ({
                allMembers: state.allMembers.map(member => ({
                    ...member,
                    project: member.project?.id === projectId ? { ...member.project, master: master } : member.project
                }))
            }));
        }

        await projectActions.addTaskToProject({
            title: 'לקבוע פגישה שבועית',
            description: `לקבוע פגישה שבועית עם ${master.first_name} ${master.last_name}`,
            due_date: format(new Date(), 'yyyy-MM-dd'),
            student_id: studentId,
        }, projectId);
    },

    // ------------------------------
    // Messages
    // ------------------------------
    message: '',
    loadMessage: async () => {
        if (!isAdmin()) return;
        const { data, error } = await supabase.from('misc').select('data').eq('name', 'school_message').single();
        if (error) toastsActions.addFromError(error, 'שגיאה בטעינת ההודעה לבית הספר');
        set({ message: data.data.text });
    },
    updateMessage: async (text) => {
        if (!isAdmin()) return;
        set({ message: text });
        const { error: updateError } = await supabase.from('misc').update({ data: { text } }).eq('name', 'school_message');
        if (updateError) toastsActions.addFromError(updateError, 'שגיאה בעדכון ההודעה לבית הספר');
    },
}));

export const adminActions = Object.fromEntries(
    Object.entries(useAdmin.getState()).filter(([key, value]) => typeof value === 'function')
);

export const useAllStaff = createDataLoadingHook(useAdmin, 'staff', 'loadStaff');