import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import PINInput from "@/components/ui/PIN";
import { createStudent } from "../actions/member actions";
import { FormInput, useForm } from "@/components/ui/form/FormInput";

export default function NewStudentDrawer({ open, onOpenChange, groupName, groups }) {
    const [error, setError] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(groupName || (groups && groups[0]?.name) || "");

    useEffect(() => {
        setSelectedGroup(groupName || (groups && groups[0]?.name) || "");
    }, [groupName, groups]);

    const form = useForm({
        firstName: "",
        lastName: "",
        username: "",
        pin: ""
    }, async (values) => {
        await createStudent(values.firstName, values.lastName, values.username, values.pin, selectedGroup);
        form.clear();
        onOpenChange(false);
    });

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Add New Student</DrawerTitle>
                </DrawerHeader>
                <form className="flex flex-col gap-4 p-4" {...form.formProps}>
                    <FormInput label="שם פרטי" {...form.props.firstName} />
                    <FormInput label="שם משפחה" {...form.props.lastName} />
                    <div>
                        <label className="block text-sm font-medium mb-1">קבוצה</label>
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
                    <FormInput label="שם משתמש" {...form.props.username} />
                    <PINInput {...form.props.pin} />

                    <div className="flex gap-2 justify-end">
                        <DrawerClose asChild>
                            <Button type="button" variant="outline">ביטול</Button>
                        </DrawerClose>
                        <Button type="submit">הוספת תלמיד</Button>
                    </div>
                </form>

                {error && <p className="text-red-500 text-sm p-4">{error}</p>}
            </DrawerContent>
        </Drawer>
    );
}
