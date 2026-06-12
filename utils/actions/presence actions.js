'use server';
import { getSupabaseServerClient } from '../supabase/server';

// Upsert presence rows into student_presence.
// On re-import: overwrites presence_days, absence_days, lateness_count, imported_at, imported_by.
// Clears lateness (qualitative) so staff must re-evaluate.
// rows: [{ student_id, semester, presence_days, absence_days, lateness_count, isImport? }]
export async function upsertPresence(rows) {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const now = new Date().toISOString();

    const upsertRows = rows.map(({ student_id, semester, presence_days, absence_days, lateness_count, lateness, isImport }) => {
        const row = { student_id, semester, presence_days, absence_days };
        if (lateness_count !== undefined) row.lateness_count = lateness_count;
        if (lateness !== undefined) row.lateness = lateness;
        if (isImport) {
            row.imported_at = now;
            row.imported_by = user.id;
            row.lateness = null; // staff must re-evaluate after re-import
        }
        return row;
    });

    const { error } = await supabase
        .from('student_presence')
        .upsert(upsertRows, { onConflict: 'student_id,semester' });
    if (error) throw error;
}

// Resolve student UUIDs from id_numbers (Israeli ID).
// Used during import so UUID lookup happens server-side.
// Returns array of { id_number, student_id, first_name, last_name } for matched students.
export async function resolveStudentsByIdNumber(idNumbers) {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
        .from('user_profiles')
        .select('id, id_number, users!inner(first_name, last_name, role, active)')
        .in('id_number', idNumbers)
        .eq('users.role', 'student')
        .eq('users.active', true);
    if (error) throw error;

    return (data ?? []).map(row => ({
        id_number: String(row.id_number),
        student_id: row.id,
        first_name: row.users.first_name,
        last_name: row.users.last_name,
    }));
}
