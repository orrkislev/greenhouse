function buildSafeUpdates(updates, allowedKeys) {
    const safe = {};
    for (const key of allowedKeys) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
            safe[key] = updates[key];
        }
    }
    return safe;
}

const usersFields = ['username', 'first_name', 'last_name', 'role', 'active', 'is_admin']
export const prepareForUsersTable = obj => buildSafeUpdates(obj, usersFields)

const userProfilesFields = ['avatar_url', 'profile', 'portfolio_url', 'cv_url', 'title', 'id_number', 'googleRefreshToken']
export const prepareForUserProfilesTable = obj => buildSafeUpdates(obj, userProfilesFields)

const groupsFields = ['name', 'type', 'description', 'metadata', 'message']
export const prepareForGroupsTable = obj => buildSafeUpdates(obj, groupsFields)

const projectsFields = ['title', 'student_id', 'status', 'metadata', 'term', 'master']
export const prepareForProjectsTable = obj => buildSafeUpdates(obj, projectsFields)

const eventsFields = ['title', 'date', 'start', 'end', 'created_by', 'metadata', 'day_of_the_week', 'group_id']
export const prepareForEventsTable = obj => buildSafeUpdates(obj, eventsFields)

const studyPathsFields = ['title', 'description', 'student_id', 'status', 'metadata', 'sources', 'vocabulary']
export const prepareForStudyPathsTable = obj => buildSafeUpdates(obj, studyPathsFields)

const tasksFields = ['title', 'description', 'student_id', 'status', 'due_date', 'url', 'metadata', 'position', 'goal', 'target_count', 'current_count', 'created_by']
export const prepareForTasksTable = obj => buildSafeUpdates(obj, tasksFields)

const logsFields = ['user_id', 'action_type', 'text', 'metadata', 'mentor_id', 'context_table', 'context_id']
export const prepareForLogsTable = obj => buildSafeUpdates(obj, logsFields)
