/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string|null} displayName
 * @property {string|null} photoURL
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {boolean} completed
 * @property {'low'|'medium'|'high'} priority
 * @property {string} [category]
 * @property {number} [estimatedTime]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} DaySchedule
 * @property {string} id
 * @property {0|1|2|3|4|5|6} dayOfWeek
 * @property {Date} date
 * @property {Task[]} tasks
 * @property {string} [notes]
 */

/**
 * @typedef {Object} WeeklySchedule
 * @property {string} id
 * @property {string} userId
 * @property {Date} weekStartDate
 * @property {string} title
 * @property {string} [description]
 * @property {DaySchedule[]} days
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} ScheduleFormData
 * @property {string} title
 * @property {string} [description]
 * @property {Date} weekStartDate
 */

/**
 * @typedef {Object} TaskFormData
 * @property {string} title
 * @property {string} [description]
 * @property {'low'|'medium'|'high'} priority
 */
