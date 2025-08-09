import { projectActions, useProject } from "@/utils/store/useProject";
import ProjectTasks from "./Project Tasks/ProjectTasks";
import ProjectGoals from "./ProjectGoals";
import ProjectMaster from "./ProjectMaster";
import { Pencil } from "lucide-react";
import { useState } from "react";
import Box2 from "@/components/Box2";
import ProjectLibrary from "./ProjectLibrary";


export default function ProjectDashboard() {
    return (
        <div className="gap-3 flex flex-col">
            <div className="flex gap-3">
                <ProjectName />
                <ProjectMaster />
            </div>

            <ProjectGoals />
            <ProjectTasks />
            <ProjectLibrary />
        </div>
    );
}


function ProjectName() {
    const project = useProject((state) => state.project);

    return (
        <Box2 label="שם הפרויקט" className="flex-1 !pt-4 group">
            <input type="text"
                defaultValue={project.name}
                className="w-full h-full border-none text-center"
                onBlur={(e) => {
                    if (e.target.value !== project.name) {
                        projectActions.updateProject({ ...project, name: e.target.value });
                    }
                }} />

        </Box2>
    );
}