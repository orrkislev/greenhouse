import Box2 from "@/components/Box2";
import { groupsActions, useUserGroups } from "@/utils/store/useGroups";
import { useEffect, useState } from "react";
import { isStaff, useUser } from "@/utils/store/useUser";
import { Check, CheckSquare, Square, Users2 } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';
import { IconButton } from "@/components/Button";
import GroupTaskModal from "@/components/GroupTaskModal";

export default function MainGroups() {
    const groups = useUserGroups();

    groups.forEach(group => {
        group.label = group.name;
        if (group.type === 'major') group.label = 'מגמת ' + group.name;
        if (group.type === 'class') group.label = 'קבוצת ' + group.name;
    })

    return (
        <div className={`row-span-3 flex flex-col gap-4`}>
            <Box2 label="קבוצות" className="flex-1" LabelIcon={Users2}>
                <div className="flex flex-col gap-2 divide-y divide-stone-200">
                    {groups.map(group => (
                        <MainGroup key={group.id} group={group} />
                    ))}
                </div>
            </Box2>
        </div>
    )
}

function MainGroup({ group }) {
    useEffect(() => {
        groupsActions.loadGroupTasks(group.id);
        groupsActions.loadWeekEvents(group.id);
    }, [group])

    const groupName = group.type === 'class' ? 'קבוצת ' + group.name : group.type === 'major' ? 'מגמת ' + group.name : group.name;

    return (
        <div className="flex flex-col gap-2">
            <div className="text-sm text-foreground flex items-center gap-2">
                <Users2 className="w-4 h-4" />
                {groupName}
            </div>
            {group.message ? (
                <div className="text-sm text-muted-foreground w-full" dangerouslySetInnerHTML={{ __html: group.message }} />
            ) : (
                <div className="text-xs text-muted-foreground w-full">אין הודעה</div>
            )}
            <div>
                {group.tasks && group.tasks.map((task) => (
                    <MainGroupTask key={task.id} group={group} task={task} />
                ))}
            </div>
        </div>
    )
}

function MainGroupTask({ group, task }) {
    const user = useUser((state) => state.user);
    const [open, setOpen] = useState(false)
    const isMentor = isStaff()

    useEffect(() => {
        if (isMentor) groupsActions.loadClassMembers(group);
    }, [isMentor])

    const onCheck = () => {
        if (isMentor) return;
        groupsActions.toggleGroupTaskStatus(group, task);
    }

    const students = group.members ? group.members.filter(member => member.role === 'student') : []
    const completedStudents = task.completed || []

    return (
        <div className="flex flex-col gap-2">
            <div className='flex items-center gap-2 group/task'>
                {!isMentor && (
                    <IconButton icon={task.status === 'completed' ? CheckSquare : Square} onClick={onCheck} className="" />
                )}
                <div className="flex flex-col hover:underline decoration-dashed cursor-pointer" onClick={() => setOpen(true)}>
                    <span className="text-sm text-foreground">{task.title}</span>
                    <span className='text-xs text-muted-foreground'> {task.description}</span>
                </div>

            </div>
            {isMentor && (
                <div className="flex gap-1 items-center text-xs">
                    <Check className="w-3 h-3" />  {students.length} / {completedStudents.length}
                </div>
            )}
            <GroupTaskModal task={task} group={group} isOpen={open} onClose={() => setOpen(false)} />
        </div>
    )
}