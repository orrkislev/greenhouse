'use client'

import { useProject } from "@/utils/store/useProject";
import NewProjectDialog from "./components/NewProjectDialog";
import NewTermDialog from "./components/NewTermDialog";
import ProjectProposal from "./components/ProjectProposal";
import ProjectDashboard from "./components/ProjectDashboard";

export default function ProjectPage() {
    const project = useProject((state) => state.project);

    if (!project) return <NewProjectDialog />;
    if (project.isOld) return <NewTermDialog />;
    if (!project.master) return <ProjectProposal />;
    else return <ProjectDashboard />;
}