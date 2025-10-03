import { create } from "zustand";
import { useUser } from "@/utils/store/useUser";
import { supabase } from "../supabase/client";

export const useMentorships = create((set, get) => ({
    mentorships: [],
    allStudents: [],

    getMentorships: async () => {
        if (get().mentorships.length > 0) return;
        const user = useUser.getState().user;
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
        const { data, error } = await query;
        if (error) throw error;
        set({ mentorships: data });
    },

    getAllStudents: async () => {
        if (get().allStudents.length > 0) return;
        const students = await supabase.from('users').select('*').eq('role', 'student');
        set({ allStudents: students.data });
    },

    createMentorship: async (student, subject) => {
        const user = useUser.getState().user;
        if (user.role === 'student') return;
        const newMentorship = { mentor_id: user.id, student_id: student.id, subject };
        set({ mentorships: [...get().mentorships, { ...newMentorship, student, mentor: user }] });
        await supabase.from('mentorships').insert(newMentorship);
    },

    deleteMentorship: async (student) => {
        const user = useUser.getState().user;
        if (user.role === 'student') return;
        set({ mentorships: get().mentorships.filter(s => s.student_id !== student.id) });
        await supabase.from('mentorships').delete().eq('mentor_id', user.id).eq('student_id', student.id);
    }
}));


export const mentorshipsActions = Object.fromEntries(
    Object.entries(useMentorships.getState()).map(([key, value]) => [key, useMentorships.getState()[key]])
);