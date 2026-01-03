import { getSupabaseAdminClient } from "@/utils/supabase/server";
import ScreenClient from "./ScreenClient";

export default async function ScreenPage({ params }) {
    const { groupId } = await params;
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.rpc('group_full_state', {
        p_group_id: groupId,
    });

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

    if (!data) {
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
        <ScreenClient group={data}/>
    );
}
