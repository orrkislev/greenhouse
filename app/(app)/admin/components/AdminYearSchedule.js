"use client"

import { timeActions, useTime, REPORT_SEMESTER_DEFAULTS, getAcademicYearLabel } from "@/utils/store/useTime";
import { format } from "date-fns";
import { Trash } from "lucide-react";
import { Plus } from "lucide-react";
import { useEffect } from "react";

const MONTHS = [
    { value: 1, label: "ינואר" },
    { value: 2, label: "פברואר" },
    { value: 3, label: "מרץ" },
    { value: 4, label: "אפריל" },
    { value: 5, label: "מאי" },
    { value: 6, label: "יוני" },
    { value: 7, label: "יולי" },
    { value: 8, label: "אוגוסט" },
    { value: 9, label: "ספטמבר" },
    { value: 10, label: "אוקטובר" },
    { value: 11, label: "נובמבר" },
    { value: 12, label: "דצמבר" },
];

function ReportSemesterCard({ semesterId, title }) {
    const reportSemesters = useTime(state => state.reportSemesters);
    const semester = { ...REPORT_SEMESTER_DEFAULTS[semesterId], ...reportSemesters?.[semesterId] };

    const onFieldChange = (field, value) => {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) return;
        timeActions.updateReportSemester(semesterId, { [field]: parsed });
    };

    return (
        <div className="border border-stone-300 rounded-md p-3 min-w-72 bg-white">
            <div className="font-semibold text-stone-900 mb-2">{title}</div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-16 text-muted-foreground">מתאריך</span>
                    <select
                        className="border border-stone-300 rounded px-2 py-1"
                        value={semester.start_month}
                        onChange={(e) => onFieldChange("start_month", e.target.value)}
                    >
                        {MONTHS.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        min={1}
                        max={31}
                        className="w-16 border border-stone-300 rounded px-2 py-1"
                        value={semester.start_day}
                        onChange={(e) => onFieldChange("start_day", e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-16 text-muted-foreground">עד</span>
                    <select
                        className="border border-stone-300 rounded px-2 py-1"
                        value={semester.end_month}
                        onChange={(e) => onFieldChange("end_month", e.target.value)}
                    >
                        {MONTHS.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        min={1}
                        max={31}
                        className="w-16 border border-stone-300 rounded px-2 py-1"
                        value={semester.end_day}
                        onChange={(e) => onFieldChange("end_day", e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

export default function AdminYearSchedule() {
    const terms = useTime(state => state.terms);

    useEffect(() => {
        timeActions.loadTerms();
        timeActions.loadReportSemesters();
    }, []);

    const academicYear = getAcademicYearLabel();

    terms.sort((a, b) => new Date(a.start) - new Date(b.start));

    return (
        <div className="relative">
            <div className="mb-6 px-4">
                <h1 className="text-2xl font-bold text-stone-900 mb-2">שנת הלימודים {academicYear}</h1>
                <p className="text-muted-foreground">תכנון שנתי</p>
            </div>

            <div className="flex gap-4 flex-wrap">
                {terms.map(term => (
                    <div key={term.id} className="flex gap-16 group/term p-2 border border-stone-400">
                        <div className="">
                            <input type="text" className="font-semibold text-foreground mb-2" onBlur={(e) => timeActions.updateTerm(term.id, { name: e.target.value })} defaultValue={term.name} />
                            <div className="flex gap-2 text-muted-foreground text-xs">
                                <div className="">מתאריך</div>
                                <input type="date" value={term.start} onChange={(e) => timeActions.updateTerm(term.id, { start: e.target.value })} />
                            </div>
                            <div className="flex gap-2 text-muted-foreground text-xs">
                                <div className="">עד</div>
                                <input type="date" value={term.end} onChange={(e) => timeActions.updateTerm(term.id, { end: e.target.value })}
                                    className="pr-0"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 group-hover/term:opacity-100 opacity-0 transition-opacity duration-300">
                            <button className="text-muted-foreground" onClick={() => timeActions.removeTerm(term.id)}>
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                <button className="min-w-40 min-h-16 flex items-center justify-center text-muted-foreground cursor-pointer bg-primary text-white hover:bg-primary/80 transition-colors duration-300" onClick={() => timeActions.addTerm({
                    name: 'תקופה חדשה',
                    start: format(new Date(), 'yyyy-MM-dd'),
                    end: format(new Date(), 'yyyy-MM-dd'),
                })}>
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="mt-8 px-4">
                <h2 className="text-xl font-bold text-stone-900 mb-3">מחציות דוח</h2>
                <div className="flex gap-4 flex-wrap">
                    <ReportSemesterCard semesterId="A" title="מחצית א" />
                    <ReportSemesterCard semesterId="B" title="מחצית ב" />
                </div>
            </div>
        </div>
    );
}
