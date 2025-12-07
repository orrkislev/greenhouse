import Button from "@/components/Button";
import { projectActions, useProjectData } from "@/utils/store/useProject";
import { BETWEEN_TERMS, useTime } from "@/utils/store/useTime";
import { Fish, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function NewProjectDialog() {
    const term = useTime(state => state.currTerm);
    const allProjects = useProjectData(state => state.allProjects);

    useEffect(() => {
        if (!term || !allProjects) return;
        if (term.id == BETWEEN_TERMS.id)
            projectActions.setProject(allProjects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]);
    }, [term, allProjects])


    const onSubmit = async () => {
        await projectActions.createProject();
    };

    const onContinue = async () => {
        await projectActions.continueProject(allProjects.find(project => project.terms.some(term => term.id === term.id))?.id);
    };

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-2xl font-bold'>הגיע הזמן להתחיל פרויקט חדש לתקופת {term?.name || ''}</h1>
            <p className='text-muted-foreground mb-8'>איזה כיף יהיה להתחיל פרויקט !</p>
            <div className="flex gap-2 justify-center items-center">
                <Button data-role="edit" onClick={onSubmit} className="text-lg group/new-project">
                    <Plus className="w-4 h-4 group-hover/new-project:rotate-90 transition-transform duration-200" />
                    פרויקט חדש
                </Button>
                {allProjects.length > 0 && (
                    <Button data-role="edit" onClick={onContinue} className="text-lg group/new-project">
                        <Fish className="w-4 h-4 group-hover/new-project:rotate-180 transition-transform duration-200" />
                        המשך פרויקט {allProjects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.title}
                    </Button>
                )}
            </div>
            <Image src="/no_project.png" alt="Project" width={600} height={600} className="mt-4" priority={true} />
        </div>
    )
}