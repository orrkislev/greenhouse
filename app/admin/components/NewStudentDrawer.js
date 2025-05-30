import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import PINInput from "@/components/ui/PIN";
import { Button } from "@/components/ui/button";
import { createUser } from "../actions/createUser";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";

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

    const usernameRegex = /^[A-Za-z][A-Za-z0-9._-]*$/;

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setError("");
        if (!usernameRegex.test(username)) {
            setError("Username must start with a letter and contain only English letters, numbers, dots, underscores, or hyphens.");
            return;
        }

        const res = await createUser(username, pin, firstName + " " + lastName);

        if (res.success) {
            setDoc(doc(db, "users", res.id), {
                firstName,
                lastName,
                className: selectedGroup,
                roles: ['student'],
            });
        } else {
            console.error("Error adding student:", res.error);
        }

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
