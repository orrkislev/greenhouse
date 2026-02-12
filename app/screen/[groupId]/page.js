import { getSupabaseAdminClient } from "@/utils/supabase/server";
import ScreenClient from "./ScreenClient";

export default async function ScreenPage({ params }) {
    const { groupId } = await params;
    const supabase = getSupabaseAdminClient();

    let groups = [];
    let error = null;

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

    return (
        <ScreenClient groups={groups} />
    );
}
