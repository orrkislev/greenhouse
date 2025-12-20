import { useUser } from "@/utils/store/useUser";
import { supabase } from "../supabase/client";
import { createStore } from "./utils/createStore";

export const [useMentorships, mentorshipsActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    mentorships: [],
    allStudents: [],

    getMentorships: withLoadingCheck(async (user) => {
        set({ mentorships: [] });
        let query = supabase.from('mentorships')
            .select(`*, 
                student:users!mentorships_student_id_fkey (
                    id, first_name, last_name, username, avatar_url, role
                ),
                mentor:users!mentorships_mentor_id_fkey (
                    id, first_name, last_name, username, avatar_url, role
                )`)
        if (user.role === 'student') query = query.eq('student_id', user.id);
        else query = query.eq('mentor_id', user.id);
        query = query.eq('is_active', true);
        const { data, error } = await query;
        if (error) throw error;
        set({ mentorships: data });
    }),

    getAllStudents: async () => {
        if (get().allStudents.length > 0) return;
        const students = await supabase.from('users').select('*').eq('role', 'student');
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