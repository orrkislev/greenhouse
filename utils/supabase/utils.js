import { supabase } from "./client";
import { toastsActions } from "../store/useToasts";

export * from "./schema";


export const unLink = async (a_table, a_id, b_table, b_id) => {
    const { data, error: linkError } = await supabase
        .from('links').delete()
        .or([
            `and(a_table.eq.${a_table},a_id.eq.${a_id},b_table.eq.${b_table},b_id.eq.${b_id})`,
            `and(a_table.eq.${b_table},a_id.eq.${b_id},b_table.eq.${a_table},b_id.eq.${a_id})`,
        ].join(','))
    if (linkError) toastsActions.addFromError(linkError, 'שגיאה במחיקת קישור');
    return data;
}

export const makeLink = async (a_table, a_id, b_table, b_id) => {
    const { data, error: linkError } = await supabase
        .from('links')
        .select('id')
        .or(
            [
                `and(a_table.eq.${a_table},a_id.eq.${a_id},b_table.eq.${b_table},b_id.eq.${b_id})`,
                `and(a_table.eq.${b_table},a_id.eq.${b_id},b_table.eq.${a_table},b_id.eq.${a_id})`,
            ].join(',')
        );

    if (linkError) toastsActions.addFromError(linkError, 'שגיאה ביצירת קישור');
    if (data && data.length > 0) return data;

    const { error: insertError } = await supabase.from('links').insert({ a_table, a_id, b_table, b_id });
    if (insertError) toastsActions.addFromError(insertError, 'שגיאה ביצירת קישור');
    return data;
}