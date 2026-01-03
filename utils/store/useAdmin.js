import { create } from "zustand"
import { createUser, deleteUser } from "@/utils/actions/admin actions";
import { supabase } from "../supabase/client";
import { makeLink, prepareForGroupsTable, prepareForUsersTable } from "../supabase/utils";
import { projectActions } from "./useProject";
import { createDataLoadingHook } from "./utils/createStore";
import { format } from "date-fns";
import { toastsActions } from "./useToasts";
import { useTime } from "./useTime";


export const useAdmin = create((set, get) => ({
    classes: [],
    majors: [],
    allMembers: [],
    staff: [],

    // --------------------------------------
    // -------- Load initial Data -------------
    // -------------------------------------

    loadData: async () => {
        if (get().allMembers.length > 0) return;

        const { data: classes, error: allClassesError } = await supabase.from('groups').select('*').eq('type', 'class');
        if (allClassesError) toastsActions.addFromError(allClassesError)
        const { data: majors, error: allMajorsError } = await supabase.from('groups').select('*').eq('type', 'major');
        if (allMajorsError) toastsActions.addFromError(allMajorsError)
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
            `);
        if (allMembersError) toastsActions.addFromError(allMembersError)
        allMembers.forEach(member => member.groups = member.groups.map(g => g.group_id));
        set({ classes, majors, allMembers });
    },

    loadStaff: async () => {
        if (get().staff.length > 0) return;
        const { data, error } = await supabase.from('users').select('*').eq('role', 'staff');
        if (error) toastsActions.addFromError(error)
        set({ staff: data });
    },

    // ------------------------------
    // Users
    // ------------------------------
    createMember: async (memberData) => {
        const newID = await createUser(memberData.username, memberData.first_name, memberData.last_name);
        if (!newID) {
            toastsActions.addToast({ message: 'Failed to create user', type: 'error' });
            return;
        }
        const { error: updateError } = await supabase.from('users').update(prepareForUsersTable(memberData)).eq('id', newID);
        if (updateError) toastsActions.addFromError(updateError)
        const newMemberData = { ...memberData, id: newID, groups: memberData.groups || [] };
        set(state => ({
            allMembers: state.allMembers.concat(newMemberData)
        }));
        return newID;
    },
    updateMember: async (memberId, updates) => {
        const cleanedUpdates = prepareForUsersTable(updates);
        const { error: updateError } = await supabase.from('users').update(cleanedUpdates).eq('id', memberId);
        if (updateError) toastsActions.addFromError(updateError)
        set(state => ({
            allMembers: state.allMembers.map(member => member.id === memberId ? { ...member, ...updates } : member)
        }));
    },
    deleteMember: async (member) => {
        const { error: deleteError } = await deleteUser(member.id);
        if (deleteError) toastsActions.addFromError(deleteError)
        const { error: deleteUserError } = await supabase.from('users').delete().eq('id', member.id);
        if (deleteUserError) toastsActions.addFromError(deleteUserError)
        set(state => ({
            allMembers: state.allMembers.filter(m => m.id !== member.id)
        }));
    },

    // ------------------------------
    // Groups
    // ------------------------------
    addUserToGroup: async (groupId, userId) => {
        const { error: insertError } = await supabase.from('users_groups').insert({ user_id: userId, group_id: groupId });
        if (insertError) toastsActions.addFromError(insertError)
        set(state => ({
            allMembers: state.allMembers.map(member => member.id === userId ? { ...member, groups: [...member.groups, groupId] } : member)
        }));
    },
    removeUserFromGroup: async (groupId, userId) => {
        const { error: deleteError } = await supabase.from('users_groups').delete().eq('user_id', userId).eq('group_id', groupId);
        if (deleteError) toastsActions.addFromError(deleteError)
        set(state => ({
            allMembers: state.allMembers.map(member => member.id === userId ? { ...member, groups: member.groups.filter(g => g !== groupId) } : member)
        }));
    },
    createGroup: async (name, type) => {
        const groupData = { name, type };
        const { data: newGroupData, error: insertError } = await supabase.from('groups').insert(prepareForGroupsTable(groupData)).select().single();
        if (insertError) toastsActions.addFromError(insertError)
        if (type === 'class') set(state => ({ classes: [...state.classes, newGroupData] }));
        if (type === 'major') set(state => ({ majors: [...state.majors, newGroupData] }));
    },
    updateGroup: async (groupId, updates) => {
        const { data, error: updateError } = await supabase.from('groups').update(prepareForGroupsTable(updates)).eq('id', groupId).select();
        if (updateError) toastsActions.addFromError(updateError)
        if (data.type === 'class') set(state => ({ classes: state.classes.map(group => group.id === groupId ? { ...group, ...updates } : group) }));
        if (data.type === 'major') set(state => ({ majors: state.majors.map(major => major.id === groupId ? { ...major, ...updates } : major) }));
    },
    deleteGroup: async (groupId) => {
        const currentClass = get().classes.find(group => group.id === groupId);
        const currentMajor = get().majors.find(major => major.id === groupId);
        const { error: deleteError } = await supabase.from('groups').delete().eq('id', groupId);
        if (deleteError) toastsActions.addFromError(deleteError)
        if (currentClass) set(state => ({ classes: state.classes.filter(group => group.id !== groupId) }));
        if (currentMajor) set(state => ({ majors: state.majors.filter(major => major.id !== groupId) }));
    },


    // ------------------------------
    // Projects
    // ------------------------------
    loadProjects: async () => {
        const allMembers = get().allMembers;
        if (allMembers.some(member => member.project)) return;
        const currTerm = useTime.getState().currTerm;
        if (!currTerm) return;
        const { data, error: getProjectsError } = await supabase.from('projects').select(`
            *,
            master:staff_public!master(id:user_id,first_name, last_name, avatar_url)
            `).contains('term', [currTerm.id]);
        if (getProjectsError) toastsActions.addFromError(getProjectsError)
        const newAllMembers = allMembers.map(member => {
            const project = data.find(p => p.student_id === member.id);
            const res = { ...member }
            if (project) res.project = project;
            return res;
        })
        set({ allMembers: newAllMembers });
    },
    assignMasterToProject: async (studentId, projectId, masterId) => {
        const { error: projectError } = await supabase.from('projects').update({ status: 'active', master: masterId }).eq('id', projectId);
        if (projectError) toastsActions.addFromError(projectError)

        let master = get().allMembers.find(member => member.id === masterId);
        if (!master) master = get().allMembers.find(staff => staff.id === masterId);
        if (!master) {
            const { data: masterData, error: masterError } = await supabase.from('users').select('*').eq('id', masterId).single();
            if (masterError) toastsActions.addFromError(masterError)
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
        const { data, error } = await supabase.from('misc').select('data').eq('name', 'school_message').single();
        if (error) toastsActions.addFromError(error)
        set({ message: data.data.text });
    },
    updateMessage: async (text) => {
        set({ message: text });
        const { error: updateError } = await supabase.from('misc').update({ data: { text } }).eq('name', 'school_message');
        if (updateError) toastsActions.addFromError(updateError)
    },
}));

export const adminActions = Object.fromEntries(
    Object.entries(useAdmin.getState()).filter(([key, value]) => typeof value === 'function')
);

export const useAllStaff = createDataLoadingHook(useAdmin, 'staff', 'loadStaff');