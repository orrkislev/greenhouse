import { tw } from '@/utils/tw';
import { Calendar, Snail, Brain } from 'lucide-react';
import { useTime } from "@/utils/store/useTime";
import { differenceInWeeks, startOfWeek } from "date-fns";

const TopBarButton = tw`px-4 py-2 rounded-t-lg font-semibold text-sm transition-all flex items-center gap-2
text-foreground hover:bg-primary hover:text-foreground
${props => props.active ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-orange-200 hover:text-foreground'}`;

export default function ScreenTopBar({ group, viewMode, setViewMode, includeStaff, toggleStaff, isRotating, toggleRotate }) {
    const currTerm = useTime((state) => state.currTerm);

    const dayNumberInTerm = () => {
        if (!currTerm || !currTerm.start) return '';
        const delta = new Date(currTerm.start) - new Date();
        const days = Math.floor(delta / (1000 * 60 * 60 * 24));
        const deltaToEnd = new Date(currTerm.end) - new Date();
        const daysToEnd = Math.floor(deltaToEnd / (1000 * 60 * 60 * 24)) + 1;
        return `היום ה${days} בתקופת ${currTerm.name} (${daysToEnd} ימים נותרו)`;
    }

    const weekInYear = () => {
        const year = (new Date()).getMonth() < 6 ? new Date().getFullYear() - 1 : new Date().getFullYear();
        const yearStart = startOfWeek(new Date(year, 8, 1), { weekStartsOn: 0 });
        const currWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
        const delta = differenceInWeeks(currWeekStart, yearStart) + 1;
        return delta;
    }

    return (
        <div className="flex items-end justify-between gap-3 pt-3 bg-muted">
            {/* Left Side: Group Name and Date Info */}
            <div className="h-full flex items-center mr-8">
                <div className="text-xl font-bold text-foreground">
                    {group?.name}
                </div>
            </div>

            {/* Center: View Mode Buttons and Checkboxes */}
            <div className="flex items-center gap-3 justify-self-end">
                <TopBarButton
                    onClick={() => setViewMode('events')}
                    active={viewMode === 'events'}
                >
                    <Calendar className="w-4 h-4" />
                    לוח זמנים
                </TopBarButton>
                <TopBarButton
                    onClick={() => setViewMode('project')}
                    active={viewMode === 'project'}
                >
                    <Snail className="w-4 h-4" />
                    פרויקטים
                </TopBarButton>
                <TopBarButton
                    onClick={() => setViewMode('research')}
                    active={viewMode === 'research'}
                >
                    <Brain className="w-4 h-4" />
                    חקר
                </TopBarButton>
                
                {/* Checkboxes */}
                <div className="flex items-center gap-4 mr-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-700 hover:text-stone-900">
                        <input
                            type="checkbox"
                            checked={includeStaff}
                            onChange={toggleStaff}
                            className="w-4 h-4 text-slate-900 border-stone-300 rounded focus:ring-slate-900 focus:ring-2"
                        />
                        <span>גם צוות</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-700 hover:text-stone-900">
                        <input
                            type="checkbox"
                            checked={isRotating}
                            onChange={toggleRotate}
                            className="w-4 h-4 text-slate-900 border-stone-300 rounded focus:ring-slate-900 focus:ring-2"
                        />
                        <span>דפדוף</span>
                    </label>
                </div>
            </div>

            {/* Empty space for balance */}
            <div className="text-xs text-muted-foreground flex flex-col gap-0.5 ml-4 mb-2">
                <div className="font-bold">{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                {currTerm && <div>{dayNumberInTerm()}</div>}
                <div>שבוע <span dir="ltr">{weekInYear()}</span> מתוך 42 בשנה</div>
            </div>
        </div>
    );
}
