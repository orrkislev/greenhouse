'use client'

import StaffGroup_Students from "./StaffGroup_Students";
import StaffGroup_Header from "./StaffGroup_Header";
import { useEffect, useState } from "react";
import { groupsActions } from "@/utils/store/useGroups";
import StaffGroup_Meetings from "./StaffGroup_Meetings";
import Box2 from "@/components/Box2";
import { useUser } from "@/utils/store/useUser";
import { Archive, Check, Plus, Trash } from "lucide-react";
import { AvatarGroup } from "@/components/Avatar";
import 'react-quill-new/dist/quill.snow.css';
import MessageEditor from "./MessageEditor";




export default function StaffGroup({ group }) {
    useEffect(() => {
        groupsActions.loadClassStudents(group);
    }, [group])

    return (
        <div className="flex flex-col gap-4">
            <StaffGroup_Header group={group} />
            <div className="flex gap-4 ">
                <MessageEditor onSave={(value) => groupsActions.updateGroup(group, { message: value })} initialValue={group.message} />
                <GroupTasks group={group} />
            </div>
            <StaffGroup_Students group={group} />
            {group.type === 'class' && <StaffGroup_Meetings group={group} />}
        </div>
    );
}




function GroupTasks({ group }) {

    useEffect(() => {
        groupsActions.loadGroupTasks(group);
    }, [group])

    return (
        <Box2 label="משימות" className="flex-1">
            {group.tasks && group.tasks.map((task) => (
                <GroupTask key={task.id} group={group} task={task} />
            ))}
            <NewTask group={group} />
        </Box2>
    )
}

function GroupTask({ group, task }) {

    const studentsFinished = group.students ? group.students.filter(student => task.completedBy && task.completedBy.includes(student.id)) : [];

    return (
        <div className="flex group gap-16 items-start">
            <div className="flex flex-col gap-1">
                <div className="flex gap-1 items-center">
                    <AvatarGroup users={studentsFinished} />
                    <div className="">{task.text}</div>
                </div>
                <div className="flex gap-1 text-xs text-stone-500 items-center"> <Check className="w-3 h-3" />  {group.students && group.students.length} / {studentsFinished.length}</div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex gap-1 p-1">
                <button onClick={() => groupsActions.updateGroupTask(group, task, { active: false })} className="p-1 rounded-full hover:bg-stone-100 cursor-pointer">
                    <Archive className="w-4 h-4" />
                </button>
                <button onClick={() => groupsActions.deleteGroupTask(group, task)} className="p-1 rounded-full hover:bg-stone-100 cursor-pointer">
                    <Trash className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

function NewTask({ group }) {
    const [isEditing, setIsEditing] = useState(false);
    const user = useUser(state => state.user);
    if (!user || !user.id) return null;

    if (!isEditing) {
        return (
            <div>
                <button onClick={() => setIsEditing(true)} className="p-1 rounded-full bg-primary text-white hover:bg-primary/80 cursor-pointer">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        )
    }

    const onCreate = (text) => {
        groupsActions.createGroupTask(group, {
            text,
            active: true,
            createdBy: user.id,
        });
        setIsEditing(false);
    }

    return (
        <div>
            <input type="text" placeholder="משימה חדשה" onBlur={(e) => onCreate(e.target.value)} />
        </div>
    )
}