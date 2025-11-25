"use client"

import { timeActions, useTime } from "@/utils/store/useTime";
import { format } from "date-fns";
import { Trash } from "lucide-react";
import { Plus } from "lucide-react";
import { useEffect } from "react";

export default function AdminYearSchedule() {
    const terms = useTime(state => state.terms);

    useEffect(() => {
        timeActions.loadTerms();
    }, []);

    const startYear = new Date().getMonth() < 7 ? new Date().getFullYear() - 1 : new Date().getFullYear();
    const academicYear = `${startYear}-${startYear + 1}`;

    terms.sort((a, b) => new Date(a.start) - new Date(b.start));

    return (
        <div className="relative">
            <div className="mb-6 px-4">
                <h1 className="text-2xl font-bold text-stone-900 mb-2">שנת הלימודים {academicYear}</h1>
                <p className="text-muted-foreground">תכנון שנתי</p>
            </div>

            <div className="flex gap-4 flex-wrap">
                {terms.map(term => (
                    <div key={term.id} className="flex gap-16 group/term p-2 border border-stone-400">
                        <div className="">
                            <input type="text" className="font-semibold text-foreground mb-2" onBlur={(e) => timeActions.updateTerm(term.id, { name: e.target.value })} defaultValue={term.name} />
                            <div className="flex gap-2 text-muted-foreground text-xs">
                                <div className="">מתאריך</div>
                                <input type="date" value={term.start} onChange={(e) => timeActions.updateTerm(term.id, { start: e.target.value })} />
                            </div>
                            <div className="flex gap-2 text-muted-foreground text-xs">
                                <div className="">עד</div>
                                <input type="date" value={term.end} onChange={(e) => timeActions.updateTerm(term.id, { end: e.target.value })}
                                    className="pr-0"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 group-hover/term:opacity-100 opacity-0 transition-opacity duration-300">
                            <button className="text-muted-foreground" onClick={() => timeActions.removeTerm(term.id)}>
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                <button className="min-w-40 min-h-16 flex items-center justify-center text-muted-foreground cursor-pointer bg-primary text-white hover:bg-primary/80 transition-colors duration-300" onClick={() => timeActions.addTerm({
                    name: 'תקופה חדשה',
                    start: format(new Date(), 'yyyy-MM-dd'),
                    end: format(new Date(), 'yyyy-MM-dd'),
                })}>
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}



