import { ReportPageSection } from "./Layout";
import { SectionSubtitle } from "./Layout";
import { SectionText } from "./Layout";

export default function Report_Liba({student}) {
    return (
        <ReportPageSection title="ליבה">
            <div className='w-full flex-1 h-full flex gap-[8px]'>
                <div className='flex-1 flex flex-col gap-[4px]'>
                    <SectionSubtitle className='h-12'>{student.liba?.question}</SectionSubtitle>
                    <SectionText>{student.liba?.answer}</SectionText>
                </div>
                <div className='flex-1 flex flex-col gap-[4px]'>
                    <SectionSubtitle className='h-12'>יעד להמשך</SectionSubtitle>
                    <SectionText>{student.liba?.nextStep}</SectionText>
                </div>
            </div>
        </ReportPageSection>
    )
}