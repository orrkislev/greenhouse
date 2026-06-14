'use client';

import Button from '@/components/Button';
import RadarChart from '@/components/RadarChart';
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpLeft } from 'lucide-react';
import Link from 'next/link';

const MISSING_MSG = 'לא מצאנו את הפרטים באפליקציה. חשוב לפנות לצוות כדי להסדיר זאת.';

export default function Term({ project, research, term, termKey }) {

    // DIRTY HACK: the radar chart is designed to take values from 25-100, but the project/research overview values are 0-100.
    // So we need to convert them to the 25-100 range.
    // This is actually a good idea, because a 0-100 scale is more natural (we only show it differently in the graph to make the legend more readable)
    // Other values in the app are using a 25-100 scale, 
    // So in the next version we should do a migration to fix them
    // (see: SummerEvaluation.js and POL.js)
    const ov = key => 25 + 75 * ((project?.[key]?.overview || 0) / 100);
    const data = [
        { subject: 'הגדרת יעדים', value: ov('הגדרת יעדים') },
        { subject: 'הצגה ותיעוד', value: ov('הצגה ותיעוד') },
        { subject: 'למידה וביצוע', value: ov('למידה וביצוע') },
        { subject: 'תכנון', value: ov('תכנון') },
    ];

    return (
        <>
            <div className='flex justify-center gap-4'>
                {project && (
                    <Link href={`/project?id=${project.id}&view=review_${termKey}`}>
                        <Button>
                            <ArrowDownRight className='w-4 h-4' />
                            משוב על הפרויקט
                        </Button>
                    </Link>
                )}
                {research && (
                    <Link href={`/research?id=${research.id}&view=review`}>
                        <Button>
                            משוב על החקר
                            <ArrowUpLeft className='w-4 h-4' />
                        </Button>
                    </Link>
                )}
            </div>
            <div className='mt-4 border-2 border-black bg-white rounded-lg flex overflow-hidden'>
                <div className='bg-black p-1 flex items-center justify-center'>
                    <div className='text-white rotate-90 text-2xl font-bold'>
                        תקופת {term}
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-16">
                    <div className="flex-1 flex gap-4">
                        <div className="flex-1 p-4">
                            <div className="">פרויקט ה{term}</div>
                            <div className="text-xl font-bold">{project?.title ?? 'לא בוצע פרויקט בתקופה זו'}</div>
                            {project && <div className="text-sm text-muted-foreground mb-4">בליווי {project.master?.first_name}</div>}
                            {project && <div className="text-sm italic">{project.summary}</div>}
                            {!project && <div className="text-sm px-2 py-1 rounded mt-2" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' }}>{MISSING_MSG}</div>}
                            {project?.next_steps && <div className="text-sm italic text-muted-foreground">{project.next_steps}</div>}
                        </div>
                        {project && (
                            <div className="flex-1 flex items-center justify-center">
                                <RadarChart data={data} size={200} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex gap-4">
                        <div className="flex-1 p-4">
                            <div className="">חקר ה{term}</div>
                            <div className="text-xl font-bold">{research?.title ?? 'לא בוצע חקר בתקופה זו'}</div>
                            {research && <div className="text-sm italic mt-4">{research.summary}</div>}
                            {!research && <div className="text-sm px-2 py-1 rounded mt-2" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' }}>{MISSING_MSG}</div>}
                            {research?.next_steps && <div className="text-sm italic text-muted-foreground">{research.next_steps}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
