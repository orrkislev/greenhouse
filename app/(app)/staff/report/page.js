'use client'

import { useSearchParams } from 'next/navigation';
import { ReportPage, ReportTitle } from './components/Layout';
import { useEffect, useState } from 'react';
import { groupsActions, useGroups } from '@/utils/store/useGroups';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Report_General from './components/Report_General';
import Report_Liba from './components/Report_Liba';
import Report_Learning from './components/Report_Learning';
import Report_Vocation from './components/Report_Vocation';
import { supabase } from '@/utils/supabase/client';
import Report_Projects from './components/Report_Projects';


export default function PrintPage() {
    const params = useSearchParams();
    const groupId = params.get('groupId');
    const studentId = params.get('studentId');
    const group = useGroups(state => state.groups.find(g => g.id === groupId));
    const [student, setStudent] = useState(null);

    useEffect(()=>{
        if (!groupId) return;
        groupsActions.loadGroup(groupId).then(()=>{
            groupsActions.loadClassMembers(group);
        });
    },[groupId])

    useEffect(()=>{
        if (!group) return;
        groupsActions.loadClassMembers(group);
    },[group])

    useEffect(()=>{
        if (!studentId) return;
        (async () => {
            const { data:publicData, error: publicError } = await supabase.from('report_cards_public').select('*').eq('id', studentId).single();
            if (publicError) toastsActions.addFromError(publicError);
            const { data: privateData, error: privateError } = await supabase.from('report_cards_private').select('mentors').eq('id', studentId).single();
            if (privateError) toastsActions.addFromError(privateError);
            setStudent({...publicData, ...privateData});
        })();
    },[studentId])

    if (!group || !group.members || !student) return null;

    const sortedMembers = group?.members?.sort((a, b) => a.first_name.localeCompare(b.first_name)).filter(member => member.role === 'student');
    const studentIndex = sortedMembers?.findIndex(member => member.id === studentId);
    const lastStudent = studentIndex >= 0 ? sortedMembers?.[(studentIndex - 1 + sortedMembers?.length) % sortedMembers?.length] : null;
    const nextStudent = studentIndex >= 0 ? sortedMembers?.[(studentIndex + 1 + sortedMembers?.length) % sortedMembers?.length] : null;

    const member = group?.members?.find(member => member.id === studentId);
    const studentData = {...member, student};

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

            <div className='bg-gray-300 p-4 flex flex-col items-center gap-12 pb-16'>
                <ReportPage>
                    <ReportTitle student={studentData} group={group}/>
                    <Report_General student={studentData} />
                    <Report_Liba student={studentData} />
                </ReportPage>

                <ReportPage>
                    <Report_Projects student={studentData} group={group}/>
                </ReportPage>

                <ReportPage>
                    <Report_Learning student={studentData} />
                    <Report_Vocation student={studentData} />
                </ReportPage>
            </div>
        </div>
    )
}
