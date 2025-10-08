import { projectActions, useProjectData } from "@/utils/store/useProject";
import ProjectGoals from "./ProjectGoals";
import ProjectLibrary from "./ProjectLibrary";
import ProjectInfo from "./ProjectInfo";
import SmartText from "@/components/SmartText";
import { DotSquare, Image, Sparkle, Trash2 } from "lucide-react";
import ProjectTasks from "./Project Tasks/ProjectTasks";
import Menu, { MenuList, MenuItem } from "@/components/Menu";
import { useMemo, useRef, useState } from "react";


export default function ProjectDashboard() {
    return (
        <div className="gap-3 flex flex-col">
            <ProjectImage />
            <ProjectName />
            <ProjectInfo />

            <ProjectGoals />
            <ProjectTasks />
            <ProjectLibrary />
        </div>
    );
}



const gradients = [
    'linear-gradient(to right, #f7797d, #FBD786, #C6FFDD)',
    'linear-gradient(to right, #99f2c8, #1f4037)',
    'linear-gradient(to right, #009fff, #ec2f4b)',
    'linear-gradient(to right, #fffbd5, #b20a2c)',
]


function ProjectImage() {
    const img = useProjectData(state => state.project.metadata?.image);
    const inputRef = useRef(null);

    const onFile = (e) => {
        if (e.target.files[0]) {
            projectActions.uploadImage(e.target.files[0])
        }
    }



    const imgUrl = useMemo(() =>
        img ?
            'url(' + img + ')' :
            gradients[Math.floor(Math.random() * gradients.length)]
        , [img]);

    return (
        <div className="relative w-full aspect-[20/3] bg-stone-300 bg-cover bg-center bg-no-repeat border-b border-stone-200" style={{ backgroundImage: imgUrl }}>
            <Menu className="absolute left-4 top-4 bg-white">
                <MenuList>
                    <MenuItem title="סגירת הפרויקט" icon={Trash2} onClick={() => projectActions.closeProject()} />
                    <MenuItem title="העלאת תמונה" icon={Image} onClick={() => inputRef.current.click()} />
                    <input type="file" accept="image/*" onChange={onFile} className="hidden" ref={inputRef} />
                </MenuList>
            </Menu>
        </div>
    );
}


function ProjectName() {
    const project = useProjectData(state => state.project);

    const onEdit = (title) => {
        projectActions.updateProject({ title })
    }

    return (
        <SmartText text={project.title} onEdit={onEdit} className="w-full h-full border-none text-center text-2xl font-semibold" />
    );
}