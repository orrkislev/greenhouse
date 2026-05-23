// TODO: full print styling pass — font sizes, spacing, section dividers
import RadarChart from '@/components/RadarChart';
import { ReportPageSection, SectionSubtitle, SectionText } from './Layout';

export default function Report_POL({ student }) {
    const pol = student.end_eval;

    const radarData = [
        { subject: 'תוכן',        value: pol?.rankings?.content       || 50 },
        { subject: 'הצגה',        value: pol?.rankings?.presentation   || 50 },
        { subject: 'תיק עבודות',  value: pol?.rankings?.portfolio      || 50 },
        { subject: 'תכנון קדימה', value: pol?.rankings?.planning       || 50 },
    ];

    return (
        <ReportPageSection title="P.O.L" className="flex-1">
            <div className="flex gap-2 flex-1">
                <div className="flex-1 flex flex-col gap-3">
                    {pol?.studentSummary && <>
                        <SectionSubtitle>סיכום החניכ/ה</SectionSubtitle>
                        <SectionText>{pol.studentSummary}</SectionText>
                    </>}
                    {pol?.studentQuote && <>
                        <SectionSubtitle>ציטוט משמעותי</SectionSubtitle>
                        <SectionText className="italic">"{pol.studentQuote}"</SectionText>
                    </>}
                    {pol?.mentorSummary && <>
                        <SectionSubtitle>סיכום מנטור</SectionSubtitle>
                        <SectionText>{pol.mentorSummary}</SectionText>
                    </>}
                    {pol?.futurePlan && <>
                        <SectionSubtitle>תוכנית להמשך</SectionSubtitle>
                        <SectionText>{pol.futurePlan}</SectionText>
                    </>}
                </div>
                <div className="flex items-start justify-start p-2">
                    <RadarChart data={radarData} size={240} />
                </div>
            </div>
        </ReportPageSection>
    );
}
