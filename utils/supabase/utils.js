import { supabase } from "./client";

function buildSafeUpdates(updates, allowedKeys) {
    const safe = {};
    for (const key of allowedKeys) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
            safe[key] = updates[key];
        }
    }
    return safe;
}

const usersFields = ['first_name', 'last_name', 'username', 'role', 'avatar_url', 'profile']
export const prepareForUsersTable = obj => buildSafeUpdates(obj, usersFields)

const groupsFields = ['name', 'type', 'description', 'metadata', 'message']
export const prepareForGroupsTable = obj => buildSafeUpdates(obj, groupsFields)

const projectsFields = ['title', 'description', 'student_id', 'status', 'metadata']
export const prepareForProjectsTable = obj => buildSafeUpdates(obj, projectsFields)

const eventsFields = ['title', 'description', 'date', 'start', 'end', 'created_by', 'metadata', 'repeat_weekly', 'day_of_the_week']
export const prepareForEventsTable = obj => buildSafeUpdates(obj, eventsFields)

const studyPathsFields = ['title', 'description', 'student_id', 'status', 'metadata', 'sources']
export const prepareForStudyPathsTable = obj => buildSafeUpdates(obj, studyPathsFields)

const tasksFields = ['title', 'description', 'student_id', 'status', 'due_date','url', 'metadata', 'position', 'goal', 'target_count', 'current_count', 'created_by']
export const prepareForTasksTable = obj => buildSafeUpdates(obj, tasksFields)

const logsFields = ['user_id', 'action_type', 'text', 'metadata', 'mentor_id', 'context_table', 'context_id']
export const prepareForLogsTable = obj => buildSafeUpdates(obj, logsFields)


export const unLink = async (a_table, a_id, b_table, b_id) => {
    const { data, error: linkError } = await supabase
        .from('links').delete()
        .or([
            `and(a_table.eq.${a_table},a_id.eq.${a_id},b_table.eq.${b_table},b_id.eq.${b_id})`,
            `and(a_table.eq.${b_table},a_id.eq.${b_id},b_table.eq.${a_table},b_id.eq.${a_id})`,
        ].join(','))
    if (linkError) throw linkError;
    return data;
}

export const makeLink = async (a_table, a_id, b_table, b_id) => {
    console.log('making link', a_table, a_id, b_table, b_id)
    const { data, error: linkError } = await supabase
        .from('links')
        .select('id')
        .or(
            [
                `and(a_table.eq.${a_table},a_id.eq.${a_id},b_table.eq.${b_table},b_id.eq.${b_id})`,
                `and(a_table.eq.${b_table},a_id.eq.${b_id},b_table.eq.${a_table},b_id.eq.${a_id})`,
            ].join(',')
        );

    if (linkError) throw linkError;
    console.log('got data', data, linkError)
    if (data && data.length > 0) return;

    const { error: insertError } = await supabase.from('links').insert({ a_table, a_id, b_table, b_id });
    if (insertError) throw insertError;
    console.log('inserted data', insertError)
    return
}