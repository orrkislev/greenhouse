import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { resetPin } from "../actions/createUser";
import { updateUserData } from "../actions/member actions";
import { useForm } from "@/utils/useForm";

export default function EditStaffDrawer({ open, onOpenChange, staff }) {
    const [resetPinLoading, setResetPinLoading] = useState(false);
    const [resetPinMessage, setResetPinMessage] = useState("");

    const { fields, handleSubmit, populate, isSubmitting, errors } = useForm(
        {
            firstName: "",
            lastName: "",
            job: ""
        },
        {
            validation: {
                firstName: {
                    required: "First name is required",
                    min: 1,
                    max: 50
                },
                lastName: {
                    required: "Last name is required",
                    min: 1,
                    max: 50
                },
                job: {
                    required: "Job is required",
                    min: 1,
                    max: 100
                }
            },
            onSubmit: async (values) => {
                if (!staff?.username) return;
                
                await updateUserData(staff.username, {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    job: values.job
                });
                
                onOpenChange(false);
            }
        }
    );

    useEffect(() => {
        console.log(staff)
        if (staff) {
            populate({
                firstName: staff.firstName || "",
                lastName: staff.lastName || "",
                job: staff.job || ""
            });
        }
    }, [staff]);

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
                <form className="flex flex-col gap-4 p-4" onSubmit={handleSubmit()}>
                    <div>
                        <label className="block text-sm font-medium mb-1">שם פרטי</label>
                        <Input
                            {...fields.firstName}
                            className={fields.firstName.hasError ? "border-red-500" : ""}
                        />
                        {fields.firstName.error && (
                            <p className="text-red-500 text-xs mt-1">{fields.firstName.error}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">שם משפחה</label>
                        <Input
                            {...fields.lastName}
                            className={fields.lastName.hasError ? "border-red-500" : ""}
                        />
                        {fields.lastName.error && (
                            <p className="text-red-500 text-xs mt-1">{fields.lastName.error}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">תפקיד</label>
                        <Input
                            {...fields.job}
                            className={fields.job.hasError ? "border-red-500" : ""}
                        />
                        {fields.job.error && (
                            <p className="text-red-500 text-xs mt-1">{fields.job.error}</p>
                        )}
                    </div>
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
                        <Button type="submit" disabled={isSubmitting || !staff?.id}>
                            {isSubmitting ? "שומר..." : "שמור שינויים"}
                        </Button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    );
}
