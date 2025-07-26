import { projectActions } from "@/utils/useProject";
import { useTime } from "@/utils/useTime";

export default function NewTermDialog() {
    const term = useTime((state) => state.currTerm);

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-2xl font-bold mb-4'>תקופת {term?.name || ''}</h1>
            <p className='text-gray-600 mb-8'>האם ברצונך להמשיך את הפרויקט הנוכחי או להתחיל פרויקט חדש?</p>
            <div className='flex gap-4'>
                <button
                    className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'
                    onClick={async () => {
                        await projectActions.continueProject();
                    }}
                >
                    המשך פרויקט קיים
                </button>
                <button
                    className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                    onClick={async () => {
                        await projectActions.createProject();
                    }}
                >
                    התחל פרויקט חדש
                </button>
            </div>
        </div>
    );
}