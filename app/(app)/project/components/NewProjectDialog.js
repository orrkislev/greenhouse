import Button from "@/components/Button";
import { projectActions } from "@/utils/store/useProject";
import { useTime } from "@/utils/store/useTime";
import { Plus } from "lucide-react";
import Image from "next/image";

export default function NewProjectDialog(){
    const term = useTime(state => state.currTerm);

    const onSubmit = async () => {
        await projectActions.createProject();
    };

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-2xl font-bold'>הגיע הזמן להתחיל פרויקט חדש לתקופת {term?.name || ''}</h1>
            <p className='text-stone-600 mb-8'>איזה כיף יהיה להתחיל פרויקט !</p>
            <Button data-role="edit" onClick={onSubmit} className="text-lg group/new-project">
                <Plus className="w-4 h-4 group-hover/new-project:rotate-90 transition-transform duration-200" />
                פרויקט חדש
            </Button>
            <Image src="/no_project.png" alt="Project" width={600} height={600} className="mt-4" priority={true}/>
        </div>
    )
}