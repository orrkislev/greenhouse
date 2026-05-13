'use client'

import { DashboardLayout, DashboardMain, DashboardPanel, DashboardPanelButton } from "@/components/DashboardLayout";
import { useState, useEffect, useRef } from "react";
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
import POL from "./POL";
import SummerEvaluation from "./SummerEvaluation";
import { useUserGroups } from "@/utils/store/useGroups";
import { getReportSemester, formatSemesterLabel } from "@/utils/store/useTime";
import { isAdmin } from "@/utils/store/useUser";
import { getYearSections } from "@/utils/reportConfig";
import { initializeReportSemester } from "@/utils/actions/report actions";
import ContextBar from "@/components/ContextBar";
import ReportContext from "./components/ReportContext";
import Link from "next/link";

export const ALLOW_STUDENT_EDIT = true;

export default function ReportPage() {
    const searchParams = useSearchParams();
    const viewParam = searchParams.get('view');
    const [view, setView] = useState(viewParam || 'ikigai');
    const userId = useUser(state => state.user?.id);
    const [data, setData] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const groups = useUserGroups();
    const userClass = groups.find(group => group.type === 'class');
    const userIdRef = useRef(userId);

    useEffect(() => {
        userIdRef.current = userId;
    }, [userId]);

    useEffect(() => {
        if (viewParam) setView(viewParam);
    }, [viewParam]);

    // On load: build the available-semesters list and select the right one
    useEffect(() => {
        if (!userId) return;
        (async () => {
            const { data: semesterList } = await supabase
                .from('report_cards_private')
                .select('report_semester')
                .eq('id', userId)
                .order('report_semester', { ascending: false });

            const available = semesterList?.map(r => r.report_semester) ?? [];

            const current = getReportSemester();
            const target = current ?? available[0] ?? null;

            if (current && !available.includes(current)) {
                try {
                    await initializeReportSemester(userId, current);
                    toastsActions.addToast({
                        message: `ההערכה עבור ${formatSemesterLabel(current)} נוצרה על בסיס העתקה מהמחצית הקודמת`,
                        type: 'success',
                    });
                    setAvailableSemesters([current, ...available]);
                } catch (e) {
                    toastsActions.addToast({ message: 'שגיאה ביצירת ההערכה', type: 'error' });
                    setAvailableSemesters(available);
                }
            } else {
                setAvailableSemesters(available);
            }

            setSelectedSemester(target);
        })();
    }, [userId]);

    // Reload report data whenever the selected semester changes
    useEffect(() => {
        if (!userId || !selectedSemester) return;
        (async () => {
            const { data, error } = await supabase
                .from('report_cards_public')
                .select('*')
                .eq('id', userId)
                .eq('report_semester', selectedSemester)
                .maybeSingle();
            if (error) toastsActions.addFromError(error, 'שגיאה בטעינת ההערכה');
            if (userId !== userIdRef.current) return;
            setData(data ?? null);
        })();
    }, [userId, selectedSemester]);

    const handleSave = async (key, newValue, { silent = false } = {}) => {
        if (!userId || !selectedSemester) {
            if (!silent) toastsActions.addToast({ message: 'אנא המתן לטעינת ההערכה', type: 'error' });
            return;
        }

        const { error } = await supabase
            .from('report_cards_private')
            .upsert({ id: userId, report_semester: selectedSemester, [key]: newValue });

        if (error) {
            if (!silent) toastsActions.addFromError(error, 'שגיאה בשמירת ההערכה');
            throw error;
        }

        if (!silent) toastsActions.addToast({ message: 'נשמר בהצלחה!', type: 'success' });

        if (userId !== userIdRef.current) return;
        setData(prev => ({ ...prev, [key]: newValue }));
    };

    const semesterId = selectedSemester?.slice(4); // "A" or "B"
    const year = userClass?.description;
    const sections = getYearSections(year, semesterId);

    return (
        <>
            <DashboardLayout>
                <DashboardPanel>
                    <DashboardPanelButton onClick={() => setView('ikigai')} $active={view === 'ikigai'}>איקיגאי</DashboardPanelButton>
                    <DashboardPanelButton onClick={() => setView('portfolio')} $active={view === 'portfolio'}>פורטפוליו</DashboardPanelButton>
                    <DashboardPanelButton onClick={() => setView('liba')} $active={view === 'liba'}>ליבה</DashboardPanelButton>
                    {sections.map(section => (
                        <DashboardPanelButton key={section.key} onClick={() => setView(section.key)} $active={view === section.key}>
                            {section.label}
                        </DashboardPanelButton>
                    ))}
                    <DashboardPanelButton onClick={() => setView('learning')} $active={view === 'learning'}>למידה</DashboardPanelButton>
                    <DashboardPanelButton onClick={() => setView('vocation')} $active={view === 'vocation'}>יזמות מקיימת</DashboardPanelButton>

                    {isAdmin() && (
                        <Link href="/topic-bank">
                            <DashboardPanelButton>ניהול בנק נושאים</DashboardPanelButton>
                        </Link>
                    )}
                </DashboardPanel>
                <DashboardMain>
                    <div className="gap-3 flex flex-col px-16 py-8 mb-32">
                        {view === 'ikigai' && <Ikigai ikigai={data?.ikigai} semester={selectedSemester} onSave={val => handleSave('ikigai', val, { silent: true })} />}
                        {view === 'liba' && <Liba liba={data?.liba} onSave={val => handleSave('liba', val, { silent: true })} />}
                        {sections.map(section => {
                            if (view !== section.key) return null;
                            const save = val => handleSave(section.dataKey, val, { silent: true });
                            if (section.component === 'Term') return <Term key={section.key} project={data?.[section.projectKey]} research={data?.[section.researchKey]} term={section.termName} />;
                            if (section.component === 'SummerEval') return <SummerEvaluation key={section.key} evalData={data?.[section.dataKey]} onSave={save} />;
                            if (section.component === 'FinalProject') return <FinalProject key={section.key} finalProject={data?.[section.dataKey]} onSave={save} />;
                            if (section.component === 'PersonalGoals') return <PersonalGoals key={section.key} personalGoals={data?.[section.dataKey]} onSave={save} />;
                            if (section.component === 'POL') return <POL key={section.key} pol={data?.[section.dataKey]} year={year} onSave={save} />;
                            return null;
                        })}
                        {view === 'learning' && <Learning learning={data?.learning} onSave={val => handleSave('learning', val, { silent: true })} />}
                        {view === 'vocation' && <Vocation vocation={data?.vocation} onSave={val => handleSave('vocation', val, { silent: true })} />}
                        {view === 'portfolio' && <Portfolio portfolio={data?.portfolio_url} />}
                    </div>
                </DashboardMain>
            </DashboardLayout>
            <ContextBar name="מחציות" initialOpen={false}>
                <ReportContext
                    semesters={availableSemesters}
                    selected={selectedSemester}
                    onSelect={setSelectedSemester}
                />
            </ContextBar>
        </>
    );
}
