import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { updateUserData } from "../actions/member actions";

export default function EditStudentDrawer({ open, onOpenChange, student, groups }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");

    useEffect(() => {
        if (student) {
            setFirstName(student.firstName || "");
            setLastName(student.lastName || "");
            setUsername(student.username || "");
            setSelectedGroup(student.className || (groups && groups[0]?.name) || "");
        }
    }, [student, groups]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!student?.id) return;
        updateUserData(student.username, {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            className: selectedGroup,
        });
        onOpenChange(false);
    };

    const handleResetPassword = () => {
        // TODO: Implement password reset logic
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Edit Student</DrawerTitle>
                </DrawerHeader>
                <form className="flex flex-col gap-4 p-4" onSubmit={handleSave}>
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
                        <Input value={username} disabled />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={handleResetPassword}>Reset Password</Button>
                        <DrawerClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
