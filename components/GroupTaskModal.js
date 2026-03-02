import { useEffect, useState } from "react";
import usePopper from "./Popper";
import WithLabel from "./WithLabel";
import Button, { ButtonGroup, ButtonGroupItem, IconButton } from "./Button";
import { Archive, CheckCircle, CircleX, Save, Trash2, X } from "lucide-react";
import { addDays, format } from "date-fns";
import { isStaff, useUser } from "@/utils/store/useUser";
import { groupsActions } from "@/utils/store/useGroups";
import { AvatarGroup } from "./Avatar";

export default function GroupTaskModal({ task, group, isOpen, onClose: onCloseProp, initialAssignedTo }) {
    const { open, Popper, close } = usePopper({ onClose: onCloseProp });

    useEffect(() => {
        if (isOpen && open) open();
    }, [isOpen, open]);

    return (
        <Popper>
            <TaskModalContent task={task} close={close} group={group} initialAssignedTo={initialAssignedTo} />
        </Popper>
    )
}

function TaskModalContent({ task, close, group, initialAssignedTo }) {
    const [title, setTitle] = useState(task ? task.title : 'משימה חדשה בקבוצה');
    const [description, setDescription] = useState(task ? task.description : 'פירוט המשימה בקבוצה');
    const [due_date, setDueDate] = useState(task ? task.due_date : format(new Date(), 'yyyy-MM-dd'));
    const [assignedTo, setAssignedTo] = useState(task ? (task.assigned_to || []) : (initialAssignedTo || []));
    const user = useUser(state => state.user);

    const isMentor = isStaff();
    const students = group.members ? group.members.filter(m => m?.role === 'student') : [];
    const completedBy = task?.completed_by || [];
    const isWholeGroup = assignedTo.length === 0;

    useEffect(() => {
        if (!task) return;
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(task.due_date);
        setAssignedTo(task.assigned_to || []);
    }, [task])

    const handleSave = async () => {
        if (!task) {
            groupsActions.createGroupTask(group, title, description, due_date, assignedTo);
            close();
        } else {
            groupsActions.updateGroupTask(group, task, { title, description, due_date, assigned_to: assignedTo });
            close();
        }
    };

    const handleDelete = async () => {
        groupsActions.deleteGroupTask(group, task);
        close();
    };

    const handleArchive = async () => {
        groupsActions.archiveGroupTask(group, task);
        close();
    };

    const toggleTaskStatus = async () => {
        groupsActions.toggleGroupTaskStatus(group, task);
        close();
    };

    const toggleStudent = (studentId) => {
        setAssignedTo(prev =>
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    const headerText = task ? (isMentor ? 'עריכת משימה בקבוצת' : 'משימה בקבוצת') : 'משימה חדשה בקבוצת'

    return (
        <div className="flex flex-col gap-2 min-w-xl relative max-w-[60vw] max-h-[70vh] overflow-y-auto">
            <div className="flex gap-2 items-center">
                <span className="font-bold">{headerText} {group.name}: </span>
            </div>
            <IconButton icon={X} onClick={close} className="absolute top-0 left-0 bg-white" />
            <WithLabel label="כותרת">
                {isMentor ? (
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="rounded-sm p-2 border border-stone-100 w-full" />
                ) : (
                    <div className="text-sm text-stone-500">{title}</div>
                )}
            </WithLabel>
            <WithLabel label="תיאור">
                {isMentor ? (
                    <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="rounded-sm p-2 border border-stone-100 w-full" />
                ) : (
                    <div className="text-sm text-stone-500">{description}</div>
                )}
            </WithLabel>

            <WithLabel label="תאריך">
                {isMentor ? (
                    <>
                        <input type="date" value={new Date(due_date).toISOString().split('T')[0]} onChange={e => setDueDate(e.target.value)} />
                        <ButtonGroup>
                            <ButtonGroupItem onClick={() => setDueDate(format(new Date(), 'yyyy-MM-dd'))} active={due_date === format(new Date(), 'yyyy-MM-dd')}>
                                היום
                            </ButtonGroupItem>
                            <ButtonGroupItem onClick={() => setDueDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'))} active={due_date === format(addDays(new Date(), 1), 'yyyy-MM-dd')}>
                                מחר
                            </ButtonGroupItem>
                            <ButtonGroupItem onClick={() => setDueDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'))} active={due_date === format(addDays(new Date(), 7), 'yyyy-MM-dd')}>
                                עוד שבוע
                            </ButtonGroupItem>
                        </ButtonGroup>
                    </>
                ) : (
                    <div className="text-sm text-stone-500">{new Date(due_date).toLocaleString('he-IL', { month: 'short', day: 'numeric' })}</div>
                )}
            </WithLabel>

            {isMentor && students.length > 0 && (
                <WithLabel label="מיועד ל">
                    <div className="flex flex-row flex-wrap gap-x-4 gap-y-1">
                        <label className="flex items-center gap-2 text-sm cursor-pointer w-full">
                            <input type="checkbox" checked={isWholeGroup} onChange={() => setAssignedTo(isWholeGroup ? students.map(s => s.id) : [])} />
                            כל הקבוצה
                        </label>
                        {students.map(student => (
                            <label key={student.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isWholeGroup || assignedTo.includes(student.id)}
                                    onChange={() => toggleStudent(student.id)}
                                />
                                {student.first_name} {student.last_name}
                            </label>
                        ))}
                    </div>
                </WithLabel>
            )}

            {task && isMentor && (
                <>
                    <WithLabel label="סיימו">
                        <AvatarGroup users={completedBy.map(id => group.members?.find(m => m.id === id)).filter(Boolean)} />
                    </WithLabel>
                    <WithLabel label="לא סיימו">
                        <AvatarGroup users={students.filter(m => !completedBy.includes(m.id) && (isWholeGroup || assignedTo.includes(m.id)))} />
                    </WithLabel>
                </>
            )}

            {task && !isMentor && (
                <Button data-role="close" onClick={toggleTaskStatus} className={`w-full justify-center mt-4 ${task.status === 'completed' ? 'bg-green-200 opacity-50' : ''}`}>
                    {completedBy.includes(user.id) ? (
                        <>לא סיימתי <CircleX className="w-4 h-4" /></>
                    ) : (
                        <>סיימתי <CheckCircle className="w-4 h-4" /></>
                    )}
                </Button>
            )}

            {isMentor && (
                <div className="flex justify-between gap-2 mt-2">
                    <Button data-role="save" onClick={handleSave} className='flex-[2]'>
                        שמירה <Save className="w-4 h-4" />
                    </Button>
                    {task && (
                        <Button data-role="archive" onClick={handleArchive} title="ארכיון">
                            <Archive className="w-4 h-4" />
                        </Button>
                    )}
                    <Button data-role="delete" onClick={handleDelete}>
                        {task ? <Trash2 className="w-4 h-4" /> : <CircleX className="w-4 h-4 flex-[1]" />}
                    </Button>
                </div>
            )}
        </div>
    )
}