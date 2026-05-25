import { supabase } from "@/utils/supabase/client"
import { useEffect, useState, useMemo } from "react";
import { toastsActions } from "@/utils/store/useToasts";
import { tw } from "@/utils/tw";
import usePopper from "@/components/Popper";
import { userActions } from "@/utils/store/useUser";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { getReportSemester } from "@/utils/store/useTime";
import { getYearSections, ikigaiStatus, portfolioStatus, libaStatus, learningStatus, vocationStatus } from "@/utils/reportConfig";

// Cell color by status:
//   empty     → red    (required section with nothing entered)
//   partial   → orange (in progress but incomplete)
//   attention → yellow (student done; staff must still act)
//   complete  → green  (fully done)
const STATUS_BG = {
    complete:  'bg-green-400 hover:bg-green-500',
    attention: 'bg-yellow-300 hover:bg-yellow-400',
    partial:   'bg-orange-400 hover:bg-orange-500',
    empty:     'bg-red-400 hover:bg-red-500',
};

const Cell = tw.td` text-center cursor-pointer
    ${p => STATUS_BG[p.$status] ?? STATUS_BG.empty}
`

// Severity order: empty > attention > partial > complete
const SEVERITY = { empty: 3, attention: 2, partial: 1, complete: 0 };
const worstStatus = statuses =>
    Object.keys(SEVERITY).find(s => SEVERITY[s] === Math.max(...statuses.map(s => SEVERITY[s] ?? 0)));

// mentors is private data (not in report_cards_public), so its status lives here
const mentorsStatus = r => {
    const m = r?.mentors;
    if (!m?.trim()) return 'empty';
    return m.trim().length >= 10 ? 'complete' : 'partial';
};

