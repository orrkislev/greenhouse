// TODO: full print styling pass — font sizes, spacing, section dividers
import { QRCodeSVG } from 'qrcode.react';
import RadarChart from '@/components/RadarChart';
import { ReportPageSection, SectionSubtitle, SectionText } from './Layout';

export default function Report_POL({ student }) {
    const pol = student.end_eval;

    const radarData = [
        { subject: 'תוכן', value: pol?.rankings?.content || 0 },
        { subject: 'הצגה', value: pol?.rankings?.presentation || 0 },
        { subject: 'תיק עבודות', value: pol?.rankings?.portfolio || 0 },
        { subject: 'תכנון קדימה', value: pol?.rankings?.planning || 0 },
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
                </div>
                <div className="flex items-start justify-start p-2">
                    <RadarChart data={radarData} size={240} />
                </div>
            </div>
            {pol?.mentorSummary && <>
                <SectionSubtitle>סיכום מנטור</SectionSubtitle>
                <SectionText>{pol.mentorSummary}</SectionText>
            </>}
            {pol?.futurePlan && <>
                <SectionSubtitle>תוכנית להמשך</SectionSubtitle>
                <SectionText>{pol.futurePlan}</SectionText>
            </>}


            <div className="flex gap-6 items-start mt-4">
                <div className="flex-1">
                    <SectionSubtitle>תיק עבודות</SectionSubtitle>
                    <SectionText className="mt-2">
                        {student?.portfolio_url
                            ? 'ניתן לסרוק את ה-QR כדי לגשת לפורטפוליו, שבו מוצגים הפרויקטים, העבודות והיצירות שלי'
                            : 'כאן אמור להיות קישור לתיק העבודות שלך, שבו תוכל להציג את הפרויקטים, העבודות והיצירות שלך. נראה שלא העלית פורטפוליו עדיין.'
                        }
                    </SectionText>
                </div>
                <div className="flex items-center justify-center p-4 border border-border rounded-lg bg-gray-50">
                    {student?.portfolio_url && <QRCodeSVG value={student?.portfolio_url} size={120} />}
                </div>
            </div>


        </ReportPageSection>
    );
}
