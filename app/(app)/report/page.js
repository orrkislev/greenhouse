'use client'

import { DashboardLayout, DashboardMain, DashboardPanel, DashboardPanelButton } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/utils/store/useUser";
import { supabase } from "@/utils/supabase/client";
import { toastsActions } from "@/utils/store/useToasts";
import Ikigai from "./ikigai";
import Liba from "./Liba";
import Learning from "./Learning";
import Vocation from "./Vocation";
import Term from "./Term";
import FinalProject from "./FinalProject";
import PersonalGoals from "./PersonalGoals";
import Portfolio from "./Portfolio";
import { useUserGroups } from "@/utils/store/useGroups";

export default function ReportPage() {
    const searchParams = useSearchParams();
    const viewParam = searchParams.get('view');
    const [view, setView] = useState(viewParam || 'ikigai');
    const userId = useUser(state => state.user?.id);
    const [data, setData] = useState(null);
    const groups = useUserGroups();
    const userClass = groups.find(group => group.type === 'class');

    useEffect(() => {
        if (!userId) return;
        (async () => {
            const { data, error } = await supabase.from('report_cards_public').select('*').eq('id', userId).single();
            if (error) toastsActions.addFromError(error);
            setData(data);
        })();
    }, [userId]);

    useEffect(() => {
        if (viewParam) setView(viewParam);
    }, [viewParam]);

    const handleSave = async (key, data) => {
        const { error } = await supabase.from('report_cards_private').update({ [key]: data }).eq('id', userId).single();
        if (error) toastsActions.addFromError(error);
        setData(prev => ({ ...prev, [key]: data }));
    }

    return (
        <DashboardLayout>
            <DashboardPanel>
                <DashboardPanelButton onClick={() => setView('ikigai')} $active={view === 'ikigai'}>איקיגאי</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('portfolio')} $active={view === 'portfolio'}>פורטפוליו</DashboardPanelButton>

                <DashboardPanelButton onClick={() => setView('liba')} $active={view === 'liba'}>ליבה</DashboardPanelButton>
                {(userClass?.description == '1' || userClass?.description == '2') && (
                    <>
                        <DashboardPanelButton onClick={() => setView('autumn')} $active={view === 'autumn'}>תקופת סתו</DashboardPanelButton>
                        <DashboardPanelButton onClick={() => setView('winter')} $active={view === 'winter'}>תקופת חורף</DashboardPanelButton>
                    </>
                )}
                {userClass?.description == '3' && (
                    <DashboardPanelButton onClick={() => setView('finalProject')} $active={view === 'finalProject'}>פרויקט גמר</DashboardPanelButton>
                )}
                {userClass?.description == '4' && (
                    <DashboardPanelButton onClick={() => setView('personalGoals')} $active={view === 'personalGoals'}>מטרות אישיות</DashboardPanelButton>
                )}
                <DashboardPanelButton onClick={() => setView('learning')} $active={view === 'learning'}>למידה</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('vocation')} $active={view === 'vocation'}>יזמות מקיימת</DashboardPanelButton>
            </DashboardPanel>
            <DashboardMain>
                <div className="gap-3 flex flex-col px-16 py-8">
                    {view === 'ikigai' && <Ikigai ikigai={data?.ikigai} onSave={data => handleSave('ikigai', data)} />}
                    {view === 'liba' && <Liba liba={data?.liba} onSave={data => handleSave('liba', data)} />}
                    {view === 'autumn' && <Term project={data?.autumn_project} research={data?.autumn_research} term='סתו' />}
                    {view === 'winter' && <Term project={data?.winter_project} research={data?.winter_research} term='חורף' />}
                    {view === 'learning' && <Learning learning={data?.learning} onSave={data => handleSave('learning', data)} />}
                    {view === 'vocation' && <Vocation vocation={data?.vocation} onSave={data => handleSave('vocation', data)} />}
                    {view === 'finalProject' && <FinalProject finalProject={data?.special} onSave={data => handleSave('finalProject', data)} />}
                    {view === 'personalGoals' && <PersonalGoals personalGoals={data?.special} onSave={data => handleSave('personalGoals', data)} />}
                    {view === 'portfolio' && <Portfolio portfolio={data?.portfolio_url} />}
                </div>
            </DashboardMain>
        </DashboardLayout>
    )
}