export default function StaffGroup_Evaluations({ group }) {
    const [data, setData] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const { open, close, Popper } = usePopper();
    const router = useRouter();

    const currentSemester = getReportSemester() ?? '2026A';
    const semester = currentSemester.slice(4); // 'A' or 'B'
    const sections = getYearSections(group?.description, semester);

    useEffect(() => {
        if (!group || !group.members) return;
        const studentIds = group.members.filter(member => member?.role === 'student').map(member => member.id);
        (async () => {
            const { data, error } = await supabase.from('report_cards_public').select('*')
                .in('id', studentIds)
                .eq('report_semester', currentSemester);
            if (error) toastsActions.addFromError(error, 'שגיאה בטעינת הדוחות הציבוריים');
            const { data: privateData, error: privateError } = await supabase.from('report_cards_private').select('id,mentors')
                .in('id', studentIds)
                .eq('report_semester', currentSemester);
            if (privateError) toastsActions.addFromError(privateError, 'שגיאה בטעינת הדוחות הפרטיים');
            setData(group.members.filter(member => member?.role === 'student').map(member => ({
                ...member,
                report: {
                    ...data?.find(report => report.id === member.id),
                    mentors: privateData?.find(report => report.id === member.id)?.mentors || null
                }
            })));
        })();
    }, [group]);

    const openMentorsField = (student) => {
        setSelectedStudent(student);
        open();
    };

    const goToProject = (student, project, termKey) => {
        if (!project) {
            userActions.switchToStudent(student, '/project');
        } else {
            userActions.switchToStudent(student, '/project?id=' + project.id + '&view=review_' + termKey);
        }
    };
    const goToResearch = (student, research) => {
        if (!research) {
            userActions.switchToStudent(student, '/research');
        } else {
            userActions.switchToStudent(student, '/research?id=' + research.id + '&view=review');
        }
    };
    const goToReport = (student, section) => userActions.switchToStudent(student, '/report?view=' + section);
    const viewFullReport = (student) => window.open(`/print_report/${student.id}`, "_blank", "noopener,noreferrer");

    const columnDefs = sections.flatMap(s => s.columns);

    return (
        <div className="flex flex-col gap-2 border border-border p-4 sticky top-0">
            <h4 className="text-lg font-bold">הערכות</h4>

            <table className="text-xs table-auto border-separate border-spacing-1">
                <thead>
                    <tr>
                        {['תעודה', 'ממני אליך', 'איקיגאי', 'פורטפוליו', 'ליבה'].map(t => <th key={t} className="p-2">{t}</th>)}
                        {columnDefs.map(col => <th key={col.navArg} className="p-2">{col.label}</th>)}
                        {['למידה', 'יזמות מקיימת'].map(t => <th key={t} className="p-2">{t}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data
                        .sort((a, b) => a.first_name.localeCompare(b.first_name))
                        .map(student => (
                            <tr key={student.id} className="border-b border-border/50 hover:border-2 hover:border-black">
                                <Cell $status={worstStatus([
                                    mentorsStatus(student.report),
                                    ikigaiStatus(student.report),
                                    portfolioStatus(student.report),
                                    libaStatus(student.report),
                                    ...columnDefs.map(col => col.status(student.report)),
                                    learningStatus(student.report),
                                    vocationStatus(student.report),
                                ])} onClick={() => viewFullReport(student)}>{student.first_name} {student.last_name.charAt(0)}.</Cell>
                                <Cell $status={mentorsStatus(student.report)}
                                    onClick={() => openMentorsField(student)} />
                                <Cell $status={ikigaiStatus(student.report)}
                                    onClick={() => goToReport(student, 'ikigai')} />
                                <Cell $status={portfolioStatus(student.report)}
                                    onClick={() => goToReport(student, 'portfolio')} />
                                <Cell $status={libaStatus(student.report)}
                                    onClick={() => goToReport(student, 'liba')} />
                                {columnDefs.map(col => (
                                    <Cell key={col.navArg}
                                        $status={col.status(student.report)}
                                        onClick={() => {
                                            if (col.navFn === 'project') goToProject(student, student.report?.[col.navArg], col.termKey);
                                            else if (col.navFn === 'research') goToResearch(student, student.report?.[col.navArg]);
                                            else goToReport(student, col.navArg);
                                        }}
                                    />
                                ))}
                                <Cell $status={learningStatus(student.report)}
                                    onClick={() => goToReport(student, 'learning')} />
                                <Cell $status={vocationStatus(student.report)}
                                    onClick={() => goToReport(student, 'vocation')} />
                            </tr>
                        ))}
                </tbody>
            </table>

            <div className="flex gap-4 text-xs text-stone-500 mt-1">
                {[
                    ['bg-green-400',  'הושלם'],
                    ['bg-yellow-300', 'דורש טיפול'],
                    ['bg-orange-400', 'בתהליך'],
                    ['bg-red-400',    'ריק'],
                ].map(([color, label]) => (
                    <span key={label} className="flex items-center gap-1">
                        <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
                        {label}
                    </span>
                ))}
            </div>

            <Popper className="backdrop-blur-sm p-2">
                {selectedStudent && (
                    <div className="w-2xl">
                        <div className="flex justify-center items-center flex-col mb-2">
                            <div className="">ממני אליך</div>
                            <div className="font-bold text-lg">{selectedStudent.first_name} {selectedStudent.last_name}</div>
                        </div>
                        <MentorsEditor
                            student={selectedStudent}
                            closeModal={close}
                            onSave = {(id, mentors) => setData(prev => prev.map(s => s.id === id ? { ...s, report: { ...s.report, mentors } } : s))}
                        />
                    </div>
                )}
            </Popper>
        </div>
    )
}




function MentorsEditor({ student, closeModal, onSave }) {
    const [value, setValue] = useState(student.report?.mentors || '');
    const [buttonText, setButtonText] = useState('שמור');

    useEffect(() => {
        setValue(student.report?.mentors || '');
    }, [student]);

    const shouldSave = useMemo(() => {
        return value.trim() !== student.report?.mentors?.trim()
    }, [value, student]);


    const save = async () => {
        if (!shouldSave) return;
        setButtonText('...');
        const currentSemester = getReportSemester() ?? '2026A';
        const { error } = await supabase
            .from('report_cards_private')
            .update({ mentors: value })
            .eq('id', student.id)
            .eq('report_semester', currentSemester);
        if (error) toastsActions.addFromError(error, 'שגיאה בשמירת הממני אליך');
        setButtonText('רונן!');
        onSave(student.id, value);
        setTimeout(() => {
            closeModal();
        }, 500);
    };

    return (
        <>
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full min-h-[200px] p-3 border border-border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`${student.first_name} היקר...`}
                dir="rtl"
            />
            <Button data-role="save" onClick={save} disabled={!shouldSave}>{buttonText}</Button>
        </>
    );
}
