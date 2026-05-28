'use client'

import { useUser } from "@/utils/store/useUser"
import AuthGoogleCalendar from "@/app/(app)/(main)/components/AuthGoogleCalendar";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, GripVertical, Plus, Trash2, X } from "lucide-react";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { usePlanning, planningActions } from "@/utils/store/usePlanning";
import { useProjectData, projectActions } from "@/utils/store/useProject";
import { useStudy, studyActions } from "@/utils/store/useStudy";
import { useGroups } from "@/utils/store/useGroups";
import { format } from "date-fns";

export default function ScheduleContext() {
    const user = useUser(state => state.user);

    return (
        <div className="flex flex-col gap-4">
            <TasksPanel />
            {!user.googleRefreshToken && <AuthGoogleCalendar />}
        </div>
    )
}

// ─── Tasks Panel ──────────────────────────────────────────────────────────────

function TasksPanel() {
    const personalTasks = usePlanning(state => state.personalTasks);
    const assignedTasks = usePlanning(state => state.assignedTasks);
    const projectTasks = useProjectData(state => state.tasks);
    const paths = useStudy(state => state.paths);
    const groups = useGroups(state => state.groups);

    useEffect(() => {
        planningActions.loadAllTasks();
        projectActions.loadTasks();
        studyActions.loadPaths();
    }, []);

    const studyTasks = paths.flatMap(path =>
        (path.steps || []).map(step => ({ ...step, _pathTitle: path.title }))
    );

    const today = format(new Date(), 'yyyy-MM-dd');
    const isUnplanned = t => t.planned_date !== today && t.status !== 'completed' && t.status !== 'archived';

    const unplannedPersonal = personalTasks.filter(isUnplanned);
    const unplannedProject = projectTasks.filter(isUnplanned);
    const unplannedStudy = studyTasks.filter(isUnplanned);

    // Group assigned tasks by group_id — one section per group, skip empty groups
    const tasksByGroup = {};
    assignedTasks.filter(isUnplanned).forEach(t => {
        const key = t.group_id || 'unknown';
        if (!tasksByGroup[key]) tasksByGroup[key] = [];
        tasksByGroup[key].push(t);
    });

    return (
        <div className="flex flex-col gap-2">
            <div className="font-semibold text-sm text-foreground">משימות</div>
            <TaskSection title="אישי" tasks={unplannedPersonal} source="personal" defaultOpen />
            {Object.entries(tasksByGroup).map(([groupId, tasks]) => {
                const groupName = groups.find(g => g.id === groupId)?.name || 'קבוצה';
                return <TaskSection key={groupId} title={groupName} tasks={tasks} source="assigned" />;
            })}
            <TaskSection title="פרויקט" tasks={unplannedProject} source="project" />
            <TaskSection title="למידה" tasks={unplannedStudy} source="study" />
        </div>
    );
}

function TaskSection({ title, tasks, source, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    const [adding, setAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const inputRef = useRef(null);
    const isPersonal = source === 'personal';

    useEffect(() => {
        if (adding && inputRef.current) inputRef.current.focus();
    }, [adding]);

    const handleAddTask = (e) => {
        e?.preventDefault();
        const trimmed = newTaskTitle.trim();
        if (trimmed) planningActions.addPersonalTask(trimmed);
        setNewTaskTitle('');
        setAdding(false);
    };

    const sourceColors = {
        personal: 'bg-blue-100 text-blue-700',
        assigned: 'bg-orange-100 text-orange-700',
        project: 'bg-green-100 text-green-700',
        study: 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="border border-border rounded-md overflow-hidden">
            <button
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold bg-muted hover:bg-muted/80 transition-colors"
                onClick={() => setOpen(o => !o)}
            >
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${sourceColors[source] || 'bg-stone-100 text-stone-700'}`}>{title}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <span>{tasks.length}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {open && (
                <div className="flex flex-col gap-1 p-2">
                    {tasks.map(task => (
                        <DraggableTaskCard key={task.id} task={task} source={source} />
                    ))}

                    {isPersonal && (
                        adding ? (
                            <form onSubmit={handleAddTask} className="flex gap-1 mt-1">
                                <input
                                    ref={inputRef}
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    onBlur={handleAddTask}
                                    onKeyDown={e => e.key === 'Escape' && (setAdding(false), setNewTaskTitle(''))}
                                    placeholder="שם המשימה..."
                                    className="flex-1 text-xs border border-primary rounded px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </form>
                        ) : (
                            <button
                                onClick={() => setAdding(true)}
                                className="flex items-center gap-1.5 mt-1 w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded px-2 py-1.5 transition-colors border border-dashed border-border"
                            >
                                <Plus className="w-3 h-3" />
                                הוסף משימה
                            </button>
                        )
                    )}

                    {tasks.length === 0 && !isPersonal && (
                        <div className="text-xs text-muted-foreground text-center py-1">אין משימות</div>
                    )}
                </div>
            )}
        </div>
    );
}

function DraggableTaskCard({ task, source }) {
    const elementRef = useRef(null);
    const gripRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const today = format(new Date(), 'yyyy-MM-dd');
    const isPlannedToday = task.planned_date === today;

    useEffect(() => {
        const grip = gripRef.current;
        if (!grip) return;
        return draggable({
            element: grip,
            getInitialData: () => ({ taskId: task.id, taskTitle: task.title, source, type: 'planning-task' }),
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });
    }, [task.id, source]);

    const planToday = (e) => {
        e.stopPropagation();
        planningActions.setPlannedDate(task.id, today);
    };

    const unplan = (e) => {
        e.stopPropagation();
        planningActions.setPlannedDate(task.id, null);
    };

    return (
        <div
            ref={elementRef}
            className={`flex items-center gap-1.5 rounded px-2 py-1.5 text-xs border border-border bg-background transition-all duration-150
                ${isDragging ? 'opacity-40 scale-95' : 'hover:bg-muted'}
                ${isPlannedToday ? 'border-green-300 bg-green-50' : ''}`}
        >
            <div ref={gripRef} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0">
                <GripVertical className="w-3 h-3" />
            </div>
            <span className="flex-1 truncate text-foreground">{task.title}</span>
            {task._pathTitle && (
                <span className="text-[10px] text-purple-500 shrink-0 truncate max-w-[50px]">{task._pathTitle}</span>
            )}
            {isPlannedToday ? (
                <button onClick={unplan} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors" title="הסר מהיום">
                    <X className="w-3 h-3" />
                </button>
            ) : (
                <button onClick={planToday} className="shrink-0 text-muted-foreground hover:text-green-600 transition-colors" title="תכנן להיום">
                    <Plus className="w-3 h-3" />
                </button>
            )}
            {source === 'personal' && (
                <button
                    onClick={e => { e.stopPropagation(); planningActions.deletePersonalTask(task.id); }}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    title="מחק משימה"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}
