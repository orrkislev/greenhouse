import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { resetPin } from "../../../../utils/admin actions";
import { FormInput, useForm } from "@/components/ui/form/FormInput";
import { adminActions } from "@/utils/useAdmin";

export default function EditStaffDrawer({ open, onOpenChange, staff }) {
    const [resetPinLoading, setResetPinLoading] = useState(false);
    const [resetPinMessage, setResetPinMessage] = useState("");

    const form = useForm({
        firstName: "",
        lastName: "",
        job: ""
    }, async (values) => {
        if (!staff?.username) return;
        
        await adminActions.updateMember(staff.username, {
            firstName: values.firstName,
            lastName: values.lastName,
            job: values.job
        });
        
        onOpenChange(false);
    });

    useEffect(() => {
        if (staff) {
            form.setValue('firstName', staff.firstName || "");
            form.setValue('lastName', staff.lastName || "");
            form.setValue('job', staff.job || "");
        }
    }, [staff, form]);

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
                    <DrawerTitle>צוות</DrawerTitle>
                </DrawerHeader>
                <form className="flex flex-col gap-4 p-4" {...form.formProps}>
                    <FormInput label="שם פרטי" {...form.props.firstName} />
                    <FormInput label="שם משפחה" {...form.props.lastName} />
                    <FormInput label="תפקיד" {...form.props.job} />
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">שם משתמש</label>
                        <Input value={staff?.username || ""} disabled />
                    </div>
                    
                    <div className="flex gap-2 items-center">
                        <Button type="button" variant="secondary" onClick={handleResetPin} disabled={resetPinLoading || !staff?.id}>
                            {resetPinLoading ? "מתאפס..." : "איפוס סיסמה"}
                        </Button>
                        {resetPinMessage && <span className="text-xs text-green-600">{resetPinMessage}</span>}
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                        <DrawerClose asChild>
                            <Button type="button" variant="outline">ביטול</Button>
                        </DrawerClose>
                        <Button type="submit" disabled={!staff?.id}>
                            שמור שינויים
                        </Button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
