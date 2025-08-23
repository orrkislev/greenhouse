import { useEffect, useState } from "react";
import { adminActions, useAdmin } from "@/utils/store/useAdmin";
import { Edit2, Meh, Plus, Trash, UserRoundX, XIcon } from "lucide-react";
import { tw } from "@/utils/tw";
import { Cell, Edittable, TableHeader } from "./Common";

const SpecialButton = tw`p-4 border border-stone-200 rounded-md flex items-center gap-2 text-xs hover:bg-stone-100 cursor-pointer`;

export default function AdminGroups() {
    const groups = useAdmin(state => state.groups);

    useEffect(() => {
        adminActions.loadData();
    }, [])

    const createGroup = () => {
        adminActions.createGroup('קבוצה חדשה', 'class', { year: 1 });
    }

    return (
        <div className="flex flex-col gap-4">
            {groups.map(group => (
                <div key={group.id} className="p-4 border border-stone-200 flex gap-4">
                    <div>
                        <GroupHeader group={group} />
                        <GroupStudents group={group} />
                    </div>
                    <GroupMentors group={group} />
                    {group.students && group.students.length == 0 && (
                        <div className="text-sm text-stone-500 flex items-center gap-2 cursor-pointer" onClick={() => adminActions.deleteGroup(group.id)}>
                            <Trash className="w-4 h-4" />
                            מחק קבוצה
                        </div>
                    )}
                </div>
            ))}
            <AdminMajors />
            <div className="flex gap-4">
                <SpecialButton onClick={createGroup}>
                    <Plus className="w-4 h-4" /> קבוצה חדשה
                </SpecialButton>
            </div>
        </div>
    )
}





function GroupHeader({ group }) {
    const [isEditing, setIsEditing] = useState(false);
    if (isEditing) {
        const handleSubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedGroup = {
                name: formData.get('name'),
                year: parseInt(formData.get('year'), 10)
            };
            adminActions.updateGroup(group.id, updatedGroup);
            setIsEditing(false);
        };

        return (
            <form className="flex items-center mb-2 group gap-2" onSubmit={handleSubmit}>
                <input type="text" name="name" defaultValue={group.name} className="p-1 border rounded" />
                <input type="number" name="year" defaultValue={group.year} className="p-1 border rounded" />
                <button type="submit" className="px-4 py-1 bg-blue-500 text-white text-xs hover:bg-blue-600">
                    שמור
                </button>
                <XIcon className="w-4 h-4 cursor-pointer" onClick={() => setIsEditing(false)} />
                <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 cursor-pointer"
                    onClick={() => setIsEditing(false)} />
            </form>
        );
    } else {
        return (
            <div className="flex items-center mb-2 group gap-2">
                <h2 className="text-lg font-semibold">{group.name}</h2>
                <span className="text-sm text-stone-500">שנה {group.year}</span>
                <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 cursor-pointer"
                    onClick={() => setIsEditing(true)} />
            </div>
        );
    }
}



function GroupMentors({ group }) {
    const staff = useAdmin(state => state.staff);

    const groupMentors = staff.filter(staff => group.mentors.includes(staff.id));

    const handleRemoveMentor = (mentorId) => {
        // adminActions.updateGroup(group.id, { mentors: group.mentors.filter(mentor => mentor !== mentorId) });
        adminActions.removeMentorFromClass(group.id, mentorId);
    };
    const addMentorToGroup = (mentorId) => {
        // adminActions.updateGroup(group.id, { mentors: [...group.mentors, mentorId] });
        adminActions.assignMentorToClass(group.id, mentorId);
    };

    return (
        <div className="flex flex-col gap-2 border border-stone-200 p-4 sticky top-0">
            <h3 className="text-sm">מנטורים</h3>
            {groupMentors.map(mentor => (
                <div key={mentor.id} className="flex justify-between gap-2 items-center text-sm text-blue-800 px-2 rounded-full group relative border border-blue-400">
                    <span>{mentor.firstName} {mentor.lastName}</span>
                    <XIcon className="w-4 h-4 opacity-30 group-hover:opacity-100 cursor-pointer"
                        onClick={() => handleRemoveMentor(mentor.id)} />
                </div>
            ))}
            <select className="ml-2 p-1 border rounded text-sm" onChange={(e) => addMentorToGroup(e.target.value)} defaultValue="">
                <option value="" disabled>הוסף מנטור</option>
                {staff.filter(mentor => !mentor.class).sort((a, b) => a.firstName.localeCompare(b.firstName)).map(mentor => (
                    <option key={mentor.id} value={mentor.id}>{mentor.firstName} {mentor.lastName}</option>
                ))}
            </select>
        </div>
    );
}

