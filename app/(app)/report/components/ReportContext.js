'use client'

import { tw } from "@/utils/tw";
import { formatSemesterLabel } from "@/utils/store/useTime";

const SemesterDiv = tw.div`
    flex flex-col text-sm mr-2 p-2 hover:bg-muted hover:text-foreground rounded-md cursor-pointer transition-colors
    ${props => props.$isActive && 'bg-slate-300 text-slate-900'}
`

export default function ReportContext({ semesters, selected, onSelect }) {
    if (!semesters.length) return null;

    return (
        <div>
            {semesters.map(semester => (
                <SemesterDiv
                    key={semester}
                    $isActive={semester === selected}
                    onClick={() => onSelect(semester)}
                >
                    {formatSemesterLabel(semester)}
                </SemesterDiv>
            ))}
        </div>
    );
}
