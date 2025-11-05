import { create } from "zustand"
import { createUser, deleteUser } from "@/utils/actions/admin actions";
import { supabase } from "../supabase/client";
import { makeLink, prepareForGroupsTable, prepareForUsersTable } from "../supabase/utils";
import { projectActions } from "./useProject";
import { createDataLoadingHook } from "./utils/createStore";
import { format } from "date-fns";


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
        const { data: majors, error: allMajorsError } = await supabase.from('groups').select('*').eq('type', 'major');
        let { data: allMembers, error: allMembersError } = await supabase
            .from('users')
            .select(`
                id,
                first_name,
                last_name,
                username,
                role,
                is_admin,
                groups:users_groups!left (
                    group_id
                )
            `);
        allMembers.forEach(member => member.groups = member.groups.map(g => g.group_id));
        set({ classes, majors, allMembers });
    },

    loadStaff: async () => {
        if (get().staff.length > 0) return;
        const { data, error } = await supabase.from('users').select('*').eq('role', 'staff');
        if (error) throw error;
        set({ staff: data });
    },

    // ------------------------------
    // Users
    // ------------------------------
    createMember: async (memberData) => {
        const newID = await createUser(memberData.username, memberData.first_name, memberData.last_name);
        if (!newID) return
        await supabase.from('users').update(prepareForUsersTable(memberData)).eq('id', newID);
        const newMemberData = { ...memberData, id: newID, groups: memberData.groups || [] };
        set(state => ({
            allMembers: state.allMembers.concat(newMemberData)
        }));
        return newID;
    },
    updateMember: async (memberId, updates) => {
        const cleanedUpdates = prepareForUsersTable(updates);
        await supabase.from('users').update(cleanedUpdates).eq('id', memberId);
        set(state => ({
            allMembers: state.allMembers.map(member => member.id === memberId ? { ...member, ...updates } : member)
        }));
    },
    deleteMember: async (member) => {
        await deleteUser(member.id);
        await supabase.from('users').delete().eq('id', member.id);
        set(state => ({
            allMembers: state.allMembers.filter(m => m.id !== member.id)
        }));
    },

    // ------------------------------
    // Groups
    // ------------------------------
    addUserToGroup: async (groupId, userId) => {
        await supabase.from('users_groups').insert({ user_id: userId, group_id: groupId });
        set(state => ({
            allMembers: state.allMembers.map(member => member.id === userId ? { ...member, groups: [...member.groups, groupId] } : member)
        }));
    },
    removeUserFromGroup: async (groupId, userId) => {
        await supabase.from('users_groups').delete().eq('user_id', userId).eq('group_id', groupId);
        set(state => ({
            allMembers: state.allMembers.map(member => member.id === userId ? { ...member, groups: member.groups.filter(g => g !== groupId) } : member)
        }));
    },
    createGroup: async (name, type) => {
        const groupData = { name, type };
        const { data: newGroupData, error } = await supabase.from('groups').insert(prepareForGroupsTable(groupData)).select().single();
        if (error) throw error;
        if (type === 'class') set(state => ({ classes: [...state.classes, newGroupData] }));
        if (type === 'major') set(state => ({ majors: [...state.majors, newGroupData] }));
    },
    updateGroup: async (groupId, updates) => {
        const { data, error } = await supabase.from('groups').update(prepareForGroupsTable(updates)).eq('id', groupId).select();
        if (error) throw error;
        if (data.type === 'class') set(state => ({ classes: state.classes.map(group => group.id === groupId ? { ...group, ...updates } : group) }));
        if (data.type === 'major') set(state => ({ majors: state.majors.map(major => major.id === groupId ? { ...major, ...updates } : major) }));
    },
    deleteGroup: async (groupId) => {
        const currentClass = get().classes.find(group => group.id === groupId);
        const currentMajor = get().majors.find(major => major.id === groupId);
        await supabase.from('groups').delete().eq('id', groupId);
        if (currentClass) set(state => ({ classes: state.classes.filter(group => group.id !== groupId) }));
        if (currentMajor) set(state => ({ majors: state.majors.filter(major => major.id !== groupId) }));
    },


    // ------------------------------
    // Projects
    // ------------------------------
    loadProjects: async () => {
        const allMembers = get().allMembers;
        if (allMembers.some(member => member.project)) return;
        const { data, error } = await supabase.rpc('get_projects_in_current_term');
        if (error) throw error;
        for (const project of data) {
            const { data: masters } = await supabase.rpc('get_linked_items', {
                p_table_name: 'projects',
                p_item_id: project.id,
                p_target_types: ['mentorships']
            })
            if (masters.length > 0) {
                const master = get().allMembers.find(s => masters.some(m => m.data?.mentor_id === s.id));
                project.master = get().allMembers.find(s => masters.some(m => m.data?.mentor_id === s.id));
            }
        }
        const newAllMembers = allMembers.map(member => {
            const project = data.find(p => p.student_id === member.id);
            const res = { ...member }
            if (project) res.project = project;
            return res;
        })
        set({ allMembers: newAllMembers });
    },
    assignMasterToProject: async (studentId, projectId, masterId) => {
        const { data: mentorship, error: mentorshipError } = await supabase.from('mentorships')
            .upsert({ mentor_id: masterId, student_id: studentId }, { onConflict: 'mentor_id,student_id' })
            .select().single();
        if (mentorshipError) throw mentorshipError;

        await makeLink('mentorships', mentorship.id, 'projects', projectId);

        const { error: projectError } = await supabase.from('projects').update({ status: 'active' }).eq('id', projectId);
        if (projectError) throw projectError;

        let master = get().allMembers.find(member => member.id === masterId);
        if (!master) master = get().allMembers.find(staff => staff.id === masterId);
        if (!master) {
            const { data: masterData, error: masterError } = await supabase.from('users').select('*').eq('id', masterId).single();
            if (masterError) throw masterError;
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
        if (error) throw error;
        set({ message: data.data.text });
    },
    updateMessage: async (text) => {
        set({ message: text });
        await supabase.from('misc').update({ data: { text } }).eq('name', 'school_message');
    },
}));

export const adminActions = Object.fromEntries(
    Object.entries(useAdmin.getState()).filter(([key, value]) => typeof value === 'function')
);

export const useAllStaff = createDataLoadingHook(useAdmin, 'staff', 'loadStaff');