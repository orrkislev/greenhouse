import { useState } from "react";
import { adminActions, useAdmin } from "@/utils/useAdmin";
import { Edit2, XIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AdminGroups() {
    const groups = useAdmin(state => state.groups);

    return (
        <div>
            {groups.map(group => (
                <div key={group.id} className="mb-4 p-4 bg-gray-100">
                    <GroupHeader group={group} />
                    <GroupMentors group={group} />
                    <GroupStudents group={group} />
                </div>
            ))}
            <NewGroupButton />
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
            adminActions.updateClass(group.id, updatedGroup);
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

    const handleRemoveMentor = (mentorId) => {
        adminActions.removeMentorFromGroup(group.id, mentorId);
    };
    const addMentorToGroup = (mentorId) => {
        adminActions.addMentorToGroup(group.id, mentorId);
    };

    return (
        <div className="mb-2">
            <h3 className="text-sm">מנטורים</h3>
            <div className="flex flex-wrap gap-2 pr-4">
                {group.mentors && group.mentors.map(mentor => (
                    <div key={mentor.id} className="flex gap-2 items-center bg-blue-100 text-blue-800 px-2 py-1 group relative">
                        <span>{mentor.firstName} {mentor.lastName}</span>
                        <XIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 cursor-pointer"
                            onClick={() => handleRemoveMentor(mentor.id)} />
                    </div>
                ))}
                <select className="ml-2 p-1 border rounded" onChange={(e) => addMentorToGroup(e.target.value)} defaultValue="">
                    <option value="" disabled>הוסף מנטור</option>
                    {staff.filter(mentor => !group.mentors.some(m => m.id === mentor.id)).map(mentor => (
                        <option key={mentor.id} value={mentor.id}>{mentor.firstName} {mentor.lastName}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

function GroupStudents({ group }) {
    return (
        <div>
            <h3 className="text-sm">תלמידים</h3>
            <div className="flex flex-wrap gap-2 pr-4">
                {group.students && group.students.map(student => (
                    <SingleStudent key={student.id} student={student} />
                ))}
                <NewStudentButton group={group} />
            </div>
        </div>
    );
}

function SingleStudent({ student }) {
    const groups = useAdmin(state => state.groups);
    const [isOpen, setIsOpen] = useState(false);

    const saveChanges = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData);
        adminActions.updateMember(student.id, {
            firstName: values.first,
            lastName: values.last,
            className: values.className
        });
        setIsOpen(false);
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="cursor-pointer hover:bg-gray-200 p-1">
                    {student.firstName} {student.lastName}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 pt-12">
                <XIcon className="absolute left-4 top-4 w-4 h-4 cursor-pointer" onClick={() => setIsOpen(false)} />
                <form onSubmit={saveChanges} className="flex flex-col gap-2">
                    <input name="first" type="text" placeholder="שם פרטי" defaultValue={student.firstName} className="p-1 border" />
                    <input name="last" type="text" placeholder="שם משפחה" defaultValue={student.lastName} className="p-1 border" />
                    <select name="className" className="p-1 border">
                        <option value="" disabled>בחר קבוצה</option>
                        {groups.map(group => (
                            <option key={group.id} value={group.id} >
                                {group.name}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="mt-2 px-4 py-1 bg-blue-500 text-white text-xs hover:bg-blue-600">
                        שמור
                    </button>
                    <button type="button" className="mt-2 px-4 py-1 bg-red-500 text-white text-xs hover:bg-red-600"
                        onClick={() => adminActions.removeMember(student.uid, student.username)}>
                        הסר תלמיד
                    </button>
                </form>
            </PopoverContent>
        </Popover>
    );
}

function NewStudentButton({ group }) {
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newStudent = Object.fromEntries(formData);
        const res = await adminActions.createStudent(
            newStudent.firstName,
            newStudent.lastName,
            newStudent.username,
            group.id
        );
        if (res instanceof Error) {
            alert(res.message);
            return;
        }
        setShowForm(false);
    };

    return (
        <Popover open={showForm} onOpenChange={setShowForm}>
            <PopoverTrigger asChild>
                <button className="px-4 py-1 bg-emerald-500 text-white text-xs hover:bg-emerald-600">
                    {showForm ? '-' : '+'}
                </button>
            </PopoverTrigger>
            <PopoverContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
                    <input type="text" name="firstName"
                        placeholder="שם פרטי"
                        className="p-1 border"
                    />
                    <input type="text" name="lastName"
                        placeholder="שם משפחה"
                        className="p-1 border"
                    />
                    <input type="text" name="username"
                        placeholder="שם משתמש"
                        className="p-1 border"
                    />
                    <button type="submit" className="px-4 py-1 bg-blue-500 text-white text-xs hover:bg-blue-600">
                        הוסף תלמיד
                    </button>
                </form>
            </PopoverContent>
        </Popover>
    );
}




function NewGroupButton() {
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newGroupName = formData.get('groupName');
        const newYear = formData.get('year');
        adminActions.createClass(newGroupName, newYear);
        setShowForm(false);
    };

    return (
        <Popover open={showForm} onOpenChange={setShowForm}>
            <PopoverTrigger asChild>
                <button className="px-4 py-1 bg-blue-500 text-white text-xs hover:bg-blue-600">
                    {showForm ? '-' : '+'}
                </button>
            </PopoverTrigger>
            <PopoverContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
                    <input type="text" name="groupName"
                        placeholder="שם קבוצה חדש"
                        className="p-1 border"
                    />
                    <input type="number" name="year" placeholder="מחזור" className="p-1 border" />
                    <button type="submit" className="px-4 py-1 bg-green-500 text-white text-xs hover:bg-green-600">
                        צור קבוצה
                    </button>
                </form>
            </PopoverContent>
        </Popover>
    );
}