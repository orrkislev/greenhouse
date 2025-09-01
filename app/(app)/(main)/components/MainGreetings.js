import { useUser } from "@/utils/store/useUser";
import { useTime } from "@/utils/store/useTime";
import { differenceInWeeks, startOfWeek } from "date-fns";

export default function MainGreetings() {
    const currTerm = useTime((state) => state.currTerm);
    const user = useUser(state => state.user);

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
        const daysToEnd = Math.floor(deltaToEnd / (1000 * 60 * 60 * 24)) + 1;
        return `היום ה${days} בתקופת ${currTerm.name} (${daysToEnd} ימים נותרו)`
    }

    const weekInYear = () => {
        const year = (new Date()).getMonth() < 6 ? new Date().getFullYear() - 1 : new Date().getFullYear();
        const yearStart = startOfWeek(new Date(year, 8, 1), { weekStartsOn: 0 });
        const currWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
        const delta = differenceInWeeks(currWeekStart, yearStart);
        return delta;
    }

    return (
        <div className="flex justify-between">
            <div>
                <div className="text-2xl font-bold ">{timeGreetings()}, {user.firstName}</div>
                <div className="font-light text-sm -mt-1"> היום {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })} </div>
            </div>
            <div className="text-sm text-stone-500 font-light flex flex-col items-end">
                <div>
                    {dayNumberInTerm()}
                </div>
                <div>
                    שבוע <span dir="ltr">{weekInYear()}</span> מתוך 42 בשנה
                </div>
            </div>
        </div>
    )
}