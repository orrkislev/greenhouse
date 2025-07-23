'use client'

import WithAuth from "@/components/WithAuth";
import ProjectIntentions from "./components/ProjectIntentions";
import ProjectOverview from "./components/ProjectOverview";
import { useProject } from "@/utils/useProject";
import NewProjectDialog from "./components/NewProjectDialog";
import NewTermDialog from "./components/NewTermDialog";

export default function ProjectPage() {

    return <WithAuth>
        <ProjectPageActual />
    </WithAuth>;
}

function ProjectPageActual() {
    const project = useProject((state) => state.project);

    if (!project) return <NewProjectDialog />;
    if (project.isOld) return <NewTermDialog />;
    if (!project.master) return <ProjectIntentions />;
    else return <ProjectOverview />;
}