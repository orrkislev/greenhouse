import { ReportPageSection } from "./Layout";
import { SectionSubtitle } from "./Layout";
import { SectionText } from "./Layout";

export default function Report_Liba({student}) {
    return (
        <ReportPageSection title="ליבה" className="flex-1">
            <div className='w-full flex-1 h-full flex gap-[4px]'>
                <div className='flex-1 flex flex-col gap-[4px]'>
                    <SectionSubtitle>מה אתה חושב על הדברים?</SectionSubtitle>
                    <SectionText>מה אתה חושב על הדברים?</SectionText>
                </div>
                <div className='flex-1 flex flex-col gap-[4px]'>
                    <SectionSubtitle>יעד להמשך</SectionSubtitle>
                    <div>יעד להמשך</div>
                </div>
            </div>
        </ReportPageSection>
    )
}