'use client'

import { getDashboardSections, ikigaiStatus, portfolioStatus, libaStatus, learningStatus, vocationStatus } from "@/utils/reportConfig";
import Avatar from "@/components/Avatar";

const FIXED_STATUS = {
    ikigai:   { label: 'איקיגאי',      status: ikigaiStatus },
    portfolio:{ label: 'פורטפוליו',    status: portfolioStatus },
    liba:     { label: 'ליבה',          status: libaStatus },
    learning: { label: 'למידה',         status: learningStatus },
    vocation: { label: 'יזמות מקיימת', status: vocationStatus },
};

function getSectionItems(sections) {
    return sections.flatMap(section => {
        if (section.columns?.length > 0) {
            return section.columns.map(col => ({ label: col.label, status: col.status }));
        }
        const fixed = FIXED_STATUS[section.key];
        return fixed ? [fixed] : [];
    });
}

// Shorten labels so items fit in a compact 2-column card
const abbrev = label =>
    label
        .replace(/^פרויקט\s+/, 'פ. ')
        .replace(/^חקר\s+/, 'ח. ')
        .replace('ועדה למגמות', 'קיץ')
        .replace('יזמות מקיימת', 'יזמות');

export default function ReportCardView({ group, reportCardsData, includeStaff }) {
    if (!reportCardsData) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xl text-muted-foreground">אין נתוני תעודה לקבוצה זו</p>
            </div>
        );
    }

    const { students, semester } = reportCardsData;
    const semesterLetter = semester.slice(4);
    const sections = getDashboardSections(group?.description, semesterLetter);
    const sectionItems = getSectionItems(sections);

    // Filter out staff unless explicitly included
    const staffIds = new Set(
        (group?.students || []).filter(m => m.role !== 'student').map(m => m.id)
    );
    const visibleStudents = includeStaff ? students : students.filter(s => !staffIds.has(s.id));

    if (visibleStudents.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xl text-muted-foreground">אין נתוני תעודה לקבוצה זו</p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2 content-start justify-center overflow-y-auto h-full pb-2">
            {visibleStudents.map(student => (
                <StudentReportCard
                    key={student.id}
                    student={student}
                    sectionItems={sectionItems}
                />
            ))}
        </div>
    );
}

function StudentReportCard({ student, sectionItems }) {
    const doneCount = sectionItems.filter(item => item.status(student) === 'complete').length;
    const allDone = sectionItems.length > 0 && doneCount === sectionItems.length;

    return (
        <div className={`bg-card rounded-lg p-2 border flex flex-col gap-1 w-[155px] ${allDone ? 'border-green-600/50' : 'border-border'}`}>
            <div className="flex items-center gap-1.5 pb-1 border-b border-border">
                <Avatar user={student} className="w-5 h-5 shrink-0" hoverScale={false} />
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-foreground truncate">{student.first_name} {student.last_name}</div>
                </div>
                <span className={`text-[10px] font-mono shrink-0 ${allDone ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {doneCount}/{sectionItems.length}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                {sectionItems.map((item, idx) => {
                    const st = item.status(student);
                    return (
                        <div key={idx} className={`flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium ${
                            st === 'complete'
                                ? 'text-green-400'
                                : st === 'attention'
                                    ? 'bg-yellow-500/20 text-yellow-300'
                                    : st === 'partial'
                                        ? 'bg-orange-500/20 text-orange-300'
                                        : 'bg-red-500/20 text-red-300'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                st === 'complete' ? 'bg-green-500'
                                : st === 'attention' ? 'bg-yellow-400'
                                : st === 'partial' ? 'bg-orange-400'
                                : 'bg-red-400'
                            }`} />
                            {abbrev(item.label)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
