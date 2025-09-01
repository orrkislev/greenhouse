import Button from "@/components/Button";
import { projectActions } from "@/utils/store/useProject";
import { useTime } from "@/utils/store/useTime";
import { ArrowLeft, Plus } from "lucide-react";
import Image from "next/image";

export default function NewTermDialog() {
    const term = useTime((state) => state.currTerm);

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-2xl font-bold mb-4'> החלה תקופת {term?.name || ''}</h1>
            <p className='text-stone-600 mb-8'>האם ברצונך להמשיך את הפרויקט הנוכחי או להתחיל פרויקט חדש?</p>
            <div className='flex gap-4'>
                <Button onClick={async () => {
                    await projectActions.continueProject();
                }}>
                    המשך פרויקט קיים
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button data-role="main-new" onClick={async () => {
                    await projectActions.createProject();
                }}>
                    התחל פרויקט חדש
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <Image src="/no_project.png" alt="Project" width={600} height={600} className="mt-4" priority={true}/>

        </div>
    );
}