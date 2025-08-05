import { useTime } from "@/utils/store/useTime"
import { ScheduleSection } from "../Layout";
import { addDays, addWeeks, differenceInWeeks, endOfWeek, isSameDay, isToday, startOfWeek, subDays } from "date-fns";
import { tw } from "@/utils/tw";

const TermCell = tw`w-full h-full border border-gray-300 p-2 text-gray-500
    ${({ isWeekend }) => isWeekend ? 'bg-blue-200/50' : ''}
    ${({ isToday }) => isToday ? 'bg-green-200/50' : ''}
    ${({ inTerm }) => inTerm ? '' : 'bg-gray-200'}
    ${({ inPast }) => inPast ? 'stripes' : ''}
`;

export default function Term() {
    const currTerm = useTime((state) => state.currTerm);

    const termStart = new Date(currTerm.start);
    const termEnd = new Date(currTerm.end);

    const startDate = startOfWeek(termStart);
    const endDate = endOfWeek(termEnd);

    const numWeeks = differenceInWeeks(endDate, startDate) + 1;
    const weeks = Array.from({ length: numWeeks }, (_, i) => {
        const startWeek = startOfWeek(addWeeks(startDate, i));
        const week = [];
        for (let j = 0; j < 6; j++) {
            const date = addDays(startWeek, j);
            week.push({
                date: new Date(date),
                inTerm: date >= termStart && date <= termEnd,
                isWeekend: j === 5 || j === 6,
                isToday: isToday(date),
                isFirstDayOfTerm: isSameDay(date, termStart),
                isLastDayOfTerm: isSameDay(date, termEnd),
                inPast: date < subDays(new Date(), 1),
            });
        }
        return week;
    });

    return (
        <ScheduleSection>
            {weeks.map((week, i) => week.map((day, j) => (
                <TermCell key={j} inTerm={day.inTerm} isWeekend={day.isWeekend} isToday={day.isToday} inPast={day.inPast}>
                    <div className="text-xs">{day.date.toLocaleDateString('he-IL', { month: 'long', day: 'numeric' })}</div>
                    {day.isFirstDayOfTerm && <div className="text-xs">היום הראשון של התקופה</div>}
                    {day.isLastDayOfTerm && <div className="text-xs">היום האחרון של התקופה</div>}
                </TermCell>
            )))}
        </ScheduleSection>
    )
}