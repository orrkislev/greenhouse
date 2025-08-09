'use client'

import { projectActions, useProject } from "@/utils/store/useProject";
import NewProjectDialog from "./components/NewProjectDialog";
import NewTermDialog from "./components/NewTermDialog";
import ProjectProposal from "./components/ProjectProposal";
import ProjectDashboard from "./components/ProjectDashboard";
import { useEffect } from "react";
import ContextBar, { PageMain } from "@/components/ContextBar";
import ProjectContext from "./components/ProjectContext";

export default function ProjectPage() {
    const project = useProject((state) => state.project);

    useEffect(() => {
        projectActions.loadProject();
    }, []);

    let mainContent = null;
    if (!project) mainContent = <NewProjectDialog />;
    else if (project.isOld) mainContent = <NewTermDialog />;
    else if (!project.master) mainContent = <ProjectProposal />;
    else mainContent = <ProjectDashboard />;

    return (
        <>
            <PageMain>
                {mainContent}
            </PageMain>
            <ContextBar name="">
                <ProjectContext />
            </ContextBar>
        </>
    )

}