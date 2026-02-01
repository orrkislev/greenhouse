// A4 size is 210mm x 297mm
// in 72 dpi its 595 x 842

import { tw, cn } from "@/utils/tw"
import { forwardRef } from "react"

export function ReportPage({ children }) {
    return (
        <div data-report-page className="w-[595px] h-[842px] bg-white p-4 flex flex-col rounded-md shadow-md david-libre [&_*]:outline-none">
            <div className="flex items-center justify-between grayscale mb-6">
                <img src="/images/report/chamama.png" alt="logo" className="h-8 " />
                <img src="/images/report/haavoda.png" alt="logo" className="h-8" />
                <img src="/images/report/hodHasharon.png" alt="logo" className="h-8" />
                <img src="/images/report/amal.jpeg" alt="logo" className="h-8" />
            </div>
            {children}
        </div>
    )
}

export function ReportPageSection({ title, children, className = '' }) {
    return (
        <div className={`mt-3 border-2 border-neutral-400 bg-white rounded-[25px] overflow-hidden flex flex-1 min-h-0 ${className}`}>
            <div className='bg-neutral-400 p-1 flex items-center justify-center w-12 flex-shrink-0'>
                <div className='text-white -rotate-90 text-4xl font-bold whitespace-nowrap font-sans tracking-narrow '
                    style={{
                        fontWeight: '700',
                    }}
                >
                    {title}
                </div>
            </div>
            <div className='p-4 flex-1 overflow-hidden'>
                {children}
            </div>
        </div>

    )
}

const yearMap = [
    0,
    'שנה ראשונה',
    'שנה שניה',
    'שנה שלישית',
    'שנה רביעית',
]

export function ReportTitle({student, group, major}) {
    return (
        <div className='flex flex-col items-center justify-center'>
            <div className='text-lg text-center'>
                תעודת מחצית ראשונה התשפ״ו
            </div>
            <div className='text-3xl font-bold text-center'>
                {student.first_name} {student.last_name}
            </div>
            <div className='flex justify-around w-full'>
                <div className='text-sm'>
                    ת.ז. 200202927
                    <br />
                    קבוצת {group.name}
                </div>
                <div className='text-sm text-left'>
                    {yearMap[group.description]}
                    <br />
                    {student.student?.major ? `${student.student?.major} מגמת` : ''}
                </div>
            </div>
        </div>
    )
}

// frank rihl
export const SectionTitle = tw`david-libre leading-none tracking-tight font-bold text-[15pt]`

export const SectionSubtitle = forwardRef(({ children, className, ...props }, ref) => (
    <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={cn("david-libre leading-none tracking-tight font-bold text-[12pt] focus:bg-[#eff6ff] rounded px-0.5 -mx-0.5", className)}
        style={{ outline: 'none' }}
        {...props}
    >
        {children}
    </div>
))
SectionSubtitle.displayName = 'SectionSubtitle'

export const SectionText = forwardRef(({ children, className, ...props }, ref) => (
    <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className={cn("david-libre text-[10pt] focus:bg-[#eff6ff] rounded px-0.5 -mx-0.5", className)}
        style={{ outline: 'none' }}
        {...props}
    >
        {children}
    </div>
))
SectionText.displayName = 'SectionText'