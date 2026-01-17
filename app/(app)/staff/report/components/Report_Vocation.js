import { ReportPageSection } from "./Layout";

export default function Report_Vocation({ student }) {
    const vocation = student.student?.vocation;

    return (
        <ReportPageSection title="יזמות מקיימת" className="flex-1">
            <div className='w-full flex-1 h-full flex gap-4'>
                <div className='flex-1 flex flex-col gap-1'>
                    {vocation?.employmentQuestion && (
                        <div className='font-bold text-sm'>{vocation.employmentQuestion}</div>
                    )}
                    {vocation?.employmentAnswer && (
                        <div className='text-xs text-neutral-700'>{vocation.employmentAnswer}</div>
                    )}
                </div>
                <div className='flex-1 flex flex-col gap-1'>
                    {vocation?.volunteeringQuestion && (
                        <div className='font-bold text-sm'>{vocation.volunteeringQuestion}</div>
                    )}
                    {vocation?.volunteeringAnswer && (
                        <div className='text-xs text-neutral-700'>{vocation.volunteeringAnswer}</div>
                    )}
                </div>
            </div>
        </ReportPageSection>
    )
}