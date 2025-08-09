import { adminActions, useAdmin } from "@/utils/store/useAdmin";
import { useTime } from "@/utils/store/useTime";
import { userActions } from "@/utils/store/useUser";
import { useEffect, useMemo } from "react";




export default function AdminProjects() {
    const staff = useAdmin(state => state.staff);
    const groups = useAdmin(state => state.groups);
    const currTerm = useTime(state => state.currTerm);

    useEffect(() => {
        adminActions.loadProjects();
    }, []);

    const displayData = useMemo(() => {
        return groups.map(group => {
            return group.students.map(student => {
                let project = null, requested = '', master = '', major = null;

                if (student.major) major = student.major.name;
                if (student.project && student.project.terms.includes(currTerm.id)) {
                    requested = student.project.questions[2].value;
                    master = student.project.master ? student.project.master : null;
                    project = student.project.name;
                    if (student.project.terms.length > 1)
                        project += ' (המשך)';
                }
                return {
                    id: student.id,
                    name: student.firstName + ' ' + student.lastName,
                    group: group.name,
                    major, project, requested, master,
                }
            });
        }).flat();
    }, [groups, currTerm]);

    const headers = [
        { label: 'קבוצה', key: 'group', sortable: true },
        { label: 'חניך', key: 'student', sortable: true },
        { label: 'מגמה', key: 'major', sortable: true },
        { label: 'שם הפרויקט', key: 'title' },
        { label: 'מנחה מבוקש', key: 'requestedMaster', sortable: true },
        { label: 'מנחה', key: 'master', sortable: true },
    ]

    groups.sort((a, b) => a.name.localeCompare(b.name));
    groups.forEach(group => {
        group.students.sort((a, b) => a.lastName.localeCompare(b.lastName));
    });


    const clickOnProject = async (studentId) => {
        await userActions.switchToStudent(studentId, 'admin');
        window.location.href = '/project';
    }

    const selectMaster = async (studentId, projectId, masterId) => {
        const master = staff.find(staff => staff.id === masterId);
        if (!master) return;
        await adminActions.assignMasterToProject(studentId, projectId, master);
    }

    return (
        <div className="p-6 overflow-scroll px-0">
            <table className="w-full min-w-max table-auto text-left text-xs">
                <thead>
                    <tr>
                        {headers.map(header => (
                            <th key={header.key} className="cursor-pointer border-b border-blue-stone-100 bg-blue-stone-50/50 py-4 transition-colors hover:bg-blue-stone-50">
                                <p className="antialiased font-sans text-blue-stone-900 flex items-center gap-2 font-normal leading-none opacity-70">
                                    {header.sortable && (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true" className="h-4 w-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                                        </svg>
                                    )}
                                    {header.label}
                                </p>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {displayData.map(student => (
                        <tr key={student.id}>
                            <Cell>{student.group}</Cell>
                            <Cell>{student.name}</Cell>
                            <Cell>{student.major}</Cell>
                            <Cell>
                                {student.project ? (
                                    <div className="bg-blue-300 rounded-sm hover:bg-blue-500 text-stone-400 hover:text-white px-2 py-1"
                                        onClick={() => clickOnProject(student.id)}>
                                        {student.project}
                                    </div>
                                ) : (<span className="text-stone-500">אין פרויקט</span>
                                )}
                            </Cell>
                            <Cell>{student.requested}</Cell>
                            <Cell>
                                <select
                                    value={student.master?.id || ''}
                                    onChange={e => selectMaster(student.id, student.projectId, e.target.value)}
                                    className="bg-white border border-stone-300 rounded-md p-1"
                                >
                                    <option value="">בחר מנחה</option>
                                    {staff.map(mentor => (
                                        <option key={mentor.id} value={mentor.id}>
                                            {mentor.firstName} {mentor.lastName}
                                        </option>
                                    ))}
                                </select>
                            </Cell>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const Cell = ({ children }) => (
    <td className="p-1 border-b border-blue-stone-50">
        <div className="flex items-center">
            <div className="block antialiased font-sans leading-normal text-blue-stone-900 font-normal">
                {children}
            </div>
        </div>
    </td>
);