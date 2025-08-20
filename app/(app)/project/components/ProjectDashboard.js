import { projectActions, useProject } from "@/utils/store/useProject";
import ProjectTasks from "./Project Tasks/ProjectTasks";
import ProjectGoals from "./ProjectGoals";
import Box2 from "@/components/Box2";
import ProjectLibrary from "./ProjectLibrary";
import ProjectInfo from "./ProjectInfo";
import SmartText from "@/components/SmartText";
import { Sparkle } from "lucide-react";


export default function ProjectDashboard() {
    return (
        <div className="gap-3 flex flex-col">
            <ProjectName />
            <ProjectInfo />

            <ProjectGoals />
            <ProjectTasks />
            <ProjectLibrary />
        </div>
    );
}


function ProjectName() {
    const project = useProject((state) => state.project);

    const onEdit = (name) => {
        projectActions.updateProject({ ...project, name })
        projectActions.createImage(name)
    }

    return (
        <>
            <div className="w-full h-32 bg-stone-300 bg-cover bg-center bg-no-repeat border-b border-stone-200" style={{ backgroundImage: `url(${project.image})` }}>
                {!project.image && (
                    <div className="w-full h-full flex items-center justify-center">
                        <Sparkle className="w-10 h-10 animate-pulse text-stone-500" />
                    </div>
                )}
            </div>
            <SmartText text={project.name} onEdit={onEdit}
                className="w-full h-full border-none text-center text-2xl font-semibold"
            />
            {/* <input type="text"
                defaultValue={project.name}
                className="w-full h-full border-none text-center text-2xl font-semibold"
                onBlur={(e) => {
                    if (e.target.value !== project.name) {
                        projectActions.updateProject({ ...project, name: e.target.value });
                    }
                }} /> */}
        </>
    );
}