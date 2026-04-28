'use client'

import { useUser } from '@/utils/store/useUser'
import { DashboardLayout, DashboardMain, DashboardTitle } from '@/components/DashboardLayout'
import TopicBankManager from './TopicBankManager'
import { redirect } from 'next/navigation'

export default function TopicBankPage() {
    const user = useUser(state => state.user);
    const isStaffUser = user?.role === 'staff';
    const isAdminUser = isStaffUser && user?.is_admin;

    if (user && !isStaffUser) redirect('/');

    return (
        <DashboardLayout>
            <DashboardMain>
                <div className="flex flex-col h-full" dir="rtl">
                    <div className="px-6 py-4 border-b border-stone-200">
                        <DashboardTitle>ניהול בנק נושאים</DashboardTitle>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <TopicBankManager isAdmin={isAdminUser} />
                    </div>
                </div>
            </DashboardMain>
        </DashboardLayout>
    );
}