function GroupStudents({ group }) {
    const majors = useAdmin(state => state.majors);
    const [studentsData, setStudentsData] = useState(group.students || []);
    const [madeChanges, setMadeChanges] = useState(false);

    useEffect(() => {
        if (group && group.students) setStudentsData(group.students);
    }, [group])

    const addStudent = () => {
        const newStudent = {
            id: new Date().getTime(),
            username: '',
            firstName: '',
            lastName: '',
            major: '',
            isNew: true,
            roles: ['student'],
            class: group.id,
        };
        setStudentsData([...studentsData, newStudent]);
        setMadeChanges(true);
    }

    const updateStudentData = (studentId, key, value) => {
        setStudentsData(studentsData.map(student => student.id === studentId ? { ...student, [key]: value, dirty: true } : student));
        setMadeChanges(true);
    };

    const saveChanges = async () => {
        const dirtyStudents = studentsData.filter(student => student.dirty && !student.isNew);
        const newStudents = studentsData.filter(student => student.isNew);
        for (const student of dirtyStudents) {
            delete student.dirty;
            await adminActions.updateMember(student.id, student);
        }
        for (const student of newStudents) {
            delete student.isNew;
            delete student.dirty;
            delete student.id;
            if (student.major == '') delete student.major;
            await adminActions.createMember(student);
        }
        setMadeChanges(false);
    }

    const deleteStudent = (student) => {
        if (student.isNew) setStudentsData(studentsData.filter(s => s.id !== student.id));
        else if (confirm(`בטוח? למחוק את ${student.firstName} ${student.lastName}?`)) {
            adminActions.deleteMember(student);
        }
    }

    const headers = [
        { key: 'id', label: '', sortable: false },
        { key: 'username', label: 'שם משתמש', sortable: false },
        { key: 'firstName', label: 'שם פרטי', sortable: true },
        { key: 'lastName', label: 'שם משפחה', sortable: true },
        { key: 'major', label: 'מגמה', sortable: true },
        { key: 'delete', label: '', sortable: false },
    ];
    return (
        <div>
            <h3 className="text-sm">תלמידים</h3>
            <table className="text-left text-xs border-collapse border-stone-200 border">
                <TableHeader headers={headers} />
                <tbody>
                    {studentsData
                        .sort((a, b) => a.firstName.localeCompare(b.firstName))
                        .sort((a, b) => a.isNew ? 1 : b.isNew ? -1 : 0)
                        .map((student, index) => (
                        <tr key={student.id + index} className="border-b border-stone-200">
                            <Cell >{index + 1}</Cell>
                            {student.isNew ? (
                                <Cell>
                                    <input type="text" defaultValue={student.username} placeholder="שם משתמש" className="border-none outline-none p-0 m-0"
                                        onChange={(e) => updateStudentData(student.id, 'username', e.target.value)}
                                    />
                                </Cell>
                            ) : (
                                <Cell className="text-stone-500">{student.id}</Cell>
                            )}
                            <Cell>
                                <input type="text" defaultValue={student.firstName} placeholder="שם פרטי" className="border-none outline-none p-0 m-0"
                                    onChange={(e) => updateStudentData(student.id, 'firstName', e.target.value)}
                                />
                            </Cell>
                            <Cell>
                                <input type="text" defaultValue={student.lastName} placeholder="שם משפחה" className="border-none outline-none p-0 m-0"
                                    onChange={(e) => updateStudentData(student.id, 'lastName', e.target.value)}
                                />
                            </Cell>
                            <Cell>
                                <select value={student.major} onChange={(e) => updateStudentData(student.id, 'major', e.target.value)}>
                                    <option value="">-</option>
                                    {majors.map(major => (
                                        <option key={major.id} value={major.id}>{major.name}</option>
                                    ))}
                                </select>
                            </Cell>
                            <Cell><button className="p-1 bg-red-500 my-1 rounded text-white text-xs hover:bg-red-600 flex items-center gap-2" onClick={() => deleteStudent(student)}><UserRoundX className="w-4 h-4" /></button></Cell>
                        </tr>
                    ))}
                    <tr>
                        <Cell>
                            <button className="px-4 py-1 bg-emerald-500 my-1 rounded text-white text-xs hover:bg-emerald-600 flex items-center gap-2" onClick={addStudent}>
                                תלמיד נוסף <Plus className="w-4 h-4" />
                            </button>
                        </Cell>
                        {madeChanges && (
                            <>
                                <td />
                                <td />
                                <td />
                                <Cell>
                                    <button className="px-4 py-1 bg-blue-500 text-white text-xs hover:bg-blue-600" onClick={saveChanges}>שמירה</button>
                                </Cell>
                            </>
                        )}
                    </tr>
                </tbody>
            </table>
        </div>
    );
}


function AdminMajors() {
    const majors = useAdmin(state => state.majors);

    const handleRemoveMajor = (majorId) => adminActions.deleteMajor(majorId);
    const editMajor = (majorId, value) => adminActions.updateMajor(majorId, { name: value });
    const addMajor = () => adminActions.createMajor({ name: 'מגמה חדשה' });

    return (
        <div className="flex flex-col gap-4 border border-stone-200 p-4">
            <h3 className="text-sm">מגמות</h3>
            <div className="flex gap-2">
                {majors.map(major => (
                    <div key={major.id} className="flex flex-col p-4 gap-2 group relative border border-stone-200">
                        <div>מגמת</div>
                        <Edittable value={major.name} onFinish={(value) => editMajor(major.id, value)} />
                        <XIcon className="absolute top-1 left-1 w-4 h-4 opacity-0 group-hover:opacity-100 cursor-pointer"
                            onClick={() => handleRemoveMajor(major.id)} />
                    </div>
                ))}
                <button className="px-4 py-1 bg-emerald-500 my-1 rounded text-white text-xs hover:bg-emerald-600 flex items-center gap-2" onClick={addMajor}>
                    <Plus className="w-4 h-4" />
                </button>
            </div>


        </div>
    );
}