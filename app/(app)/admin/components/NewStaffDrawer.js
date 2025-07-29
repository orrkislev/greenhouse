import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import PINInput from "@/components/ui/PIN";
import { FormInput, useForm } from "@/components/ui/form/FormInput";
import { useState } from "react";
import { adminActions } from "@/utils/useAdmin";

export default function NewStaffDrawer({ open, onOpenChange }) {
    const [error, setError] = useState("");
    const form = useForm({
        firstName: "",
        lastName: "",
        username: "",
        pin: "",
        job: ""
    }, async (values) => {
        await adminActions.createStaff(values.firstName, values.lastName, values.username, values.job)
        form.clear()
        onOpenChange(false);
    });

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Add New Staff</DrawerTitle>
                </DrawerHeader>
                <form className="flex flex-col gap-4 p-4" {...form.formProps}>
                    <FormInput label="שם פרטי" {...form.props.firstName} />
                    <FormInput label="שם משפחה" {...form.props.lastName} />
                    <FormInput label="תפקיד" {...form.props.job} />
                    <FormInput label="שם משתמש" {...form.props.username} />
                    <PINInput {...form.props.pin} />

                    <div className="flex gap-2 justify-end">
                        <DrawerClose asChild>
                            <Button type="button" variant="outline">ביטול</Button>
                        </DrawerClose>
                        <Button type="submit" >אישור</Button>
                    </div>
                </form>

                {error && <p className="text-red-500 text-sm p-4">{error}</p>}
            </DrawerContent>
        </Drawer>
    );
}
