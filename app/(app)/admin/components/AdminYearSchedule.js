"use client"

import { useTime } from "@/utils/store/useTime";

export default function AdminYearSchedule() {
    const terms = useTime(state => state.terms);

    const startYear = new Date().getMonth() < 7 ? new Date().getFullYear() - 1 : new Date().getFullYear();
    const academicYear = `${startYear}-${startYear + 1}`;

    terms.sort((a, b) => new Date(a.start) - new Date(b.start));

    return (
        <div className="w-full relative">
            <div className="mb-6 px-4">
                <h1 className="text-2xl font-bold text-stone-900 mb-2">שנת הלימודים {academicYear}</h1>
                <p className="text-stone-600">תכנון שנתי</p>
            </div>

            <div>
                {terms.map((term, index) => (
                    <div key={index} className="mb-4 p-4 bg-white shadow rounded-lg">
                        <h2 className="text-xl font-semibold text-stone-800">{term.name}</h2>
                        <p className="text-stone-600">מתאריך {new Date(term.start).toLocaleDateString()} עד {new Date(term.end).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}



