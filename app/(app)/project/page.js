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
import { useTime } from "@/utils/store/useTime";


export default function ProjectPage2() {
    const searchParams = useSearchParams();
    const project = useProject();
    const allTerms = useTime(state => state.terms);
    const projectId = searchParams.get('id');
    const viewParam = searchParams.get('view');
    const [view, setView] = useState(viewParam || 'dashboard');

    const projectTerms = (project?.term || [])
        .map(id => allTerms.find(t => t.id === id))
        .filter(Boolean);

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
                        {projectTerms.length > 1
                            ? projectTerms.map((term, i) => (
                                <DashboardPanelButton key={term.id} onClick={() => setView(`review_${term.id}`)} $active={view === `review_${term.id}`}>
                                    {i === projectTerms.length - 1 ? 'משוב סוף הפרויקט' : `משוב תקופת ${term.name}`}
                                </DashboardPanelButton>
                            ))
                            : <DashboardPanelButton onClick={() => setView('review')} $active={view === 'review'}>משוב ורפלקציה</DashboardPanelButton>
                        }
                    </DashboardPanel>
                    <DashboardMain>
                        <div className="gap-3 flex flex-col">
                            <ProjectImage />
                            <div className='flex flex-col gap-3 px-4'>
                                <ProjectName />
                                {view === 'proposal' && <ProjectProposal />}
                                {view === 'dashboard' && <ProjectDashboard />}
                                {view === 'review' && <ProjectReview />}
                                {projectTerms.map((term, i) => (
                                    view === `review_${term.id}` && (
                                        <ProjectReview key={term.id} term={term}
                                            title={i === projectTerms.length - 1 ? 'משוב סוף הפרויקט' : `משוב תקופת ${term.name}`} />
                                    )
                                ))}
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