'use client'

import { useSearchParams } from 'next/navigation';
import { ReportPage, ReportTitle } from './components/Layout';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { groupsActions, useGroups } from '@/utils/store/useGroups';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Report_General from './components/Report_General';
import Report_Liba from './components/Report_Liba';
import Report_Learning from './components/Report_Learning';
import Report_Vocation from './components/Report_Vocation';
import { supabase } from '@/utils/supabase/client';
import Report_Projects from './components/Report_Projects';
import { toastsActions } from '@/utils/store/useToasts';
import { ResizableSections } from './components/Helpers';




export default function Page() {
    const params = useSearchParams();
    const groupId = params.get('groupId');
    const studentId = params.get('studentId');
    const groups = useGroups(state => state.groups);
    const group = groups.find(g => g.id === groupId);
    const [student, setStudent] = useState(null);
    const pagesContainerRef = useRef(null);

    useEffect(()=>{
        console.log('useEffect groupId', groupId);
        if (!groupId) return;
        groupsActions.loadGroup(groupId);
    },[groupId])

    useEffect(()=>{
        console.log('useEffect group members', group?.id, group?.members);
        if (!group || group.members) return;
        groupsActions.loadClassMembers(group);
    },[group?.id, group?.members])

    useEffect(()=>{
        if (!studentId) return;
        let cancelled = false;
        
        (async () => {
            const { data:publicData, error: publicError } = await supabase.from('report_cards_public').select('*').eq('id', studentId).single();
            if (cancelled) return;
            if (publicError) {
                toastsActions.addFromError(publicError, 'שגיאה בטעינת הדוח הציבורי של התלמיד');
                return;
            }
            const { data: privateData, error: privateError } = await supabase.from('report_cards_private').select('mentors').eq('id', studentId).single();
            if (cancelled) return;
            if (privateError) {
                toastsActions.addFromError(privateError, 'שגיאה בטעינת הדוח הפרטי של התלמיד');
                return;
            }
            setStudent({...publicData, ...privateData});
        })();
        
        return () => { cancelled = true; };
    },[studentId])

    const sortedMembers = useMemo(() => {
        if (!group?.members) return [];
        return [...group.members]
            .filter(member => member.role === 'student')
            .sort((a, b) => a.first_name.localeCompare(b.first_name));
    }, [group?.members]);

    const { studentIndex, lastStudent, nextStudent, member } = useMemo(() => {
        const idx = sortedMembers.findIndex(m => m.id === studentId);
        return {
            studentIndex: idx,
            lastStudent: idx >= 0 ? sortedMembers[(idx - 1 + sortedMembers.length) % sortedMembers.length] : null,
            nextStudent: idx >= 0 ? sortedMembers[(idx + 1) % sortedMembers.length] : null,
            member: group?.members?.find(m => m.id === studentId)
        };
    }, [sortedMembers, studentId, group?.members]);

    const studentData = useMemo(() => ({
        ...member,
        student
    }), [member, student]);

    if (!group || !group.members || !student) return null;

    console.log('rerender')

    return (
        <div className='overflow-y-auto w-full'>
            <div className='flex justify-between items-center sticky top-0 bg-white px-8 py-4 border-b border-gray-200'>
                <Link href={`/staff/report?groupId=${group.id}&studentId=${lastStudent.id}`} className='flex items-center gap-2 text-sm hover:bg-gray-200 rounded-full p-2'>
                    <ArrowRight className='w-4 h-4' />
                    {lastStudent.first_name} {lastStudent.last_name}
                </Link>
                <div className='text-lg font-bold'>{studentData.first_name} {studentData.last_name}</div>
                <Link href={`/staff/report?groupId=${group.id}&studentId=${nextStudent.id}`} className='flex items-center gap-2 text-sm hover:bg-gray-200 rounded-full p-2'>
                    <ArrowLeft className='w-4 h-4' />
                    {nextStudent.first_name} {nextStudent.last_name}
                </Link>
            </div>

            <div ref={pagesContainerRef} data-print-root className='bg-gray-300 p-4 flex flex-col items-center gap-12 pb-16'>
                <ReportPage>
                    <ReportTitle student={studentData} group={group}/>
                    <ResizableSections
                        topSection={<Report_General student={studentData} />}
                        bottomSection={<Report_Liba student={studentData} />}
                        initialRatio={0.6}
                    />
                </ReportPage>

                <ReportPage>
                    <Report_Projects student={studentData} group={group}/>
                </ReportPage>

                <ReportPage>
                    <ResizableSections
                        topSection={<Report_Learning student={studentData} />}
                        bottomSection={<Report_Vocation student={studentData} />}
                        initialRatio={0.5}
                    />
                </ReportPage>
            </div>
        </div>
    )
}
