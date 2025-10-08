import { create } from "zustand"
import { createUser, deleteUser } from "@/utils/actions/admin actions";
import { supabase } from "../supabase/client";
import { makeLink, prepareForGroupsTable, prepareForUsersTable } from "../supabase/utils";
import { projectActions } from "./useProject";
import { createDataLoadingHook } from "./utils/createStore";

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
        for (const member of allMembers) {
            const { data, error } = await supabase.rpc('get_student_current_term_project', { p_student_id: member.id });
            if (error) throw error;
            if (data.length > 0) {
                const { data: data2, error: error2 } = await supabase.rpc('get_linked_items', {
                    p_table_name: 'projects',
                    p_item_id: data[0].id,
                    p_target_types: ['mentorships']
                })
                if (error2) throw error2;
                if (data2) {
                    data[0].masters = data2.mentorships.map(d => d.mentorId).map(id => allMembers.find(m => m.id === id));
                    set(state => ({
                        allMembers: state.allMembers.map(member => member.id === member.id ? { ...member, project: data[0] } : member)
                    }));
                }
            }
        }
    },
    assignMasterToProject: async (studentId, projectId, masterId) => {
        let mentorship = await supabase.from('mentorships').select('*').eq('student_id', studentId).eq('mentor_id', masterId).single();
        if (mentorship.error) throw mentorship.error;
        if (!mentorship.data) {
            mentorship = await supabase.from('mentorships').insert({ mentor_id: masterId, student_id: studentId }).select();
            if (mentorship.error) throw mentorship.error;
        }
        if (mentorship.data) {
            await makeLink('mentorships', mentorship.data.id, 'projects', projectId);
        }

        const { error } = await supabase.from('projects').update(prepareForProjectsTable({ status: 'active' })).eq('id', projectId);
        if (error) throw error;

        if (get().allMembers.length > 0) {
            set(state => ({
                allMembers: state.allMembers.map(member => ({
                    ...member,
                    project: member.project?.id === projectId ? { ...member.project, master: master } : member.project
                }))
            }));
        }

        await projectTasksActions.addTaskToProject({
            title: 'לקבוע פגישה שבועית',
            description: `לקבוע פגישה שבועית עם ${master.first_name} ${master.last_name}`,
            due_date: format(new Date(), 'yyyy-MM-dd'),
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