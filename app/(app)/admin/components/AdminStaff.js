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
            username: '',
            firstName: '',
            lastName: '',
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

    const saveChanges = async () => {
        const updates = staffData.filter(staff => staff.dirty && !staff.isNew);
        const newStaff = staffData.filter(staff => staff.isNew);
        for (const staff of updates) {
            delete staff.dirty;
            const id = staff.id;
            delete staff.id;
            if (staff.admin) staff.roles.push('admin');
            delete staff.admin;
            await adminActions.updateMember(id, staff);
        }
        for (const staff of newStaff) {
            delete staff.isNew; 
            delete staff.dirty;
            delete staff.id;
            if (staff.major == '') delete staff.major;
            if (staff.admin) staff.roles.push('admin');
            delete staff.admin;
            await adminActions.createMember(staff);
        }
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
                                <Cell>
                                    <input type="text" defaultValue={staff.username} placeholder="שם משתמש" className="border-none outline-none p-0 m-0"
                                        onChange={(e) => updateStaffData(staff.id, 'username', e.target.value)}
                                    />
                                </Cell>
                            ) : (
                                <Cell className='text-stone-500'>{staff.id}</Cell>
                            )}
                            <Cell>
                                <input type="text" defaultValue={staff.firstName} placeholder="שם פרטי" className="border-none outline-none p-0 m-0"
                                    onChange={(e) => updateStaffData(staff.id, 'firstName', e.target.value)}
                                />
                            </Cell>
                            <Cell>
                                <input type="text" defaultValue={staff.lastName} placeholder="שם משפחה" className="border-none outline-none p-0 m-0"
                                    onChange={(e) => updateStaffData(staff.id, 'lastName', e.target.value)}
                                />
                            </Cell>
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