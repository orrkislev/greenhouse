'use client'

import { ReportPage, ReportTitle } from './components/Layout';
import { useEffect, useState, useRef, useMemo } from 'react';
import Report_General from './components/Report_General';
import Report_Liba from './components/Report_Liba';
import Report_Learning from './components/Report_Learning';
import Report_Vocation from './components/Report_Vocation';
import { supabase } from '@/utils/supabase/client';
import Report_Projects from './components/Report_Projects';
import { toastsActions } from '@/utils/store/useToasts';
import { ResizableSections } from './components/Helpers';




export default function PrintReportPage({studentId}) {
    const [student, setStudent] = useState(null);

    useEffect(()=>{
        if (!studentId) return;
        (async () => {
            const { data:publicData, error: publicError } = await supabase.from('report_cards_public').select('*').eq('id', studentId).single();
            if (publicError) {
                toastsActions.addFromError(publicError, 'שגיאה בטעינת הדוח הציבורי של התלמיד');
                return;
            }
            const { data: privateData, error: privateError } = await supabase.from('report_cards_private').select('mentors').eq('id', studentId).single();
            if (privateError) {
                toastsActions.addFromError(privateError, 'שגיאה בטעינת הדוח הפרטי של התלמיד');
                return;
            }
            setStudent({...publicData, ...privateData});
        })();        
    },[studentId])


    if (!student) return null;
    return (
        <div className='print-report-scroll h-screen overflow-y-auto bg-neutral-600'>
            <div data-print-root className='flex flex-col items-center justify-center gap-16'>
                <div data-report-page>
                    <ReportPage>
                        <ReportTitle student={student} />
                        <ResizableSections
                            topSection={<Report_General student={student} />}
                            bottomSection={<Report_Liba student={student} />}
                            initialRatio={0.6}
                        />
                    </ReportPage>
                </div>

                <div data-report-page>
                    <ReportPage>
                        <Report_Projects student={student}/>
                    </ReportPage>
                </div>

                <div data-report-page>
                    <ReportPage>
                        <ResizableSections
                            topSection={<Report_Learning student={student} />}
                            bottomSection={<Report_Vocation student={student} />}
                            initialRatio={0.5}
                        />
                    </ReportPage>
                </div>
            </div>
        </div>
    )
}
