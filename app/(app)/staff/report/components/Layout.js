// A4 size is 210mm x 297mm
// in 72 dpi its 595 x 842

import { tw } from "@/utils/tw"

export function ReportPage({ children }) {
    return (
        <div className="w-[595px] h-[842px] bg-white p-4 flex flex-col rounded-md shadow-md font-[libertinus-serif]">
            {children}
        </div>
    )
}

export function ReportPageSection({ title, children, className = '' }) {
    return (
        <div className={`mt-4 border-2 border-neutral-600 bg-white rounded-[25px] overflow-hidden flex flex-1 ${className}`}>
            <div className='bg-neutral-600 p-1 flex items-center justify-center w-12'>
                <div className='text-white -rotate-90 text-4xl font-bold whitespace-nowrap font-sans tracking-narrow'>
                    {title}
                </div>
            </div>
            <div className='p-4 flex-1'>
                {children}
            </div>
        </div>

    )
}

export function ReportTitle({student, group}) {
    return (
        <div className='flex flex-col items-center justify-center'>
            <div className='text-2xl font-bold text-center'>
                תעודת מחצית ראשונה התשפ״ו
            </div>
            <div className='text-2xl font-bold text-center'>
                {student.first_name} {student.last_name}
            </div>
            <div className='flex justify-around w-full'>
                <div className='text-sm'>
                    ת.ז. 200202927
                    <br />
                    קבוצת גרניום
                </div>
                <div className='text-sm text-left'>
                    שנה שניה
                    <br />
                    אימפלנטיקה
                </div>
            </div>
        </div>
    )
}

// frank rihl
export const SectionTitle = tw`font-[libertinus-serif] leading-none tracking-wide font-bold text-[18pt]`
export const SectionSubtitle = tw`font-[libertinus-serif] leading-none tracking-wide font-bold text-[14pt]`
export const SectionText = tw`font-[libertinus-serif] text-[11pt]`