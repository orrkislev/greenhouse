'use client'

import { useProject } from "@/utils/store/useProject";
import NewProjectDialog from "./components/NewProjectDialog";
// import NewTermDialog from "./components/NewTermDialog";
import ProjectProposal from "./components/ProjectProposal";
import ProjectDashboard from "./components/ProjectDashboard";
import ContextBar, { PageMain } from "@/components/ContextBar";
import ProjectContext from "./components/ProjectContext";

export default function ProjectPage() {
    const project = useProject();

    let mainContent = null;
    if (!project) mainContent = <NewProjectDialog />;
    // else if (project.isOld) mainContent = <NewTermDialog />;
    else if (project.status === 'draft') mainContent = <ProjectProposal />;
    else mainContent = <ProjectDashboard />;

    return (
        <>
            <PageMain>
                {mainContent}
            </PageMain>
            <ContextBar name="" initialOpen={false}>
                <ProjectContext />
            </ContextBar>
        </>
    )

}