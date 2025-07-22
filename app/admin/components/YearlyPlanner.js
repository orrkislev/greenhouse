"use client"

import { useMemo } from "react";

export default function YearlyPlanner(props) {
    const months = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [
            { name: 'August', nameHe: 'אוגוסט', year: currentYear, monthIndex: 7 },
            { name: 'September', nameHe: 'ספטמבר', year: currentYear, monthIndex: 8 },
            { name: 'October', nameHe: 'אוקטובר', year: currentYear, monthIndex: 9 },
            { name: 'November', nameHe: 'נובמבר', year: currentYear, monthIndex: 10 },
            { name: 'December', nameHe: 'דצמבר', year: currentYear, monthIndex: 11 },
            { name: 'January', nameHe: 'ינואר', year: currentYear + 1, monthIndex: 0 },
            { name: 'February', nameHe: 'פברואר', year: currentYear + 1, monthIndex: 1 },
            { name: 'March', nameHe: 'מרץ', year: currentYear + 1, monthIndex: 2 },
            { name: 'April', nameHe: 'אפריל', year: currentYear + 1, monthIndex: 3 },
            { name: 'May', nameHe: 'מאי', year: currentYear + 1, monthIndex: 4 },
            { name: 'June', nameHe: 'יוני', year: currentYear + 1, monthIndex: 5 },
            { name: 'July', nameHe: 'יולי', year: currentYear + 1, monthIndex: 6 },
            { name: 'August', nameHe: 'אוגוסט', year: currentYear + 1, monthIndex: 7 },
        ];
    }, []);

    const renderMonthRow = (month) => {
        const daysInMonth = getDaysInMonth(month.year, month.monthIndex);
        const firstDay = getFirstDayOfMonth(month.year, month.monthIndex); // 0 = Sunday, 1 = Monday, etc.
        const cells = [];

        // Add cells for each column (42 total - 6 weeks)
        for (let col = 0; col < 42; col++) {
            const isValidDay = col >= firstDay && col < firstDay + daysInMonth;
            if (!isValidDay) {
                cells.push(<props.EmptyDate key={`${month.year}-${month.monthIndex}-${col}`} />);
                continue;
            }
            const dayNumber = col - firstDay + 1;
            cells.push((
                <props.SingleDate
                    key={`${month.year}-${month.monthIndex}-${col}`}
                    {...{ col, month, dayNumber }}
                    {...props.DateProps}
                />));
        }

        return (
            <div key={`${month.year}-${month.monthIndex}`} className="flex border-b border-gray-300">
                {/* Month label */}
                <div className="min-w-[120px] h-16 bg-gray-100 border-r border-gray-300 flex items-center justify-center sticky left-0 z-10 sticky right-0">
                    <div className="text-center">
                        <div className="font-semibold text-gray-800">{month.nameHe}</div>
                    </div>
                </div>

                {/* Days */}
                {cells}
            </div>
        );
    };

    return (
        <div className="border border-gray-300 rounded-lg bg-white relative">
            <div className="overflow-x-auto">
                {months.map(month => renderMonthRow(month))}
            </div>
        </div>
    );
}


const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};