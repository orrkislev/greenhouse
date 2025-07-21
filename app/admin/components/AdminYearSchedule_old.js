"use client"

import React from 'react';
import { cn } from '@/lib/utils';

export default function AdminYearSchedule() {
    // Generate academic year months (August to August)
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    
    const months = [
        { name: 'אוגוסט', nameEn: 'August', year: currentYear, monthIndex: 7 },
        { name: 'ספטמבר', nameEn: 'September', year: currentYear, monthIndex: 8 },
        { name: 'אוקטובר', nameEn: 'October', year: currentYear, monthIndex: 9 },
        { name: 'נובמבר', nameEn: 'November', year: currentYear, monthIndex: 10 },
        { name: 'דצמבר', nameEn: 'December', year: currentYear, monthIndex: 11 },
        { name: 'ינואר', nameEn: 'January', year: currentYear + 1, monthIndex: 0 },
        { name: 'פברואר', nameEn: 'February', year: currentYear + 1, monthIndex: 1 },
        { name: 'מרץ', nameEn: 'March', year: currentYear + 1, monthIndex: 2 },
        { name: 'אפריל', nameEn: 'April', year: currentYear + 1, monthIndex: 3 },
        { name: 'מאי', nameEn: 'May', year: currentYear + 1, monthIndex: 4 },
        { name: 'יוני', nameEn: 'June', year: currentYear + 1, monthIndex: 5 },
        { name: 'יולי', nameEn: 'July', year: currentYear + 1, monthIndex: 6 },
        { name: 'אוגוסט', nameEn: 'August', year: currentYear + 1, monthIndex: 7 },
    ];

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

    const renderMonth = (month) => {
        const daysInMonth = getDaysInMonth(month.year, month.monthIndex);
        const firstDay = getFirstDayOfMonth(month.year, month.monthIndex);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8"></div>);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(
                <div
                    key={day}
                    className={cn(
                        "h-8 flex items-center justify-center text-sm border border-gray-200 hover:bg-gray-50 cursor-pointer",
                        "relative"
                    )}
                    data-date={`${month.year}-${String(month.monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
                >
                    {day}
                </div>
            );
        }

        return (
            <div key={`${month.year}-${month.monthIndex}`} className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold text-center mb-3 text-gray-800">
                    {month.name} {month.year}
                </h3>
                
                {/* Week day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="h-8 flex items-center justify-center font-medium text-gray-600 text-sm">
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">שנת הלימודים {academicYear}</h1>
                <p className="text-gray-600">תכנון שנתי - אוגוסט עד אוגוסט</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {months.map(month => renderMonth(month))}
            </div>
        </div>
    );
}
