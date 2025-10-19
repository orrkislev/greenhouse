import Box2 from "@/components/Box2";
import { groupsActions, useUserGroups } from "@/utils/store/useGroups";
import { useEffect, useState } from "react";
import { isStaff, useUser } from "@/utils/store/useUser";
import { Check, CheckSquare, PartyPopper, Square } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';
import { AvatarGroup } from "@/components/Avatar";
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
        <div className={`col-span-2 row-span-${groups.length} flex flex-col gap-4`}>
            {groups.map(group => (
                <MainGroup key={group.id} group={group} />
            ))}
        </div>
    )
}

function MainGroup({ group }) {
    useEffect(() => {
        groupsActions.loadGroupTasks(group.id);
        groupsActions.loadWeekEvents(group.id);
    }, [group])

    return (
        <Box2 label={group.label} description={group.description} className="flex-1 relative" LabelIcon={PartyPopper}>
            <div className="text-sm text-stone-500 w-full" dangerouslySetInnerHTML={{ __html: group.message }} />
            <div>
                {group.tasks && group.tasks.map((task) => (
                    <MainGroupTask key={task.id} group={group} task={task} />
                ))}
            </div>

            {/* <AvatarGroup users={group.mentors} className='absolute bottom-1 left-1' /> */}
        </Box2>
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
                    <span className="text-sm text-stone-700">{task.title}</span>
                    <span className='text-xs text-stone-500'> {task.description}</span>
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