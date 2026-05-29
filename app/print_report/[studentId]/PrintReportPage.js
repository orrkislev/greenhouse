'use client'

import { ReportPage, ReportTitle } from './components/Layout';
import { Fragment, useEffect, useState } from 'react';
import Report_General from './components/Report_General';
import Report_Liba from './components/Report_Liba';
import Report_Learning from './components/Report_Learning';
import Report_Vocation from './components/Report_Vocation';
import { supabase } from '@/utils/supabase/client';
import Report_Projects from './components/Report_Projects';
import Report_POL from './components/Report_POL';
import Report_Majors from './components/Report_Majors';
import { toastsActions } from '@/utils/store/useToasts';
import { ResizableSections } from './components/Helpers';
import Report_Portfolio from './components/Report_Portfolio';
import { formatSemesterLabel, getReportSemester } from '@/utils/store/useTime';
import { SECTION_DEFS, getPrintPages } from '@/utils/reportConfig';

const PRINT_COMPONENTS = {
    Report_General,
    Report_Liba,
    Report_Learning,
    Report_Vocation,
    Report_Portfolio,
    Report_Projects,
    Report_POL,
    Report_Majors,
    ChamamaLogo,
};

function ChamamaLogo() {
    return (
        <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center justify-center">
                <img src="/images/report/chamamaLarge.jpg" alt="logo" className="h-64 grayscale" />
            </div>
        </div>
    );
}

function renderSection(key, student, semester) {
    const def = SECTION_DEFS[key];
    const Comp = PRINT_COMPONENTS[def.printComponent];
    return <Comp student={student} variant={def.printVariant} semester={semester} />;
}

export default function PrintReportPage({ studentId, semester }) {
    const [student, setStudent] = useState(null);

    useEffect(() => {
        if (!studentId) return;
        (async () => {
            // Determine which semester to print: use provided semester, or fall back to the latest one
            let targetSemester = semester;
            if (!targetSemester) {
                const { data: latestRow } = await supabase
                    .from('report_cards_private')
                    .select('report_semester')
                    .eq('id', studentId)
                    .order('report_semester', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                targetSemester = latestRow?.report_semester;
            }

            if (!targetSemester) return;

            const { data: publicData, error: publicError } = await supabase
                .from('report_cards_public')
                .select('*')
                .eq('id', studentId)
                .eq('report_semester', targetSemester)
                .single();
            if (publicError) {
                toastsActions.addFromError(publicError, 'שגיאה בטעינת הדוח הציבורי של התלמיד');
                return;
            }
            const { data: privateData, error: privateError } = await supabase
                .from('report_cards_private')
                .select('mentors')
                .eq('id', studentId)
                .eq('report_semester', targetSemester)
                .single();
            if (privateError) {
                toastsActions.addFromError(privateError, 'שגיאה בטעינת הדוח הפרטי של התלמיד');
                return;
            }
            setStudent({ ...publicData, ...privateData });
        })();
    }, [studentId, semester])

    useEffect(() => {
        if (student) {
            document.title = `הערכה ${formatSemesterLabel(semester ?? getReportSemester())} - ${student.first_name} ${student.last_name}`;
        }
    }, [student])

    if (!student) return null;

    const semesterLetter = (semester ?? getReportSemester()).slice(-1); // 'A' or 'B'
    const pages = getPrintPages(student.year, semesterLetter);

    return (
        <div className='print-report-scroll h-screen overflow-y-auto bg-neutral-600'>
            <div data-print-root className='flex flex-col items-center justify-center gap-16'>
                {pages.map((page, i) => {
                    // const isLogoPage = page.type === 'stack' && page.sections.includes('chamama_logo');
                    const isLogoPage = i == 0
                    return (
                        <div key={i} data-report-page>
                            <ReportPage
                                withChamama={isLogoPage}
                                withAvoda={isLogoPage}
                                withHodHasharon={isLogoPage}
                                withAmal={isLogoPage}
                            >
                                {i === 0 && <ReportTitle student={student} />}
                                {page.type === 'resizable' && (
                                    <ResizableSections
                                        topSection={renderSection(page.top, student, semesterLetter)}
                                        bottomSection={renderSection(page.bottom, student, semesterLetter)}
                                        initialRatio={page.initialRatio}
                                    />
                                )}
                                {page.type === 'stack' && page.sections.map(key => (
                                    <Fragment key={key}>
                                        {renderSection(key, student, semesterLetter)}
                                    </Fragment>
                                ))}
                            </ReportPage>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
