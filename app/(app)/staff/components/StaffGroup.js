'use client'

import StaffGroup_Students from "./StaffGroup_Students";
import StaffGroup_Header from "./StaffGroup_Header";
import { useEffect, useState } from "react";
import { groupsActions } from "@/utils/store/useGroups";
import StaffGroup_Meetings from "./StaffGroup_Meetings";
import Box2 from "@/components/Box2";
import { Archive, Banana, Check, Plus, Trash2 } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';
import MessageEditor from "./MessageEditor";
import GroupTaskModal from "@/components/GroupTaskModal";
import Menu, { MenuItem, MenuList } from "@/components/Menu";
import StaffGroup_Evaluations from "./StaffGroup_Evaluations";
import Button from "@/components/Button";




export default function StaffGroup({ group }) {
    useEffect(() => {
        groupsActions.loadClassMembers(group);
    }, [group])

    return (
        <div className="flex flex-col gap-4 relative">
            <StaffGroup_Header group={group} />
            <div className="flex flex-col md:flex-row gap-4">
                <MessageEditor onSave={(value) => groupsActions.updateGroup(group, { message: value })} initialValue={group.message} />
                <GroupTasks group={group} />
            </div>
            <StaffGroup_Students group={group} />
            {group.type === 'class' && <StaffGroup_Meetings group={group} />}

            {/* <StaffGroup_Evaluations group={group} /> */}

            {group.type === 'club' && (
                <Menu className="absolute top-0 left-0">
                    <MenuList>
                        <MenuItem title="מחק מועדון" icon={Trash2} onClick={() => groupsActions.deleteGroup(group.id)} />
                    </MenuList>
                </Menu>
            )}
        </div>
    );
}




function GroupTasks({ group }) {
    const [showArchived, setShowArchived] = useState(false)

    useEffect(() => {
        groupsActions.loadGroupTasks(group.id);
    }, [group])

    const handleShowArchived = () => {
        if (!showArchived) groupsActions.loadGroupTasks(group.id, true);
        setShowArchived(v => !v)
    }

    const activeTasks = group.tasks || []
    const archivedTasks = showArchived ? (group.allTasks || []).filter(t => t.status === 'archived' || t.status === 'completed' || t.status === 'closed') : []

    return (
        <Box2 label="משימות" className="flex-1" LabelIcon={Banana}>
            {activeTasks.map((task) => (
                <GroupTask key={task.id} group={group} task={task} />
            ))}
            <NewTask group={group} />
            <div className="flex gap-2 items-center">
                <div className="border-b border-border w-8 h-1" />
                <button onClick={handleShowArchived} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1">
                    <Archive className="w-3 h-3" />
                    {showArchived ? 'הסתר ישנות' : 'משימות ישנות'}
                </button>
                <div className="border-b border-border flex-1 h-1" />
            </div>
            {showArchived && archivedTasks.map((task) => (
                <GroupTask key={task.id} group={group} task={task} archived />
            ))}
        </Box2>
    )
}

function GroupTask({ group, task, archived }) {
    const [open, setOpen] = useState(false)

    const students = group.members ? group.members.filter(member => member?.role === 'student') : []
    const completedBy = task.completed_by || []
    const assignedTo = task.assigned_to || []
    const total = assignedTo.length > 0 ? assignedTo.length : students.length

    return (
        <div className={`flex justify-between gap-1 border-b border-dashed group py-2 ${archived ? 'opacity-50' : ''}`}>
            <div className="flex justify-between">
                <div className="text-foreground hover:underline decoration-dashed cursor-pointer" onClick={() => setOpen(true)}>{task.title}</div>
            </div>

            <div className='flex justify-between'>
                <div className="flex gap-2 items-center text-xs">
                    <Check className="w-3 h-3" /> {completedBy.length} / {total}
                    {assignedTo.length > 0 && <span className="text-muted-foreground">(נבחרים)</span>}
                </div>
            </div>

            <GroupTaskModal group={group} task={task} isOpen={open} onClose={() => setOpen(false)} />
        </div>
    )
}

function NewTask({ group }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex py-2">
            <div>
                <Button data-role="new" variant="outline" size="sm" onClick={() => setOpen(true)} className="w-full">
                    <Plus className="w-4 h-4" />
                    משימה חדשה בקבוצה
                </Button>
            </div>
            {/* <button onClick={() => setOpen(true)} className="p-1 rounded-full bg-primary text-white hover:bg-primary/80 cursor-pointer"> */}
            {/* <Plus className="w-4 h-4" /> */}
            {/* </button> */}
            <GroupTaskModal group={group} isOpen={open} onClose={() => setOpen(false)} />
        </div>
    )
}