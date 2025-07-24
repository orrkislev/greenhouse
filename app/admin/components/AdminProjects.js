import { adminActions, useAdmin } from "@/utils/useAdmin";
import { useGantt } from "@/utils/useGantt";
import { useEffect } from "react";




export default function AdminProjects() {
    const groups = useAdmin(state => state.groups);
    const currTerm = useGantt(state => state.currentTerm);

    useEffect(() => {
        adminActions.loadProjects();
    }, []);

    const getStudentData = (student) => {
        let project = null, requested = '', master = '', major = null;

        if (student.major) major = student.major.name;
        if (student.project && student.project.terms.includes(currTerm)) {
            requested = student.project.requestedMaster;
            master = student.project.master ? student.project.master : null;
            project = student.project.title;
            if (student.project.terms.length > 1)
                project += ' (המשך)';
        }
        return {
            name: student.firstName + ' ' + student.lastName,
            major, project, requested, master,
        }
    }

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

    return (
        <div className="p-6 overflow-scroll px-0">
            <table className="w-full min-w-max table-auto text-left text-xs">
                <thead>
                    <tr>
                        {headers.map(header => (
                            <th key={header.key} className="cursor-pointer border-b border-blue-gray-100 bg-blue-gray-50/50 py-4 transition-colors hover:bg-blue-gray-50">
                                <p className="antialiased font-sans text-blue-gray-900 flex items-center gap-2 font-normal leading-none opacity-70">
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
                    {groups.map(group => {
                        return group.students.map(student => {
                            const data = getStudentData(student, group);
                            return (
                                <tr key={student.id}>
                                    <Cell>{group.name}</Cell>
                                    <Cell>{data.name}</Cell>
                                    <Cell>{data.major}</Cell>
                                    <Cell>
                                        {data.project ? (
                                            <a href={projectUrl = `/projects/${student.id}/${student.project.id}`} className="bg-blue-300 rounded-sm hover:bg-blue-500 text-gray-400 hover:text-white px-2 py-1">
                                                {data.project}
                                            </a>
                                        ) : (<span className="text-gray-500">אין פרויקט</span>
                                        )}
                                    </Cell>
                                    <Cell>{data.requested}</Cell>
                                    <Cell>{data.master}</Cell>
                                </tr>
                            );
                        });
                    })}
                </tbody>
            </table>
        </div>
    );
}

const Cell = ({ children }) => (
    <td className="p-1 border-b border-blue-gray-50">
        <div className="flex items-center">
            <p className="block antialiased font-sans leading-normal text-blue-gray-900 font-normal">
                {children}
            </p>
        </div>
    </td>
);