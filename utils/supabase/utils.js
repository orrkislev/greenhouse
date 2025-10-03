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

const groupsFields = ['name', 'type', 'description', 'metadata','message']
export const prepareForGroupsTable = obj => buildSafeUpdates(obj, groupsFields)

const projectsFields = ['title', 'description', 'student_id', 'status', 'metadata']
export const prepareForProjectsTable = obj => buildSafeUpdates(obj, projectsFields)

const eventsFields = ['title', 'description', 'date', 'start', 'end', 'created_by', 'metadata', 'repeat_weekly', 'day_of_the_week']
export const prepareForEventsTable = obj => buildSafeUpdates(obj, eventsFields)

const studyPathsFields = ['title', 'description', 'student_id', 'status', 'metadata', 'sources']
export const prepareForStudyPathsTable = obj => buildSafeUpdates(obj, studyPathsFields)

const tasksFields = ['title', 'description', 'student_id', 'status', 'due_date', 'metadata', 'position', 'goal', 'target_count', 'current_count', 'created_by']
export const prepareForTasksTable = obj => buildSafeUpdates(obj, tasksFields)

export const makeLink = async (a_table, a_id, b_table, b_id) => {
    const { error } = await supabase.from('links').insert({ a_table, a_id, b_table, b_id });
    if (error) throw error;
    return
}