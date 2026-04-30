'use server'

import { getSupabaseAdminClient } from "@/utils/supabase/server";
import { previousSemester } from "@/utils/store/useTime";

// Ensures a report card exists for (userId, semester).
// If the semester has no record yet, copies from the previous semester (or creates empty).
// Returns the existing or newly created record.
export async function initializeReportSemester(userId, semester) {
    const supabase = getSupabaseAdminClient();

    const { data: existing } = await supabase
        .from('report_cards_private')
        .select('*')
        .eq('id', userId)
        .eq('report_semester', semester)
        .maybeSingle();

    if (existing) return existing;

    const prev = previousSemester(semester);
    const { data: prevData } = await supabase
        .from('report_cards_private')
        .select('ikigai, mentors, liba, learning, vocation, special')
        .eq('id', userId)
        .eq('report_semester', prev)
        .maybeSingle();

    const newRow = {
        id: userId,
        report_semester: semester,
        ...(prevData ?? {}),
    };

    const { data: created, error } = await supabase
        .from('report_cards_private')
        .insert(newRow)
        .select()
        .single();

    if (error) throw error;
    return created;
}
