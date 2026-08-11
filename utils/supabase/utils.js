export * from "./schema";

// Wraps a Supabase update query and throws if no rows were matched.
// Catches both RLS-blocked updates and missing rows, which Supabase
// otherwise reports as success with 0 affected rows.
export async function updateOrThrow(query) {
    const { data, error } = await query.select('id');
    if (error) throw error;
    if (!data?.length) throw new Error('Update matched no rows');
    return data;
}