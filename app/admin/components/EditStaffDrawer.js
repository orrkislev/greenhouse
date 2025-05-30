import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/firebase";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { resetPin } from "../actions/createUser";

export default function EditStaffDrawer({ open, onOpenChange, staff }) {
    const [firstName, setFirstName] = useState(staff?.firstName || "");
    const [lastName, setLastName] = useState(staff?.lastName || "");
    const [job, setJob] = useState(staff?.job || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resetPinLoading, setResetPinLoading] = useState(false);
    const [resetPinMessage, setResetPinMessage] = useState("");

    useEffect(() => {
        setFirstName(staff?.firstName || "");
        setLastName(staff?.lastName || "");
        setJob(staff?.job || "");
    }, [staff]);

    async function handleEditStaff(e) {
        e.preventDefault();
        if (!staff?.id) return;
        setLoading(true);
        setError("");
        try {
            await updateDoc(doc(db, "users", staff.id), {
                firstName,
                lastName,
                job
            });
            onOpenChange(false);
        } catch (err) {
            setError("Failed to update staff");
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPin() {
        if (!staff?.id) return;
        setResetPinLoading(true);
        setResetPinMessage("");
        await resetPin(staff.id)
        setResetPinLoading(false);
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Edit Staff</DrawerTitle>
                </DrawerHeader>
                <form className="flex flex-col gap-4 p-4" onSubmit={handleEditStaff}>
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
                        <Input value={staff?.username || ""} disabled />
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button type="button" variant="secondary" onClick={handleResetPin} disabled={resetPinLoading || !staff?.id}>
                            {resetPinLoading ? "Resetting..." : "Reset PIN"}
                        </Button>
                        {resetPinMessage && <span className="text-xs text-green-600">{resetPinMessage}</span>}
                    </div>
                    {error && <div className="text-red-500 text-xs">{error}</div>}
                    <div className="flex gap-2 justify-end">
                        <DrawerClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button type="submit" disabled={loading || !staff?.id}>{loading ? "Saving..." : "Save Changes"}</Button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
