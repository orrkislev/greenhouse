'use client'

import { useProject } from "@/utils/store/useProject";
import NewProjectDialog from "./components/NewProjectDialog";
import ProjectProposal from "./components/ProjectProposal";
import ProjectDashboard, { ProjectImage, ProjectName } from "./components/ProjectDashboard";
import ContextBar, { PageMain } from "@/components/ContextBar";
import ProjectContext from "./components/ProjectContext";
import { DashboardLayout, DashboardMain, DashboardPanel, DashboardPanelButton } from "@/components/DashboardLayout";
import { ProjectReview } from "./components/ProjectReview";
import { useState, useEffect } from "react";

export default function ProjectPage2() {
    const project = useProject();
    const [view, setView] = useState('dashboard');

    useEffect(() => {
        if (project?.status === 'draft') {
            setView('proposal');
        }
    }, [project?.status]);

    return (
        <>
            {project ? (
                <DashboardLayout>
                    <DashboardPanel>
                        <DashboardPanelButton onClick={() => setView('proposal')} $active={view === 'proposal'}>הצהרת כוונות</DashboardPanelButton>
                        <DashboardPanelButton onClick={() => setView('dashboard')} $active={view === 'dashboard'}>ניהול הפרויקט</DashboardPanelButton>
                        <DashboardPanelButton onClick={() => setView('review')} $active={view === 'review'}>משוב ורפלקציה</DashboardPanelButton>
                    </DashboardPanel>
                    <DashboardMain>
                        <div className="gap-3 flex flex-col">
                            <ProjectImage />
                            <div className='flex flex-col gap-3 px-4'>
                                <ProjectName />
                                {view === 'proposal' && <ProjectProposal />}
                                {view === 'dashboard' && <ProjectDashboard />}
                                {view === 'review' && <ProjectReview />}
                            </div>
                        </div>
                    </DashboardMain>
                </DashboardLayout>
            ) : (
                <PageMain>
                    <NewProjectDialog />
                </PageMain>
            )}
            <ContextBar name="" initialOpen={view === 'proposal'}>
                <ProjectContext />
            </ContextBar>
        </>
    )
}