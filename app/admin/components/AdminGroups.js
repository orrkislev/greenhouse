import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import NewStudentDrawer from "./NewStudentDrawer";
import EditStudentDrawer from "./EditStudentDrawer";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { Trash2 } from "lucide-react";
import { addAdmin, createGroup, removeAdmin } from "../actions/group actions";

export default function AdminGroups({ groups, students, staff }) {

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
        else throw new Error(`Group ${groupName} not found for student ${student.firstName} ${student.lastName}`);
    });
    displayGroups.forEach(group => {
        group.displayAdmins = group.admins
            .map(adminId => staff.find(s => s.id === adminId))
            .filter(admin => admin !== undefined);
    });

    function handleNewMember(group) {
        setCurrentGroupName(group.name);
        setDrawerOpen(true);
    }

    function handleEditStudent(student) {
        setSelectedStudent(student);
        setEditDrawerOpen(true);
    }

    const handleCreateGroup = async () => {
        await createGroup(newGroupName);
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
                            <GroupOpen group={group} groups={groups} clickNew={() => handleNewMember(group)} clickStudent={handleEditStudent} staff={staff} />
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
                <div
                    type="button"
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 hover:scale-110 rounded p-1 cursor-pointer"
                    onClick={handleDeleteGroup}
                    tabIndex={-1}
                    aria-label="Delete group"
                >
                    <Trash2 className="w-4 h-4 text-red-500" />
                </div>
            )}
        </div>
    );
}

function GroupOpen({ group, clickNew, clickStudent, staff }) {

    const [selectedStaffId, setSelectedStaffId] = useState(null)
    const clickAddAdmin = () => addAdmin(group.name, selectedStaffId)
    const clickRemoveAdmin = staffId => removeAdmin(group.name, staffId)

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Admins:</span>
                {group.displayAdmins.map(admin => (
                    <div className="flex justify-between" key={admin.id}>
                        <span className="text-sm font-semibold">
                            {admin.firstName} {admin.lastName}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 text-red-500 hover:bg-red-100"
                            onClick={() => clickRemoveAdmin(admin.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                <div className="flex items-center gap-2">
                    <select
                        className="border rounded px-2 py-1 text-sm"
                        defaultValue=""
                        onChange={e => setSelectedStaffId(e.target.value)}
                    >
                        <option value="" disabled>
                            Add admin...
                        </option>
                        {staff.filter(staffMember => !group.displayAdmins.some(admin => admin.id === staffMember.id))
                            .map(staffMember => (
                                <option key={staffMember.id} value={staffMember.id}>
                                    {staffMember.firstName} {staffMember.lastName}
                                </option>
                            ))}
                    </select>
                    <Button variant="outline" size="sm" className="ml-2" onClick={clickAddAdmin}>
                        Add Admin
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Members:</span>
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
            </div>
            <Button variant="outline" size="sm" className="w-full"
                onClick={clickNew}>
                Add Member
            </Button>
        </div>
    );
}