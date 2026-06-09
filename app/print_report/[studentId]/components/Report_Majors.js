// TODO: full print styling pass — font sizes, spacing, section dividers
import { QRCodeSVG } from 'qrcode.react';
import RadarChart from '@/components/RadarChart';
import { ReportPageSection, SectionSubtitle, SectionText } from './Layout';

export default function Report_Majors({ student }) {
    const data = student.end_eval;

    const radarData = [
        { subject: 'תוכן תיק',  value: data?.portfolio?.content || 0 },
        { subject: 'עיצוב תיק', value: data?.portfolio?.design || 0 },
        { subject: 'הצגה',       value: data?.majorsAcceptance?.presentation    || 0 },
        { subject: 'רפלקציה',   value: data?.majorsAcceptance?.reflection       || 0 },
    ];

    return (
        <ReportPageSection title="תקופת הקיץ" className="flex-1">
            <div className="flex gap-2 flex-1">
                <div className="flex-1 flex flex-col gap-3">
                    <SectionSubtitle>תיק עבודות</SectionSubtitle>
                    <SectionText>{data?.portfolio?.review ? data.portfolio.review : "לא הוצג תיק עבודות!"}</SectionText>
                        
                    <SectionSubtitle>קבלה למגמה{data?.majorsAcceptance?.requestedMajor ? ` — ${data.majorsAcceptance?.requestedMajor}` : ''}</SectionSubtitle>
                    <SectionText>{data?.majorsAcceptance?.review ? data.majorsAcceptance?.review : "עליך להגיש מועמדות למגמה בצורה מסודרת."}</SectionText>
                </div>
                <div className="flex flex-col items-end justify-start p-8 gap-6">
                    {student?.portfolio_url && <QRCodeSVG value={student?.portfolio_url} size={120} />}
                    <RadarChart data={radarData} size={200} />
                </div>

            </div>
        </ReportPageSection>
    );
}
