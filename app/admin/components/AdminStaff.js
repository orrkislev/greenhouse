import { useState } from "react";
import { Button } from "@/components/ui/button";
import NewStaffDrawer from "./NewStaffDrawer";
import EditStaffDrawer from "./EditStaffDrawer";

export default function AdminStaff({ staff }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    function handleEditStaff(staffMember) {
        setSelectedStaff(staffMember);
        setEditDrawerOpen(true);
    }

    function handleAddStaff() {
        setDrawerOpen(true);
    }

    return (
        <div className="p-4 rounded-2xl bg-white shadow-md w-full">
            <div className="flex items-center mb-2 gap-2">
                <Button size="sm" variant="outline" onClick={handleAddStaff}>
                    + New Staff
                </Button>
            </div>
            <div className="flex flex-col gap-2">
                {staff.map((member) => (
                    <Button
                        key={member.id}
                        variant="ghost"
                        className="w-full justify-between text-left"
                        onClick={() => handleEditStaff(member)}
                    >
                        <span>{member.firstName} {member.lastName}</span>
                    </Button>
                ))}
            </div>
            <NewStaffDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
            />
            <EditStaffDrawer
                open={editDrawerOpen}
                onOpenChange={setEditDrawerOpen}
                staff={selectedStaff}
            />
        </div>
    );
}
