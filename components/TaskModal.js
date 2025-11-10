import { useEffect, useState } from "react";
import usePopper from "./Popper";
import WithLabel from "./WithLabel";
import Button, { ButtonGroup, ButtonGroupItem, IconButton } from "./Button";
import { Bookmark, CheckCircle, CircleX, Save, Trash2, X } from "lucide-react";
import { addDays, format } from "date-fns";
import ItemContextPicker from "./ItemContextPicker";
import { supabase } from "@/utils/supabase/client";
import { makeLink, unLink } from "@/utils/supabase/utils";
import { useUser } from "@/utils/store/useUser";
import { projectActions } from "@/utils/store/useProject";
import { studyActions } from "@/utils/store/useStudy";

export default function TaskModal({ task, isOpen, onClose: onCloseProp, context }) {
    const { open, Popper, close } = usePopper({ onClose: onCloseProp });

    useEffect(() => {
        if (isOpen && open) open();
    }, [isOpen, open]);

    return (
        <Popper>
            <TaskModalContent task={task} close={close} initialContext={context} />
        </Popper>
    )
}

function TaskModalContent({ task, close, initialContext }) {
    const [title, setTitle] = useState(task ? task.title : 'משימה חדשה');
    const [url, setUrl] = useState(task ? task.url : '');
    const [description, setDescription] = useState(task ? task.description : 'פירוט המשימה');
    const [due_date, setDueDate] = useState(task ? task.due_date : format(new Date(), 'yyyy-MM-dd'));
    const [context, setContext] = useState(initialContext);

    useEffect(() => {
        setContext(initialContext)
    }, [initialContext])

    useEffect(() => {
        if (!task) return;
        setTitle(task.title);
        setUrl(task.url);
        setDescription(task.description);
        setDueDate(task.due_date);
        setContext(task.context);
    }, [task])

    const handleSave = async () => {
        const taskContent = { title, description, due_date, url};
        if (!task) {
            const taskData = {
                student_id: useUser.getState().user.id,
                status: 'todo',
                ...taskContent,
            };
            if (context && context.table === 'projects') await projectActions.addTaskToProject(taskData, context.id);
            else if (context && context.table === 'study_paths') await studyActions.addStep(context.id, taskData);
            else {
                const { data, error } = await supabase.from('tasks').insert(taskData).select().single();
                if (error) throw error;
                if (context) await makeLink('tasks', data.id, context.table, context.id);
            }
        } else {
            if (task.context.table === 'projects') await projectActions.updateTask(task.id, taskContent);
            else if (task.context.table === 'study_paths') await studyActions.updateStep(task.context.id, task.id, taskContent);
            else await supabase.from('tasks').update(taskContent).eq('id', task.id);
            if (task.context && task.context.id !== context.id) {
                if (task.context.table === 'projects') await projectActions.unlinkTaskFromProject(task.id);
                else if (task.context.table === 'study_paths') await studyActions.unlinkStepFromPath(task.id);
                else await unLink('tasks', task.id, task.context.table, task.context.id);

                if (context.table === 'projects') await projectActions.linkTaskToProject(task, context.id);
                else if (context.table === 'study_paths') await studyActions.linkStepToPath(task, context.id);
                else if (context) await makeLink('tasks', task.id, context.table, context.id);
            }
        }
        close();
    };

    const handleDelete = async () => {
        if (task) {
            await supabase.from('tasks').delete().eq('id', task.id);
            if (task.context && task.context.table === 'study_paths') await studyActions.unlinkStepFromPath(task.id);
            else if (task.context && task.context.table === 'projects') await projectActions.deleteTask(task.id);
            else if (task.context) await unLink('tasks', task.id, task.context.table, task.context.id);
        }
        close();
    };

    const toggleTaskStatus = async () => {
        if (task?.context?.table === 'projects') projectActions.updateTask(task.id, { status: task.status === 'completed' ? 'todo' : 'completed' });
        else if (task?.context?.table === 'study_paths') studyActions.updateStep(task.context.id, task.id, { status: task.status === 'completed' ? 'todo' : 'completed' });
        else await supabase.from('tasks').update({ status: task.status === 'completed' ? 'todo' : 'completed' }).eq('id', task.id);
        close()
    };

    let headerText = task ? 'עריכת משימה' : 'משימה חדשה'
    if (context && context.table === 'study_paths') headerText = task ? 'עריכת שלב בתחום הלמידה' : 'שלב בתחום הלמידה חדש'

    return (
        <div className="flex flex-col gap-2 md:min-w-xl relative max-md:h-full max-md:w-[90vw]">
            <div className="flex gap-2 items-center max-md:pt-8">
                <span className="font-bold">{headerText}: </span>
                <ItemContextPicker context={context} onContextChange={setContext} />
            </div>
            <IconButton icon={X} onClick={close} className="absolute top-0 left-0 bg-white z-10 max-md:bg-transparent max-md:hover:bg-stone-100" />
            <WithLabel label="כותרת">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="rounded-sm p-2 border border-stone-200 w-full" />
            </WithLabel>
            <WithLabel label="תיאור">
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="rounded-sm p-2 border border-stone-200 w-full" />
            </WithLabel>
            {!context || context.table !== 'study_paths' && (
                <WithLabel label="תאריך">
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
                </WithLabel>
            )}
            <WithLabel label="קישור">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} className="rounded-sm p-2 border border-stone-200 w-full" />
            </WithLabel>
            {task && (
                <Button data-role="close" onClick={toggleTaskStatus} className={`w-full justify-center mt-4 bg-stone-200 border-stone-300 text-stone-700 ${task.status === 'completed' ? 'bg-green-200 opacity-50' : ''}`}>
                    {task.status === 'todo' ? (
                        <>סמן כבוצע <Bookmark className="w-4 h-4" /></>
                    ) : (
                        <>בוצע <CheckCircle className="w-4 h-4" /></>
                    )}
                </Button>
            )}
            <div className="flex justify-between gap-2 mt-2">
                <Button data-role="save" onClick={handleSave} className='flex-1 justify-center'>
                    {task ? 'שמירת שינויים' : 'הוספה'} 
                    <Save className="w-4 h-4" />
                </Button>
                <Button data-role="delete" onClick={handleDelete} >
                    {task ? <Trash2 className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    )
}