import { projectActions, useProjectData } from "@/utils/store/useProject";
import ProjectGoals from "./ProjectGoals";
import dynamic from "next/dynamic";
import ProjectInfo from "./ProjectInfo";
import SmartText from "@/components/SmartText";
import { Image, Trash2 } from "lucide-react";
import ProjectTasks from "./Project Tasks/ProjectTasks";
import Menu, { MenuList, MenuItem } from "@/components/Menu";
import { useMemo, useRef } from "react";

// Dynamic import to prevent TLDraw CSS from loading globally
const ProjectLibrary = dynamic(() => import("./ProjectLibrary"), { ssr: false });


export default function ProjectDashboard() {
    return (
        <>
            <ProjectInfo />
            <ProjectGoals />
            <ProjectTasks />
            <ProjectLibrary />
        </>
    );
}



export function ProjectImage() {
    const img = useProjectData(state => state.project.metadata?.image);
    const inputRef = useRef(null);

    const onFile = (e) => {
        if (e.target.files[0]) {
            projectActions.uploadImage(e.target.files[0])
        }
    }

    const imgUrl = useMemo(() =>
        img ? 'url(' + img + ')' : 'url(/images/fun.png)'
        , [img]);

    return (
        <div className="relative w-full aspect-[20/3] bg-stone-300 bg-cover bg-center bg-no-repeat border-b border-pastel-6/50" style={{ backgroundImage: imgUrl }}>
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


export function ProjectName() {
    const project = useProjectData(state => state.project);

    const onEdit = (title) => {
        projectActions.updateProject({ title })
    }

    return (
        <SmartText text={project.title} onEdit={onEdit} className="w-full h-full border-none text-center text-2xl font-semibold" />
    );
}