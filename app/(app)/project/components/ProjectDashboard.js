import { projectActions, useProjectData } from "@/utils/store/useProject";
import ProjectGoals from "./ProjectGoals";
import ProjectLibrary from "./ProjectLibrary";
import ProjectInfo from "./ProjectInfo";
import SmartText from "@/components/SmartText";
import { DotSquare, Sparkle, Trash2 } from "lucide-react";
import ProjectTasks from "./Project Tasks/ProjectTasks";
import { useEffect } from "react";
import Menu, { MenuList, MenuItem } from "@/components/Menu";


export default function ProjectDashboard() {
    return (
        <div className="gap-3 flex flex-col">
            <div className="flex justify-end">
                <Menu>
                    <MenuList>
                        <MenuItem title="סגירת הפרויקט" icon={Trash2} onClick={() => projectActions.closeProject()} />
                    </MenuList>
                </Menu>
            </div>
            <ProjectName />
            <ProjectInfo />

            <ProjectGoals />
            <ProjectTasks />
            <ProjectLibrary />
        </div>
    );
}


function ProjectName() {
    const project = useProjectData(state => state.project);

    useEffect(() => {
        if (project && !project.image) {
            projectActions.createImage(project.name)
        }
    }, [project])

    const onEdit = (name) => {
        projectActions.updateProject({ ...project, name })
        setTimeout(() => { projectActions.createImage(name) }, 500)
    }

    const img = !project.image || project.image === 'generating' ? null : project.image;

    return (
        <>
            <div className="w-full h-32 bg-stone-300 bg-cover bg-center bg-no-repeat border-b border-stone-200" style={{ backgroundImage: `url(${img})` }}>
                <div className="w-full h-full flex items-center justify-center">
                    {project.image === 'generating' && <Sparkle className="w-10 h-10 animate-pulse text-stone-500" />}
                    {!project.image && <DotSquare className="w-10 h-10 animate-pulse text-stone-500" />}
                </div>
            </div>
            <SmartText text={project.name} onEdit={onEdit}
                className="w-full h-full border-none text-center text-2xl font-semibold"
            />
        </>
    );
}