import { useEffect, useState } from "react";
import { adminActions, useAdmin } from "@/utils/store/useAdmin";
import { Edit2, Meh, Plus, UserRoundX, XIcon } from "lucide-react";
import { tw } from "@/utils/tw";
import { Cell, Edittable, TableHeader } from "./Common";

const SpecialButton = tw`p-4 border border-gray-200 rounded-md flex items-center gap-2 text-xs hover:bg-gray-100 cursor-pointer`;

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
                <div key={group.id} className="p-4 border border-gray-200 flex gap-4">
                    <div>
                        <GroupHeader group={group} />
                        <GroupStudents group={group} />
                    </div>
                    <GroupMentors group={group} />
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
                <span className="text-sm text-gray-500">שנה {group.year}</span>
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
        adminActions.updateGroup(group.id, { mentors: group.mentors.filter(mentor => mentor !== mentorId) });
    };
    const addMentorToGroup = (mentorId) => {
        adminActions.updateGroup(group.id, { mentors: [...group.mentors, mentorId] });
    };

    return (
        <div className="flex flex-col gap-2 border border-gray-200 p-4">
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
                {staff.filter(mentor => !group.mentors.some(m => m.id === mentor.id)).map(mentor => (
                    <option key={mentor.id} value={mentor.id}>{mentor.firstName} {mentor.lastName}</option>
                ))}
            </select>
        </div>
    );
}

function GroupStudents({ group }) {
    const majors = useAdmin(state => state.majors);
    const [studentsData, setStudentsData] = useState(group.students);
    const [madeChanges, setMadeChanges] = useState(false);

    useEffect(() => {
        setStudentsData(group.students);
    }, [group])

    const addStudent = () => {
        const newStudent = {
            id: new Date().getTime(),
            username: 'user.na',
            firstName: 'שם פרטי',
            lastName: 'שם משפחה',
            major: 'מגמה',
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

    const saveChanges = () => {
        const dirtyStudents = studentsData.filter(student => student.dirty && !student.isNew);
        const newStudents = studentsData.filter(student => student.isNew);
        dirtyStudents.forEach(student => {
            delete student.dirty;
            adminActions.updateMember(student.id, student);
        });
        newStudents.forEach(student => {
            delete student.isNew;
            delete student.dirty;
            delete student.id;
            adminActions.createMember(student);
        });
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
            <table className="text-left text-xs border-collapse border-gray-200 border">
                <TableHeader headers={headers} />
                <tbody>
                    {studentsData.map((student, index) => (
                        <tr key={index} className="border-b border-gray-200">
                            <Cell >{index + 1}</Cell>
                            {student.isNew ? (
                                <Cell><Edittable value={student.username} onChange={(value) => updateStudentData(student.id, 'username', value)} /></Cell>
                            ) : (
                                <Cell className="text-gray-500">{student.username}</Cell>
                            )}
                            <Cell><Edittable value={student.firstName} onChange={(value) => updateStudentData(student.id, 'firstName', value)} /></Cell>
                            <Cell><Edittable value={student.lastName} onChange={(value) => updateStudentData(student.id, 'lastName', value)} /></Cell>
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

    const handleRemoveMajor = (majorId) => {
        adminActions.updateMajors(majors.filter(major => major.id !== majorId));
    };

    const editMajor = (majorId, value) => {
        adminActions.updateMajors(majors.map(major => major.id === majorId ? { ...major, name: value } : major));
    };

    const addMajor = () => {
        adminActions.updateMajors([...majors, { id: new Date().getTime(), name: 'מגמה חדשה' }]);
    };

    return (
        <div className="flex flex-col gap-4 border border-gray-200 p-4">
            <h3 className="text-sm">מגמות</h3>
            <div className="flex gap-2">
                {majors.map(major => (
                    <div key={major.id} className="flex flex-col p-4 gap-2 group relative border border-gray-200">
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