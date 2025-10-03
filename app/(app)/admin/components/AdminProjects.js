import { adminActions, useAdmin } from "@/utils/store/useAdmin";
import { useTime } from "@/utils/store/useTime";
import { userActions } from "@/utils/store/useUser";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";


// Safe string comparison helper (Hebrew locale by default)
const compareStrings = (left, right, locale = 'he') => {
    const a = left ?? '';
    const b = right ?? '';
    return String(a).localeCompare(String(b), locale);
};




export default function AdminProjects() {
    const staff = useAdmin(state => state.staff);
    const classes = useAdmin(state => state.classes);
    const majors = useAdmin(state => state.majors);
    const allMembers = useAdmin(state => state.allMembers);
    const router = useRouter();

    const [sortings, setSortings] = useState([
        { key: 'name', type: 'asc' },
        { key: 'group', type: 'asc' },
    ]);

    useEffect(() => {
        (async () => {
            await adminActions.loadData();
            await adminActions.loadProjects();
        })();
    }, []);

    const data = useMemo(() => {
        if (allMembers.length === 0 || classes.length === 0 || majors.length === 0) return [];
        return allMembers.filter(member => member.role === 'student').map(student => {
            const groupName = classes.find(g => student.groups.includes(g.id))?.name;
            const major = majors.find(m => student.groups.includes(m.id))?.name;
            const project = student.project?.name;
            const requested = student.project?.metadata?.questions?.[2]?.value;
            const master = student.project?.masters?.[0]?.name;
            const projectId = student.project?.id;
            return {
                id: student.id,
                name: student.first_name + ' ' + student.last_name,
                group: groupName,
                major, project, requested, master, projectId,
            }
        });
    }, [allMembers, classes, majors]);

    const sortedData = useMemo(() => {
        let newData = [...data];

        sortings.forEach(sorting => {
            newData.sort((a, b) => sorting.type === 'asc' ?
                compareStrings(a[sorting.key], b[sorting.key]) :
                compareStrings(b[sorting.key], a[sorting.key]));
        });
        return newData;
    }, [data, sortings]);

    const headers = [
        { label: 'קבוצה', key: 'group', sortable: true },
        { label: 'חניך', key: 'name', sortable: true },
        { label: 'מגמה', key: 'major', sortable: true },
        { label: 'שם הפרויקט', key: 'title' },
        { label: 'מנחה מבוקש', key: 'requestedMaster', sortable: true },
        { label: 'מנחה', key: 'master', sortable: true },
    ]


    const clickOnProject = async (studentId) => {
        await userActions.switchToStudent(studentId, window.location.pathname);
        setTimeout(() => { router.push('/project'); }, 200);
    }

    const selectMaster = async (studentId, projectId, masterId) => {
        await adminActions.assignMasterToProject(studentId, projectId, masterId);
    }

    const handleSort = (key) => {
        const currentSorting = sortings.find(sorting => sorting.key === key);
        let newSorting = [...sortings];
        if (currentSorting) {
            newSorting = newSorting.filter(sorting => sorting.key !== key);
            newSorting.push({ key, type: currentSorting.type === 'asc' ? 'desc' : 'asc' });
        } else {
            newSorting.push({ key, type: 'asc' });
        }
        setSortings(newSorting);
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
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true" className="h-4 w-4" onClick={() => handleSort(header.key)}>
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
                    {sortedData.map(student => (
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
                                {student.projectId && (
                                    <select
                                        value={student.master?.id || ''}
                                        onChange={e => selectMaster(student.id, student.projectId, e.target.value)}
                                        className="bg-white border border-stone-300 rounded-md p-1"
                                    >
                                        <option value="">בחר מנחה</option>
                                        {staff.map(mentor => (
                                            <option key={mentor.id} value={mentor.id}>
                                                {mentor.first_name} {mentor.last_name}
                                            </option>
                                        ))}
                                    </select>
                                )}
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