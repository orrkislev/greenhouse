import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import PINInput from "@/components/ui/PIN";
import { Button } from "@/components/ui/button";
import { createStudent } from "../actions/member actions";

export default function NewStudentDrawer({ open, onOpenChange, groupName, groups }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [pin, setPin] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(groupName || (groups && groups[0]?.name) || "");
    const [error, setError] = useState("");

    useEffect(() => {
        setSelectedGroup(groupName || (groups && groups[0]?.name) || "");
    }, [groupName, groups]);


    const handleAddStudent = async (e) => {
        e.preventDefault();

        await createStudent(firstName, lastName, username, pin, selectedGroup);

        setFirstName("");
        setLastName("");
        setUsername("");
        setPin("");
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Add New Student</DrawerTitle>
                </DrawerHeader>
                <form className="flex flex-col gap-4 p-4" onSubmit={handleAddStudent}>
                    <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <Input value={firstName} onChange={e => setFirstName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Family Name</label>
                        <Input value={lastName} onChange={e => setLastName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Group</label>
                        <select
                            className="w-full border rounded px-2 py-1"
                            value={selectedGroup}
                            onChange={e => setSelectedGroup(e.target.value)}
                            required
                        >
                            {groups && groups.map(g => (
                                <option key={g.id} value={g.name}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <Input value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    {error && <div className="text-red-500 text-xs">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium mb-1">PIN</label>
                        <PINInput onChange={setPin} />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <DrawerClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button type="submit">Add Student</Button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
