import { useEffect, useState } from "react";
import { adminActions, useAdmin } from "@/utils/store/useAdmin";
import { Plus, Save, UserRoundX } from "lucide-react";
import { Cell, Edittable, Checkbox, TableHeader } from "./Common";

export default function AdminStaff() {
    const staff = useAdmin(state => state.staff);
    const majors = useAdmin(state => state.majors);
    const [staffData, setStaffData] = useState(staff);
    const [madeChanges, setMadeChanges] = useState(false);

    useEffect(() => {
        adminActions.loadData();
    }, [])

    useEffect(() => {
        setStaffData(staff);
    }, [staff])

    const addStaff = () => {
        setStaffData([...staffData, {
            id: new Date().getTime(),
            username: 'user',
            firstName: 'שם פרטי',
            lastName: 'שם משפחה',
            admin: false,
            major: '',
            isNew: true,
            roles: ['staff']
        }]);
        setMadeChanges(true);
    }

    const updateStaffData = (id, key, value) => {
        setStaffData(staffData.map(s => s.id === id ? { ...s, [key]: value, dirty: true } : s));
        setMadeChanges(true);
    }

    const saveChanges = () => {
        const updates = staffData.filter(staff => staff.dirty && !staff.isNew);
        const newStaff = staffData.filter(staff => staff.isNew);
        updates.forEach(staff => {
            delete staff.dirty;
            const id = staff.id;
            delete staff.id;
            adminActions.updateMember(id, staff);
        });
        newStaff.forEach(staff => {
            delete staff.isNew;
            delete staff.dirty;
            delete staff.id;
            if (staff.admin) staff.roles.push('admin');
            adminActions.createMember(staff);
        });
        setMadeChanges(false);
    }

    const deleteStaff = async (staff) => {
        if (staff.isNew) setStaffData(staffData.filter(s => s.id !== staff.id));
        else if (confirm(`בטוח? למחוק את ${staff.firstName} ${staff.lastName}?`)) {
            await adminActions.deleteMember(staff);
        }
    }

    const headers = [
        { key: 'id', label: '', sortable: false },
        { key: 'username', label: 'שם משתמש', sortable: false },
        { key: 'firstName', label: 'שם פרטי', sortable: true },
        { key: 'lastName', label: 'שם משפחה', sortable: true },
        { key: 'admin', label: 'ניהול', sortable: false },
        { key: 'major', label: 'מגמה', sortable: true },
        { key: 'delete', label: '', sortable: false },
    ];

    return (
        <div className='flex gap-4 border border-stone-200 p-4'>
            <table className="text-left text-xs border-collapse border-stone-200 border">
                <TableHeader headers={headers} />
                <tbody>
                    {staffData.map((staff, index) => (
                        <tr key={index}>
                            <Cell>{index + 1}</Cell>
                            {staff.isNew ? (
                                <Cell><Edittable value={staff.username} onChange={(value) => updateStaffData(staff.id, 'username', value)} /></Cell>
                            ) : (
                                <Cell className='text-stone-500'>{staff.username}</Cell>
                            )}
                            <Cell><Edittable value={staff.firstName} onChange={(value) => updateStaffData(staff.id, 'firstName', value)} /></Cell>
                            <Cell><Edittable value={staff.lastName} onChange={(value) => updateStaffData(staff.id, 'lastName', value)} /></Cell>
                            <Cell><Checkbox value={staff.admin || staff.roles.includes('admin')} onChange={(value) => updateStaffData(staff.id, 'admin', value)} /></Cell>
                            <Cell>
                                <select value={staff.major} onChange={(e) => updateStaffData(staff.id, 'major', e.target.value)}>
                                    <option value="">-</option>
                                    {majors.map(major => (
                                        <option key={major.id} value={major.id}>{major.name}</option>
                                    ))}
                                </select>
                            </Cell>
                            <Cell><button className="p-1 bg-red-500 my-1 rounded text-white text-xs hover:bg-red-600 flex items-center gap-2" onClick={() => deleteStaff(staff)}><UserRoundX className="w-4 h-4" /></button></Cell>
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