import { useGantt } from "@/utils/useGantt";
import { projectActions } from "@/utils/useProject";

export default function NewProjectDialog(){
    const term = useGantt((state) => state.currTerm);

    const onSubmit = async () => {
        await projectActions.createProject();
    };

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-2xl font-bold mb-4'>הגיע הזמן להתחיל פרויקט חדש לתקופת {term?.name || ''}</h1>
            <p className='text-gray-600 mb-8'>איזה כיף יהיה להתחיל פרויקט חדש!</p>
            <button className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                onClick={onSubmit}>
                צור פרויקט חדש
            </button>
        </div>
    )
}