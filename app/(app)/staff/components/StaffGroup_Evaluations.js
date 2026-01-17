import { supabase } from "@/utils/supabase/client"
import { useEffect, useState, useMemo } from "react";
import { toastsActions } from "@/utils/store/useToasts";
import { tw } from "@/utils/tw";
import usePopper from "@/components/Popper";
import { userActions } from "@/utils/store/useUser";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";

const Cell = tw.td` text-center cursor-pointer
    ${p => p.$good ? 'bg-green-400 hover:bg-green-500' : 'bg-stone-200 hover:bg-stone-400'}
    ${p => p.$bad ? 'bg-red-400 hover:bg-red-500' : ''}
`

export default function StaffGroup_Evaluations({ group }) {
    const [data, setData] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const { open, close, Popper } = usePopper();
    const router = useRouter();

    useEffect(() => {
        if (!group || !group.members) return;
        (async () => {
            const { data, error } = await supabase.from('report_cards_public').select('*')
                .in('id', group.members.filter(member => member.role === 'student').map(member => member.id));
            if (error) toastsActions.addFromError(error);
            const { data: privateData, error: privateError } = await supabase.from('report_cards_private').select('id,mentors')
                .in('id', group.members.filter(member => member.role === 'student').map(member => member.id));
            if (privateError) toastsActions.addFromError(privateError);
            setData(group.members.filter(member => member.role === 'student').map(member => ({
                ...member,
                report: {
                    ...data.find(report => report.id === member.id),
                    mentors: privateData.find(report => report.id === member.id)?.mentors || null
                }

            })));
        })();
    }, [group]);

    const openMentorsField = (student) => {
        setSelectedStudent(student);
        open();
    };

    const goToProject = (student, project) => {
        if (!project) return;
        userActions.switchToStudent(student.id, '/project?id=' + project.id + '&view=review');
    };
    const goToResearch = (student, research) => {
        if (!research) return;
        userActions.switchToStudent(student.id, '/research?id=' + research.id + '&view=review');
    };
    const goToReport = (student, section) => userActions.switchToStudent(student.id, '/report?view=' + section);
    const viewFullReport = (student) => router.push(`/staff/report?groupId=${group.id}&studentId=${student.id}`);

    let projectTitles = ['פרויקט סתו', 'חקר סתו', 'פרויקט חורף', 'חקר חורף'];
    if (group.description === '3') projectTitles = ['פרויקט גמר'];
    if (group.description === '4') projectTitles = ['מטרות אישיות'];
    const titles = ['תעודה', 'ממני אליך', 'איקיגאי', 'פורטפוליו', 'ליבה', ...projectTitles, 'למידה', 'יזמות מקיימת'];


    return (
        <div className="flex flex-col gap-2 border border-border p-4 sticky top-0">
            <h4 className="text-lg font-bold">הערכות</h4>

            <table className="text-xs table-auto border-separate border-spacing-1">
                <thead>
                    <tr>
                        {titles.map(title => (
                            <th key={title} className="p-2">{title}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data
                        .sort((a, b) => a.first_name.localeCompare(b.first_name))
                        .map(student => (
                            <tr key={student.id} className="border-b border-border/50 hover:border-2 hover:border-black">
                                <Cell onClick={() => viewFullReport(student)}>{student.first_name} {student.last_name.charAt(0)}.</Cell>
                                <Cell $good={student.report?.mentors}
                                    onClick={() => openMentorsField(student)} />
                                <Cell $good={student.report?.ikigai}
                                    onClick={() => goToReport(student, 'ikigai')} />
                                <Cell $good={student.report?.portfolio_url}
                                    onClick={() => goToReport(student, 'portfolio')} />
                                <Cell $good={student.report?.liba?.answer}
                                    onClick={() => goToReport(student, 'liba')} />
                                {(group.description === '1' || group.description === '2') && (
                                    <>
                                        <Cell $good={student.report?.autumn_project?.summary?.length > 10} $bad={!student.report?.autumn_project}
                                            onClick={() => goToProject(student, student.report?.autumn_project)} />
                                        <Cell $good={student.report?.autumn_research?.summary?.length > 10} $bad={!student.report?.autumn_research}
                                            onClick={() => goToResearch(student, student.report?.autumn_research)} />
                                        <Cell $good={student.report?.winter_project?.summary?.length > 10} $bad={!student.report?.winter_project}
                                            onClick={() => goToProject(student, student.report?.winter_project)} />
                                        <Cell $good={student.report?.winter_research?.summary?.length > 10} $bad={!student.report?.winter_research}
                                            onClick={() => goToResearch(student, student.report?.winter_research)} />
                                    </>
                                )}
                                {group.description === '3' && (
                                    <Cell $good={student.report?.special?.summary?.length > 10} $bad={!student.report?.special}
                                        onClick={() => goToReport(student, 'finalProject')} />
                                )}
                                {group.description === '4' && (
                                    <Cell $good={student.report?.special?.summary?.length > 10} $bad={!student.report?.special}
                                        onClick={() => goToReport(student, 'personalGoals')} />
                                )}
                                <Cell $good={student.report?.learning?.topics?.some(t => t.name && t.learnings.some(l => l)) || student.report?.learning?.answer}
                                    onClick={() => goToReport(student, 'learning')} />
                                <Cell $good={student.report?.vocation?.employmentAnswer}
                                    onClick={() => goToReport(student, 'vocation')} />
                            </tr>
                        ))}
                </tbody>
            </table>

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
                        />
                    </div>
                )}
            </Popper>
        </div>
    )
}




function MentorsEditor({ student, closeModal }) {
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
        const { error } = await supabase
            .from('report_cards_private')
            .update({ mentors: value })
            .eq('id', student.id);
        if (error) toastsActions.addFromError(error);
        setButtonText('רונן!');
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