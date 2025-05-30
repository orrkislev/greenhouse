import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import NewStudentDrawer from "./NewStudentDrawer";
import EditStudentDrawer from "./EditStudentDrawer";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { Trash2 } from "lucide-react";

export default function AdminGroups({ groups, students }) {

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [currentGroupName, setCurrentGroupName] = useState("");
    const [newGroupName, setNewGroupName] = useState("");
    const [showNewGroupInput, setShowNewGroupInput] = useState(false);

    const displayGroups = [...groups];
    displayGroups.sort((a, b) => a.name.localeCompare(b.name));
    displayGroups.forEach(group => group.members = []);
    students.forEach(student => {
        const groupName = student.className
        const group = displayGroups.find(g => g.name === groupName);
        if (group) group.members.push(student);
        else {
            displayGroups.push({
                id: `group-${groupName}`,
                name: groupName,
                members: [student]
            });
        }
    })

    function handleNewMember(group) {
        setCurrentGroupName(group.name);
        setDrawerOpen(true);
    }

    function handleEditStudent(student) {
        setSelectedStudent(student);
        setEditDrawerOpen(true);
    }

    function handleCreateGroup() {
        if (!newGroupName.trim()) return;
        addDoc(collection(db, 'groups'), { name: newGroupName })
        setNewGroupName("");
        setShowNewGroupInput(false);
    }

    return (
        <div className="p-4 rounded-2xl bg-white shadow-md w-full">
            <div className="flex items-center mb-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowNewGroupInput(v => !v)}>
                    + New Group
                </Button>
                {showNewGroupInput && (
                    <form onSubmit={e => { e.preventDefault(); handleCreateGroup(); }} className="flex gap-2">
                        <input
                            className="border rounded px-2 py-1 text-sm"
                            type="text"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            placeholder="Group name"
                            autoFocus
                        />
                        <Button size="sm" type="submit">Add</Button>
                    </form>
                )}
            </div>
            <Accordion type="single" collapsible className="w-full">
                {displayGroups.map((group, index) => (
                    <AccordionItem key={group.id} value={group.id}>
                        <AccordionTrigger className="flex items-center justify-start w-full">
                            <GroupTitle group={group} />
                        </AccordionTrigger>
                        <AccordionContent className="p-2">
                            <GroupOpen group={group} groups={groups} clickNew={() => handleNewMember(group)} clickStudent={handleEditStudent} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <NewStudentDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                groupName={currentGroupName}
                groups={groups}
            />
            <EditStudentDrawer
                open={editDrawerOpen}
                onOpenChange={setEditDrawerOpen}
                student={selectedStudent}
                groups={groups}
            />
        </div>
    );
}

function GroupTitle({ group }) {
    const handleDeleteGroup = (e) => {
        e.stopPropagation();
        deleteDoc(doc(db, 'groups', group.id))
    };

    return (
        <div className="flex items-center justify-between w-full group">
            <span className="text-lg font-semibold">{group.name}</span>
            {group.members.length == 0 && (
                <button
                    type="button"
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 hover:scale-110 rounded p-1 cursor-pointer"
                    onClick={handleDeleteGroup}
                    tabIndex={-1}
                    aria-label="Delete group"
                >
                    <Trash2 className="w-4 h-4 text-red-500" />
                </button>
            )}
        </div>
    );
}

function GroupOpen({ group, clickNew, clickStudent }) {

    return (
        <>
            {group.members.sort((a, b) => a.firstName.localeCompare(b.firstName)).map(member => (
                <Button
                    key={member.id}
                    variant="ghost"
                    className="w-full justify-between text-left"
                    onClick={() => clickStudent(member)}
                >
                    <span>{member.firstName} {member.lastName}</span>
                </Button>
            ))}
            <Button variant="outline" size="sm" className="w-full"
                onClick={clickNew}>
                Add Member
            </Button>
        </>
    );
}