import { QRCodeSVG } from 'qrcode.react';
import { ReportPageSection, SectionSubtitle, SectionText, SectionTitle } from "./Layout";

export function Report_PortfolioDiv({ student }) {
    return (
        <div className="flex gap-6 items-start mt-4">
            <div className="flex-1">
                <SectionSubtitle>תיק עבודות</SectionSubtitle>
                <SectionText className="mt-2">
                    {student?.portfolio_url
                        ? 'לצפיה בפרויקטים, העבודות והיצירות שלי - יש לסרוק את קוד ה-QR.'
                        : 'לא הוגש תיק עבודות, זה ערוץ חשוב להצגת הפרויקטים, העבודות והיצירות שלך.'
                    }
                </SectionText>
            </div>
            <div className="flex items-center justify-center p-4 border border-border rounded-lg bg-gray-50">
                {student?.portfolio_url && <QRCodeSVG value={student?.portfolio_url} size={120} />}
            </div>
        </div>
    )
}

export default function Report_Portfolio({ student }) {
    const portfolioUrl = student?.portfolio_url;

    return (
        <ReportPageSection title="פורטפוליו" className="bg-red-500">
            <div className='w-full flex-1 h-full flex flex-col gap-4'>
                <Report_PortfolioDiv student={student} />
            </div>
        </ReportPageSection>
    );
}
