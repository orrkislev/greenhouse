import { ReportPageSection, SectionTitle } from "./Layout";
import { SectionSubtitle } from "./Layout";
import { SectionText } from "./Layout";
export default function Report_Vocation({ student }) {
    const vocation = student.vocation;

    return (
        <ReportPageSection title="יזמות מקיימת">
            <div className='w-full flex-1 h-full flex gap-4'>
                <div className='flex-1 flex flex-col gap-1'>
                    <SectionTitle>תעסוקה</SectionTitle>
                    <div className="flex gap-8">
                        <SectionSubtitle>{vocation.jobTitle}</SectionSubtitle>
                        <SectionText>{vocation.hours} שעות</SectionText>
                    </div>
                    {vocation?.employmentQuestion && (
                        <SectionSubtitle>{vocation.employmentQuestion}</SectionSubtitle>
                    )}
                    {vocation?.employmentAnswer && (
                        <SectionText>{vocation.employmentAnswer}</SectionText>
                    )}
                </div>
                <div className='flex-1 flex flex-col gap-1'>
                    <SectionTitle>התנדבות</SectionTitle>
                    {vocation?.volunteeringQuestion && (
                        <SectionSubtitle>{vocation.volunteeringQuestion}</SectionSubtitle>
                    )}
                    {vocation?.volunteeringAnswer && (
                        <SectionText>{vocation.volunteeringAnswer}</SectionText>
                    )}
                </div>
            </div>
        </ReportPageSection>
    )
}