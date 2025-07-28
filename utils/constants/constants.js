export const TASK_STATUSES = {
    ACTIVE: "active",
    COMPLETED: "completed",
    OVERDUE: "overdue",
    DISABLED: "disabled",
    PENDING: "pending", // waiting for dependencies
    SCHEDULED: "scheduled", // future start date
    CANCELLED: "cancelled", // intentionally removed
    FAILED: "failed", // marked as failed
};

export const TASK_TYPES = {
    STUDENT_CREATED: "student_created",
    MENTOR_CREATED: "mentor_created",
    GROUP_TASK: "group_task",
    SYSTEM_GENERATED: "system_generated",
};

export const TASK_FORMATS = {
    FLOATING: "floating",
    DATE_BASED: "date_based",
    WEEKLY_GOAL: "weekly_goal",
    PROGRESS_BASED: "progress_based",
    REMINDER: "reminder",
    DEPENDENT: "dependent",
};

export const CONTEXT_TAGS = {
    PROJECT: "project",
    STUDY_FIELD: "study_field",
    PATHWAY: "pathway",
    GENERAL: "general",
};




export const LOG_TYPES = {
    COMPLETE_TASK: "complete_task",
    CANCEL_TASK: "cancel_task",
    TASK_PROGRESS: "task_progress",
    COMMENT: "comment",
    MEETING: "meeting",
    JOURNAL: "journal",
    BREAKTHROUGH: "breakthrough",
    SYSTEM_NOTIFICATION: "system_notification",
};

export const LOG_RECORDS = {
    STARTED_PROJECT: "started_project",
    FINISHED_PROJECT_PROPOSAL: "finished_project_proposal",
}