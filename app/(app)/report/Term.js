'use client';

import Button from '@/components/Button';
import RadarChart from '@/components/RadarChart';
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpLeft } from 'lucide-react';
import Link from 'next/link';

export default function Term({ project, research, term }) {
    if (!project || !research) return null;

    const data = [
        { subject: 'הגדרת יעדים', value: project?.['הגדרת יעדים'].overview || 50 },
        { subject: 'הצגה ותיעוד', value: project?.['תכנון'].overview || 50 },
        { subject: 'למידה וביצוע', value: project?.['למידה וביצוע'].overview || 50 },
        { subject: 'תכנון', value: project?.['הצגה ותיעוד'].overview || 50 },
    ];

    console.log(project, research);

    return (
        <>
            <div className='flex justify-center gap-4'>
                <Link href={`/project?id=${project?.id}&view=review`}>
                    <Button >
                        <ArrowDownRight className='w-4 h-4' />
                        משוב על הפרויקט
                    </Button>
                </Link>
                <Link href={`/research?id=${research?.id}&view=review`}>
                    <Button>
                        משוב על החקר
                        <ArrowUpLeft className='w-4 h-4' />
                    </Button>
                </Link>
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
                            <div className="">פרויקט ה{project?.term}</div>
                            <div className="text-xl font-bold">{project?.title}</div>
                            <div className="text-sm text-muted-foreground mb-4">בליווי {project?.master?.first_name}</div>
                            <div className="text-sm italic">{project?.summary}</div>
                            <div className="text-sm italic text-muted-foreground">{project?.next_steps}</div>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <RadarChart data={data} size={200} />
                        </div>
                    </div>

                    <div className="flex-1 flex gap-4">
                        <div className="flex-1 p-4">
                            <div className="">חקר ה{term}</div>
                            <div className="text-xl font-bold">{research?.title}</div>
                            <div className="text-sm italic mt-4">{research?.summary}</div>
                            <div className="text-sm italic text-muted-foreground">{research?.next_steps}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
