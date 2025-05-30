import { doc, setDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createUser } from "../actions/createUser";
import PINInput from "@/components/ui/PIN";

export default function NewStaffDrawer({ open, onOpenChange }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [pin, setPin] = useState("");
    const [job, setJob] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const usernameRegex = /^[A-Za-z][A-Za-z0-9._-]*$/;

    async function handleAddStaff(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (!usernameRegex.test(username)) {
            setError("Username must start with a letter and contain only English letters, numbers, dots, underscores, or hyphens.");
            setLoading(false);
            return;
        }
        try {
            const res = await createUser(username, pin, firstName + " " + lastName);

            if (res.success) {
                setDoc(doc(db, "users", res.id), {
                    firstName,
                    lastName,
                    job,
                    roles: ['staff'],
                });
            } else {
                console.error("Error adding student:", res.error);
            }

            setFirstName("");
            setLastName("");
            setUsername("");
            setPin("");
            setJob("");
            onOpenChange(false);
        } catch (err) {
            setError("Failed to add staff");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Add New Staff</DrawerTitle>
                </DrawerHeader>
                <form className="flex flex-col gap-4 p-4" onSubmit={handleAddStaff}>
                    <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <Input
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <Input
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Job</label>
                        <Input
                            value={job}
                            onChange={e => setJob(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <Input
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">PIN</label>
                        <PINInput onChange={setPin} />
                    </div>
                    {error && <div className="text-red-500 text-xs">{error}</div>}
                    <div className="flex gap-2 justify-end">
                        <DrawerClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Staff"}</Button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
