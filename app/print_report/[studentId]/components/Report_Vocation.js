import { ReportPageSection, SectionTitle } from "./Layout";
import { SectionSubtitle } from "./Layout";
import { SectionText } from "./Layout";
export default function Report_Vocation({ student }) {
    const vocation = student.vocation;

    return (
        <ReportPageSection title="יזמות מקיימת" className="flex-1">
            <div className='w-full flex-1 h-full flex gap-4'>
                <div className='flex-1 flex flex-col gap-1'>
                    <SectionTitle>תעסוקה</SectionTitle>
                    {vocation?.jobTitle ? (
                        <>
                            <div className="flex gap-8">
                                <SectionSubtitle>{vocation?.jobTitle}</SectionSubtitle>
                                <SectionText>{vocation?.hours} שעות</SectionText>
                            </div>
                            {vocation?.employmentQuestion && (
                                <SectionSubtitle>{vocation?.employmentQuestion}</SectionSubtitle>
                            )}
                            {vocation?.employmentAnswer && (
                                <SectionText>{vocation?.employmentAnswer}</SectionText>
                            )}
                        </>
                    ) : (
                        <>
                            {student.year != '1' ? (
                                <SectionText className="text-muted-foreground italic">
                                    לצערנו, בחרת שלא לקחת על עצמך את האחריות הנדרשת על מנת להתנסות בפעילות התעסוקה במחצית זו. במסגרת זו נרכשות מיומנויות של התנהלות בשוק העבודה כשכירים או עצמאים, התנהלות פיננסית, יחסי עובד-מעביד, ניהול לקוחות ועוד.
                                </SectionText>
                            ) : (
                                <SectionText className="text-muted-foreground italic">
                                    בתיכון שלנו ניתן לקחת חלק פעיל ולעבוד בתוך או מחוץ לתיכון, כך תתאפשר התפתחות מקצועית בתחומים שמעניינים אותך. <br/>
                                    במסגרת זו נרכשות מיומנויות של התנהלות בשוק העבודה כשכירים או עצמאים, התנהלות פיננסית, יחסי עובד-מעביד, ניהול לקוחות ועוד. <br/>
                                    <strong>נשמח לבדוק איתך איזה תחום יעניין אותך להתמחות בו מקצועית או או לעבוד בו.</strong>
                                </SectionText>
                            )}
                        </>
                    )}
                </div>
                <div className='flex-1 flex flex-col gap-1'>
                    <SectionTitle>עשייה חברתית</SectionTitle>
                    {vocation?.volunteeringQuestion && (
                        <SectionSubtitle>{vocation?.volunteeringQuestion}</SectionSubtitle>
                    )}
                    {vocation?.volunteeringAnswer && (
                        <SectionText>{vocation?.volunteeringAnswer}</SectionText>
                    )}
                </div>
            </div>
        </ReportPageSection>
    )
}