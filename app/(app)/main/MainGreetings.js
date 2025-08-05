import { useTime } from "@/utils/store/useTime";

export default function MainGreetings() {
    const currTerm = useTime((state) => state.currTerm);

    const timeGreetings = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "בוקר טוב";
        if (hour < 18) return "צהריים טובים";
        return "ערב טוב";
    }


    const dayNumberInTerm = () => {
        if (!currTerm || !currTerm.start) return '';
        const delta = new Date(currTerm.start) - new Date();
        const days = Math.floor(delta / (1000 * 60 * 60 * 24));
        const deltaToEnd = new Date(currTerm.end) - new Date(); 
        const daysToEnd = Math.floor(deltaToEnd / (1000 * 60 * 60 * 24));
        return `היום ה${days} בתקופת ${currTerm.name} (${daysToEnd} יום נותרו)`
    }

    return (
        <div className="flex flex-col p-4">
            <div className="flex flex-col">
                <div className="text-2xl font-bold">
                    {timeGreetings()}
                </div>
                <div> היום {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })} </div>
                <div className="text-sm text-gray-500">
                    {dayNumberInTerm()}
                </div>
            </div>
        </div>
    )
}