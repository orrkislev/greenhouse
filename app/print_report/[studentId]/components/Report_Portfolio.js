import { QRCodeSVG } from 'qrcode.react';
import { ReportPageSection, SectionSubtitle, SectionText, SectionTitle } from "./Layout";

export default function Report_Portfolio({ student }) {
    const portfolioUrl = student?.portfolio_url;

    return (
        <ReportPageSection title="פורטפוליו" className="bg-red-500">
            <div className='w-full flex-1 h-full flex flex-col gap-4'>
                {portfolioUrl ? (
                    <div className="flex gap-6 items-center">
                        <div className="flex-1">
                            <SectionSubtitle>פורטפוליו אישי</SectionSubtitle>
                            <SectionText className="mt-2">
                                ניתן לסרוק את ה-QR כדי לגשת לפורטפוליו, שבו מוצגים הפרויקטים, העבודות והיצירות שלי
                            </SectionText>
                        </div>
                        <div className="flex items-center justify-center p-4 border border-border rounded-lg bg-gray-50">
                            <QRCodeSVG value={portfolioUrl} size={150} />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center max-w-2xl">
                            <SectionText className="text-muted-foreground italic">
                                כאן אמור להיות קישור לתיק העבודות שלך, שבו תוכל להציג את הפרויקטים, העבודות והיצירות שלך. נראה שלא העלית פורטפוליו עדיין, אבל תמיד יש זמן להתחיל! <br />
                            </SectionText>
                            <SectionText className="text-muted-foreground italic mt-4">
                                נשמח לראות את הפורטפוליו שלך בעתיד!
                            </SectionText>
                        </div>
                    </div>
                )}
            </div>
        </ReportPageSection>
    );
}
