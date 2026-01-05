import { useUser } from "@/utils/store/useUser";
import { supabase } from "../supabase/client";
import { createStore } from "./utils/createStore";
import { toastsActions } from "./useToasts";

export const [useMentorships, mentorshipsActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    mentorships: [],
    projectMentorships: [],
    allStudents: [],

    getMentorships: withLoadingCheck(async (user) => {
        set({ mentorships: [] });
        let query = supabase.from('mentorships')
            .select(`*, 
                student:users!mentorships_student_id_fkey (
                    id, first_name, last_name, username, role, user_profiles( avatar_url )
                ),
                mentor:users!mentorships_mentor_id_fkey (
                    id, first_name, last_name, username, role, user_profiles( avatar_url )
                )`)
        if (user.role === 'student') query = query.eq('student_id', user.id);
        else query = query.eq('mentor_id', user.id);
        query = query.eq('is_active', true);
        const { data: mentorships, error: mentorshipsError  } = await query;
        if (mentorshipsError) toastsActions.addFromError(mentorshipsError);
        set({ mentorships: mentorships });

        const { data, error } = await supabase.from('projects').select(`
            *,
            student:users!projects_student_id_fkey (
                id, first_name, last_name, username, role, user_profiles( avatar_url )
            ),
            master:staff_public!master(id:user_id,first_name, last_name, avatar_url)
            `).eq('master', user.id);
        if (error) toastsActions.addFromError(error);
        set({ projectMentorships: data });
    }),

    getAllStudents: async () => {
        if (get().allStudents.length > 0) return;
        const students = await supabase.from('users').select('id, first_name, last_name').eq('role', 'student').eq('active', true);
        set({ allStudents: students.data });
    },

    createMentorship: async (student, subject) => {
        // this should either create a new mentorship (if it doesnt exists) or reactivate an existing one
        const user = useUser.getState().user;
        if (user.role === 'student') return;
        const newMentorship = { mentor_id: user.id, student_id: student.id, subject };
        set({ mentorships: [...get().mentorships, { ...newMentorship, student, mentor: user }] });

        await supabase.from('mentorships').upsert(newMentorship, {
            onConflict: 'student_id,mentor_id', // matches your unique constraint columns
            ignoreDuplicates: false,            // default false; if true, it would ignore updates
        })

        // const { data, error } = await supabase.from('mentorships').insert(newMentorship)
        // if (error === "23505") {
        //     await supabase.from('mentorships').update({ is_active: true }).eq('student_id', student.id).eq('mentor_id', user.id);
        // }
    },

    deactivateMentorship: async (student) => {
        const user = useUser.getState().user;
        if (user.role === 'student') return;
        set({ mentorships: get().mentorships.filter(s => s.student_id !== student.id) });
        await supabase.from('mentorships').update({ is_active: false }).eq('mentor_id', user.id).eq('student_id', student.id);
    }
}));