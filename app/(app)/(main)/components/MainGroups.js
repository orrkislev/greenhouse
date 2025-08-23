import Box2 from "@/components/Box2";
import { groupsActions, useInvolvedGroups } from "@/utils/store/useGroups";
import { useEffect } from "react";
import { TaskPill } from "./MainProject";
import { useUser } from "@/utils/store/useUser";
import { Check } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';

export default function MainGroups() {
    const groups = useInvolvedGroups();

    groups.forEach(group => {
        group.label = group.name;
        if (group.type === 'major') group.label = 'מגמת ' + group.name;
        if (group.type === 'class') group.label = 'קבוצת ' + group.name;
    })

    return (
        <div className="flex gap-3 flex-1">
            {groups.map(group => (
                <MainGroup key={group.id} group={group} />
            ))}
        </div>
    )
}

function MainGroup({ group }) {
    useEffect(() => {
        groupsActions.loadGroupTasks(group);
    }, [group])

    return (
        <Box2 label={group.label} className="flex-1">
            <div className="text-sm text-stone-500 w-full" dangerouslySetInnerHTML={{ __html: group.message }} />
            <div>
                {group.tasks && group.tasks.map((task) => (
                    <MainGroupTask key={task.id} group={group} task={task} />
                ))}
            </div>
        </Box2>
    )
}

function MainGroupTask({ group, task }) {
    const user = useUser((state) => state.user);
    const completed = task.completedBy ? task.completedBy.includes(user.id) : false;

    const onCheck = () => {
        groupsActions.completeTask(group, task, user.id);
    }

    return (
        <div className="flex items-center gap-2 group/task">
            <TaskPill tag={completed ? 'completed' : 'next'}>
                {task.text}
            </TaskPill>
            {!completed && (
                <div className='flex gap-2 items-center group-hover/task:opacity-100 opacity-0 transition-opacity'>
                    <button className='p-1 border border-emerald-400 hover:bg-emerald-200 rounded-full' onClick={onCheck}>
                        <Check className='w-4 h-4 text-emerald-400' />
                    </button>
                </div>
            )}
        </div>
    )
}