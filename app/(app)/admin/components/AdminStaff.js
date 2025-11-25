import { useEffect, useState } from "react";
import { adminActions, useAdmin } from "@/utils/store/useAdmin";
import { Plus, Save, UserRoundX } from "lucide-react";
import { Cell, Checkbox, TableHeader } from "./Common";
import { userActions } from "@/utils/store/useUser";

export default function AdminStaff() {
    const allMembers = useAdmin(state => state.allMembers);
    const [madeChanges, setMadeChanges] = useState(false);
    const [staffData, setStaffData] = useState(allMembers.filter(member => member.role === 'staff' || member.role === 'admin'));

    useEffect(() => {
        adminActions.loadData();
    }, [])

    useEffect(() => {
        setStaffData(allMembers.filter(member => member.role === 'staff' || member.role === 'admin'));
    }, [allMembers])

    const addStaff = () => {
        setStaffData([...staffData, {
            id: new Date().getTime(),
            username: '',
            first_name: '',
            last_name: '',
            isNew: true,
            role: 'staff',
            is_admin: false,
        }]);
        setMadeChanges(true);
    }

    const updateStaffData = (id, key, value) => {
        setStaffData(staffData.map(s => s.id === id ? { ...s, [key]: value, dirty: true } : s));
        setMadeChanges(true);
    }

    const saveChanges = async () => {
        const updates = staffData.filter(staff => staff.dirty && !staff.isNew);
        const newStaff = staffData.filter(staff => staff.isNew);
        for (const staff of updates) {
            await adminActions.updateMember(staff.id, staff);
        }
        for (const staff of newStaff) {
            delete staff.id;
            await adminActions.createMember(staff);
        }
        setMadeChanges(false);
    }

    const deleteStaff = async (staff) => {
        if (staff.isNew) setStaffData(staffData.filter(s => s.id !== staff.id));
        else if (confirm(`בטוח? למחוק את ${staff.first_name} ${staff.last_name}?`)) {
            await adminActions.deleteMember(staff);
        }
    }

    const headers = [
        { key: 'id', label: '', sortable: false },
        { key: 'username', label: 'שם משתמש', sortable: false },
        { key: 'first_name', label: 'שם פרטי', sortable: true },
        { key: 'last_name', label: 'שם משפחה', sortable: true },
        { key: 'admin', label: 'ניהול', sortable: false },
        { key: 'delete', label: '', sortable: false },
    ];

    return (
        <div className='flex gap-4 border border-border p-4'>
            <table className="text-left text-xs border-collapse border-border border">
                <TableHeader headers={headers} />
                <tbody>
                    {staffData.map((staff, index) => (
                        <tr key={index}>
                            <Cell>{index + 1}</Cell>
                            {staff.isNew ? (
                                <Cell>
                                    <input type="text" defaultValue={staff.username} placeholder="שם משתמש" className="border-none outline-none p-0 m-0"
                                        onChange={(e) => updateStaffData(staff.id, 'username', e.target.value)}
                                    />
                                </Cell>
                            ) : (
                                <Cell>
                                    <span className='text-muted-foreground underline hover:text-foreground cursor-pointer' onClick={() => userActions.switchToStudent(staff.id, 'admin')}>
                                        {staff.username}
                                    </span>
                                </Cell>
                            )}
                            <Cell>
                                <input type="text" defaultValue={staff.first_name} placeholder="שם פרטי" className="border-none outline-none p-0 m-0"
                                    onChange={(e) => updateStaffData(staff.id, 'first_name', e.target.value)}
                                />
                            </Cell>
                            <Cell>
                                <input type="text" defaultValue={staff.last_name} placeholder="שם משפחה" className="border-none outline-none p-0 m-0"
                                    onChange={(e) => updateStaffData(staff.id, 'last_name', e.target.value)}
                                />
                            </Cell>
                            <Cell><Checkbox value={staff.is_admin} onChange={(value) => updateStaffData(staff.id, 'is_admin', value)} /></Cell>
                            <Cell><button className="p-1 bg-destructive my-1 rounded text-white text-xs hover:bg-red-600 flex items-center gap-2" onClick={() => deleteStaff(staff)}><UserRoundX className="w-4 h-4" /></button></Cell>
                        </tr>
                    ))}
                    <tr>
                        <td className="text-center">
                            <button className="px-4 py-1 bg-emerald-500 my-1 rounded text-white text-xs hover:bg-emerald-600 flex items-center gap-2" onClick={addStaff}>
                                צוות חדש <Plus className="w-4 h-4" />
                            </button>
                        </td>
                        {Array.from({ length: headers.length - 2 }).map((_, index) => (<td key={index}></td>))}
                        {madeChanges && (
                            <td>
                                <button className="px-4 py-1 bg-emerald-500 my-1 rounded text-white text-xs hover:bg-emerald-600 flex items-center gap-2" onClick={saveChanges}>
                                    שמירה <Save className="w-4 h-4" />
                                </button>
                            </td>
                        )}
                    </tr>
                </tbody>
            </table>
        </div >
    );
}