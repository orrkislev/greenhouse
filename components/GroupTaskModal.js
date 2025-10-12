import { useEffect, useState } from "react";
import usePopper from "./Popper";
import WithLabel from "./WithLabel";
import Button, { ButtonGroup, ButtonGroupItem, IconButton } from "./Button";
import { CheckCircle, CircleX, Save, Trash2, X } from "lucide-react";
import { addDays, format } from "date-fns";
import { isStaff } from "@/utils/store/useUser";
import { groupsActions } from "@/utils/store/useGroups";
import { AvatarGroup } from "./Avatar";

export default function GroupTaskModal({ task, group, isOpen, onClose: onCloseProp }) {
    const { open, Popper, close } = usePopper({ onClose: onCloseProp });

    useEffect(() => {
        if (isOpen && open) open();
    }, [isOpen, open]);

    return (
        <Popper>
            <TaskModalContent task={task} close={close} group={group} />
        </Popper>
    )
}

function TaskModalContent({ task, close, group }) {
    const [title, setTitle] = useState(task ? task.title : 'משימה חדשה בקבוצה');
    const [description, setDescription] = useState(task ? task.description : 'פירוט המשימה בקבוצה');
    const [due_date, setDueDate] = useState(task ? task.due_date : format(new Date(), 'yyyy-MM-dd'));

    const isMentor = isStaff()

    useEffect(() => {
        if (!task) return;
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(task.due_date);
    }, [task])

    const handleSave = async () => {
        if (!task) {
            groupsActions.createGroupTask(group, title, description, due_date);
            close();
        } else {
            groupsActions.updateGroupTask(group, task, { title, description, due_date });
            close();
        }
    };

    const handleDelete = async () => {
        groupsActions.deleteGroupTask(group, task);
        close();
    };

    const toggleTaskStatus = async () => {
        groupsActions.toggleGroupTaskStatus(group, task);
    };

    const headerText = task ? (isMentor ? 'עריכת משימה בקבוצת' : 'משימה בקבוצת') : 'משימה חדשה בקבוצת'

    return (
        <div className="flex flex-col gap-2 min-w-xl relative">
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

            {task && isMentor && (
                <>
                    <WithLabel label="סיימו">
                        <AvatarGroup users={task.completed.map(id => group.members.find(member => member.id === id))} />
                    </WithLabel>
                    <WithLabel label="לא סיימו">
                        <AvatarGroup users={group.members && group.members.filter(member => !task.completed.includes(member.id) && member.role === 'student')} />
                    </WithLabel>
                </>
            )}


            {task && !isMentor && (
                <Button data-role="close" onClick={toggleTaskStatus} className={`w-full justify-center mt-4 ${task.status === 'completed' ? 'bg-green-200 opacity-50' : ''}`}>
                    {task.completed && task.completed.includes(user.id) ? (
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
                    <Button data-role="delete" onClick={handleDelete} >
                        {task ? <Trash2 className="w-4 h-4" /> : <CircleX className="w-4 h-4 flex-[1]" />}
                    </Button>
                </div>
            )}
        </div>
    )
}