'use server';
import { getSupabaseServerClient } from '../supabase/server';
import ExcelJS from 'exceljs';

// Parse a Mashov XLSX file (passed as FormData) on the server.
// Returns array of { idNum, presence_days, absence_days, lateness_count }.
export async function parseMashovXlsx(formData) {
    const file = formData.get('file');
    const buf = await file.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    const sheet = wb.worksheets[0];

    const ERROR_MSG = 'הקובץ אינו בפורמט המתאים. יש להעלות דוח מונה כללי לתקופה הרלוונטית מאפליקציית משו"ב';

    const a1 = String(sheet.getRow(1).getCell(1).value ?? '');
    const b3 = String(sheet.getRow(3).getCell(2).value ?? '').trim();
    const g3 = String(sheet.getRow(3).getCell(7).value ?? '').trim();
    const h3 = String(sheet.getRow(3).getCell(8).value ?? '').trim();
    const i3 = String(sheet.getRow(3).getCell(9).value ?? '').trim();

    if (!a1.includes('מונה כללי') || b3 !== 'ת.ז. התלמיד' || g3 !== 'נוכחות' || h3 !== 'חיסור' || (i3 !== '' && i3 !== 'איחור')) {
        throw new Error(ERROR_MSG);
    }

    const rows = [];
    sheet.eachRow((row, rowNum) => {
        if (rowNum < 4) return; // skip info row, blank row, header row
        const idNum = row.getCell(2).value;
        if (!idNum) return; // summary row at end
        rows.push({
            idNum:          String(idNum).trim(),
            presence_days:  Number(row.getCell(7).value) || 0,
            absence_days:   Number(row.getCell(8).value) || 0,
            lateness_count: Number(row.getCell(9).value) || 0,
        });
    });
    return rows;
}

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
