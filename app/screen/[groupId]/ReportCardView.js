'use client'

import { getDashboardSections } from "@/utils/reportConfig";
import Avatar from "@/components/Avatar";

const FIXED_CHECKS = {
    ikigai:   { label: 'איקיגאי',      check: r => !!r?.ikigai },
    portfolio:{ label: 'פורטפוליו',    check: r => !!r?.portfolio_url },
    liba:     { label: 'ליבה',          check: r => !!r?.liba?.answer },
    learning: { label: 'למידה',         check: r => !!(r?.learning?.topics?.some(t => t.name && t.learnings?.some(l => l)) || r?.learning?.answer) },
    vocation: { label: 'יזמות מקיימת', check: r => !!r?.vocation?.employmentAnswer },
};

function getSectionItems(sections) {
    return sections.flatMap(section => {
        if (section.columns?.length > 0) {
            return section.columns.map(col => ({ label: col.label, check: col.check, bad: col.bad }));
        }
        const fixed = FIXED_CHECKS[section.key];
        return fixed ? [fixed] : [];
    });
}

export default function ReportCardView({ group, reportCardsData }) {
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

    if (students.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xl text-muted-foreground">אין נתוני תעודה לקבוצה זו</p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-3 content-start justify-center overflow-y-auto h-full pb-2">
            {students.map(student => (
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
    const doneCount = sectionItems.filter(item => item.check(student)).length;
    const allDone = sectionItems.length > 0 && doneCount === sectionItems.length;

    return (
        <div className={`bg-card rounded-lg p-3 border flex flex-col gap-2 w-[185px] ${allDone ? 'border-green-600/50' : 'border-border'}`}>
            <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Avatar user={student} className="w-7 h-7 shrink-0" hoverScale={false} />
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{student.first_name} {student.last_name}</div>
                </div>
                <span className={`text-xs font-mono shrink-0 ${allDone ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {doneCount}/{sectionItems.length}
                </span>
            </div>
            <div className="flex flex-col gap-0.5">
                {sectionItems.map((item, idx) => {
                    const isGood = item.check(student);
                    const isBad = !isGood && item.bad?.(student);
                    return (
                        <div key={idx} className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs font-medium ${
                            isGood
                                ? 'text-green-400'
                                : isBad
                                    ? 'bg-orange-500/20 text-orange-300'
                                    : 'bg-yellow-500/15 text-yellow-300'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isGood ? 'bg-green-500' : isBad ? 'bg-orange-500' : 'bg-yellow-400'
                            }`} />
                            {item.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
