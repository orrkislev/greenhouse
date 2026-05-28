import { getSupabaseAdminClient } from "@/utils/supabase/server";
import ScreenClient from "./ScreenClient";

const SEMESTER_DEFAULTS = {
    A: { start_month: 1, start_day: 1, end_month: 2, end_day: 28 },
    B: { start_month: 4, start_day: 24, end_month: 6, end_day: 30 },
};

async function getServerSemester(supabase) {
    const { data: rows } = await supabase
        .from('misc')
        .select('name, data')
        .in('name', ['report_semester_A', 'report_semester_B']);
    const configs = Object.fromEntries(
        (rows || []).map(r => [r.name.replace('report_semester_', ''), r.data])
    );
    const now = new Date();
    const startYear = now.getMonth() < 7 ? now.getFullYear() - 1 : now.getFullYear();
    const academicYear = startYear + 1;
    for (const semId of ['A', 'B']) {
        const sem = { ...SEMESTER_DEFAULTS[semId], ...configs[semId] };
        const start = new Date(now.getFullYear(), sem.start_month - 1, sem.start_day);
        const end = new Date(now.getFullYear(), sem.end_month - 1, sem.end_day);
        if (now > start && now < end) return `${academicYear}${semId}`;
    }
    return `${academicYear}${now.getMonth() >= 3 && now.getMonth() <= 6 ? 'B' : 'A'}`;
}

export default async function ScreenPage({ params, searchParams }) {
    const { groupId } = await params;
    const { view } = await searchParams;
    const supabase = getSupabaseAdminClient();

    let groups = [];
    let error = null;

    // Semi-official backdoor to fetch all classes to display in the Lobby TV
    if (groupId === 'IShouldDefintelyBeAbleToDoThat') {
        const { data: classes, error: classesError } = await supabase
            .from('groups')
            .select('id')
            .eq('type', 'class');

        if (classesError) {
            error = classesError;
        } else if (classes) {
            const results = await Promise.all(
                classes.map(c => supabase.rpc('group_full_state', { p_group_id: c.id }))
            );

            // Check for errors in individual requests? For now just filter success
            groups = results
                .map(r => r.data)
                .filter(g => g !== null);

            if (groups.length === 0 && results.some(r => r.error)) {
                error = results.find(r => r.error).error;
            }
        }
    } else {
        // Validate UUID format to prevent database errors for invalid inputs like "undefined"
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(groupId)) {
            console.warn(`Invalid groupId format: ${groupId}`);
            // Use empty groups to trigger "Group not found" UI below
            groups = [];
        } else {
            const { data, error: groupError } = await supabase.rpc('group_full_state', {
                p_group_id: groupId,
            });
            if (groupError) error = groupError;
            if (data) groups = [data];
        }
    }

    if (error) {
        console.error('Error fetching group full state:', error);
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-4">שגיאה בטעינת הנתונים</h1>
                    <p className="text-muted-foreground">{error.message}</p>
                </div>
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-4">אוי לא מצאנו את הקבוצה</h1>
                    <p className="text-muted-foreground">נסה לרענן את הדף</p>
                </div>
            </div>
        );
    }

    let reportCardsData = null;
    if (view === 'report' && groups.length === 1) {
        const group = groups[0];
        if (group.type === 'class' || group.type === 'major') {
            const semester = await getServerSemester(supabase);
            const groupField = group.type === 'major' ? 'major' : 'class';
            const { data: reportCards } = await supabase
                .from('report_cards_public')
                .select('*')
                .eq(groupField, group.name)
                .eq('report_semester', semester);
            reportCardsData = {
                students: (reportCards || []).sort((a, b) => a.first_name.localeCompare(b.first_name, 'he')),
                semester,
            };
        }
    }

    // Fetch today's planned tasks for all students across all groups
    const allStudentIds = groups.flatMap(g => g.students?.map(s => s.id) || []);
    if (allStudentIds.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: plannedTasks } = await supabase
            .from('tasks')
            .select('id, title, student_id')
            .eq('planned_date', todayStr)
            .in('student_id', allStudentIds)
            .neq('status', 'completed')
            .neq('status', 'archived');

        if (plannedTasks && plannedTasks.length > 0) {
            const tasksByStudent = {};
            plannedTasks.forEach(t => {
                if (!tasksByStudent[t.student_id]) tasksByStudent[t.student_id] = [];
                tasksByStudent[t.student_id].push(t);
            });
            groups.forEach(group => {
                group.students?.forEach(student => {
                    student.plannedTasks = tasksByStudent[student.id] || [];
                });
            });
        }
    }

    return (
        <ScreenClient groups={groups} reportCardsData={reportCardsData} />
    );
}
