'use client'

import { projectActions, useProject } from "@/utils/store/useProject";
import NewProjectDialog from "./components/NewProjectDialog";
import ProjectProposal from "./components/ProjectProposal";
import ProjectDashboard, { ProjectImage, ProjectName } from "./components/ProjectDashboard";
import ContextBar, { PageMain } from "@/components/ContextBar";
import ProjectContext from "./components/ProjectContext";
import { DashboardLayout, DashboardMain, DashboardPanel, DashboardPanelButton } from "@/components/DashboardLayout";
import { ProjectReview } from "./components/ProjectReview";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ProjectPage2() {
    const searchParams = useSearchParams();
    const project = useProject();
    const projectId = searchParams.get('id');
    const viewParam = searchParams.get('view');
    const [view, setView] = useState(viewParam || 'dashboard');

    useEffect(() => {
        if (viewParam) setView(viewParam);
    }, [viewParam]);

    useEffect(() => {
        if (projectId) projectActions.loadProjectById(projectId);
    }, [projectId]);

    // useEffect(() => {
    //     if (project?.status === 'draft') setView('proposal');
    // }, [project?.status]);

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
            <ContextBar name="" initialOpen={!project}>
                <ProjectContext />
            </ContextBar>
        </>
    )
}