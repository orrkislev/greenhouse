import { useEffect, useRef, useState } from "react";
import { adminActions, useAdmin } from "@/utils/store/useAdmin";
import { Plus, Save, UserRoundX } from "lucide-react";
import { Cell, Checkbox, TableHeader } from "./Common";
import { userActions } from "@/utils/store/useUser";

export default function AdminStaff() {
    const allMembers = useAdmin(state => state.allMembers);
    const [staffData, setStaffData] = useState(allMembers.filter(member => member.role === 'staff' || member.role === 'admin'));
    const debounceTimer = useRef(null);
    const staffDataRef = useRef(staffData);

    useEffect(() => {
        adminActions.loadData();
    }, [])

    useEffect(() => {
        setStaffData(allMembers.filter(member => member.role === 'staff' || member.role === 'admin'));
    }, [allMembers])

    useEffect(() => { staffDataRef.current = staffData; }, [staffData]);

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
    }

    const updateStaffData = (id, key, value) => {
        setStaffData(prev => prev.map(s => s.id === id ? { ...s, [key]: value, dirty: true } : s));
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            const updates = staffDataRef.current.filter(s => s.dirty && !s.isNew);
            for (const staff of updates) adminActions.updateMember(staff.id, staff);
            setStaffData(prev => prev.map(s => s.isNew ? s : { ...s, dirty: false }));
        }, 1000);
    }

    const saveNewStaff = async () => {
        const newStaff = staffData.filter(s => s.isNew);
        for (const staff of newStaff) {
            const { id, ...rest } = staff;
            await adminActions.createMember(rest);
        }
    }

    const deleteStaff = async (staff) => {
        if (staff.isNew) setStaffData(staffData.filter(s => s.id !== staff.id));
        else if (confirm(`בטוח? למחוק את ${staff.first_name} ${staff.last_name}?`)) {
            await adminActions.deleteMember(staff);
        }
    }

    const pronounsOptions = [
        { value: '', label: '-' },
        { value: 'he', label: 'הוא' },
        { value: 'she', label: 'היא' },
        { value: 'they', label: 'הם' },
    ];

    const headers = [
        { key: 'id', label: '', sortable: false },
        { key: 'username', label: 'שם משתמש', sortable: false },
        { key: 'first_name', label: 'שם פרטי', sortable: true },
        { key: 'last_name', label: 'שם משפחה', sortable: true },
        { key: 'pronouns', label: 'כינוי', sortable: false },
        { key: 'title', label: 'תפקיד', sortable: false },
        { key: 'admin', label: 'ניהול', sortable: false },
        { key: 'delete', label: '', sortable: false },
    ];

    return (
        <div className='overflow-hidden rounded-lg border border-border w-fit'>
            <table className="text-right text-xs">
                <TableHeader headers={headers} />
                <tbody>
                    {staffData.sort((a, b) => a.first_name.localeCompare(b.first_name))
                        .map((staff, index) => (
                        <tr key={index} className="group hover:bg-muted transition-colors border-b border-ghblack">
                            <Cell>{index + 1}</Cell>
                            {staff.isNew ? (
                                <Cell>
                                    <input type="text" defaultValue={staff.username} placeholder="שם משתמש" className="border-none outline-none p-0 m-0"
                                        onChange={(e) => updateStaffData(staff.id, 'username', e.target.value)}
                                    />
                                </Cell>
                            ) : (
                                <Cell>
                                    <span className='text-muted-foreground underline hover:text-foreground cursor-pointer' onClick={() => userActions.switchToStudent(staff)}>
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
                            <Cell>
                                <select value={staff.profile?.pronouns || ''} onChange={(e) => updateStaffData(staff.id, 'profile', { ...staff.profile, pronouns: e.target.value })}>
                                    {pronounsOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </Cell>
                            <Cell>
                                <input type="text" defaultValue={staff.title || ''} placeholder="תפקיד" className="border-none outline-none p-0 m-0 w-full"
                                    onChange={(e) => updateStaffData(staff.id, 'title', e.target.value)}
                                />
                            </Cell>
                            <Cell><Checkbox value={staff.is_admin} onChange={(value) => updateStaffData(staff.id, 'is_admin', value)} /></Cell>
                            <Cell>
                                <button
                                    className="p-1 bg-destructive my-1 rounded text-white text-xs hover:bg-red-600 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteStaff(staff)}
                                >
                                    <UserRoundX className="w-4 h-4" />
                                </button>
                            </Cell>
                        </tr>
                    ))}
                    <tr className="border-t border-border">
                        <td className="text-center py-1 px-4">
                            <button className="px-4 py-1 bg-emerald-500 my-1 rounded text-white text-xs hover:bg-emerald-600 flex items-center gap-2" onClick={addStaff}>
                                צוות חדש <Plus className="w-4 h-4" />
                            </button>
                        </td>
                        {Array.from({ length: headers.length - 2 }).map((_, index) => (<td key={index}></td>))}
                        {staffData.some(s => s.isNew) && (
                            <td className="py-1 px-4">
                                <button className="px-4 py-1 bg-emerald-500 my-1 rounded text-white text-xs hover:bg-emerald-600 flex items-center gap-2" onClick={saveNewStaff}>
                                    שמירה <Save className="w-4 h-4" />
                                </button>
                            </td>
                        )}
                    </tr>
                </tbody>
            </table>
        </div>
    );
}