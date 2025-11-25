import Box2 from "@/components/Box2";
import WithLabel from "@/components/WithLabel";
import { researchActions, useResearchData } from "@/utils/store/useResearch";
import { useUser } from "@/utils/store/useUser";
import AuthGoogleCalendar from "../../schedule/components/Google/AuthGoogleCalendar";
import Button from "@/components/Button";
import { Clock, FileText } from "lucide-react";
import Section_Questions from "./sections/Section_Questions";
import Section_sources from "./sections/Section_sources";
import Section_quotes from "./sections/Section_Quotes";
import Section_vocabulary from "./sections/Section_vocabulary";
import Section_summary from "./sections/Section_summary";
import Section_masters from "./sections/Section_masters";

export default function Research() {
    const user = useUser(state => state.user)
    const research = useResearchData(state => state.research)

    const clickCreateDoc = async () => {
        researchActions.createGoogleDoc();
    }

    return (
        <div className="flex-1 flex flex-col gap-8 md:mx-16">
            <div className="flex flex-col-reverse md:flex-row justify-between gap-4">
                <WithLabel label="על מה החקר שלי" className="flex-1">
                    <input type="text" placeholder="על מה החקר שלי" key={research.id}
                        defaultValue={research.title} onBlur={(e) => researchActions.updateResearch({ title: e.target.value })}
                        className="bg-white border border-border font-bold p-2 w-full text-xl outline outline-transparent hover:outline hover:outline-stone-300 focus:outline-stone-300 rounded-sm transition-all duration-200" />
                </WithLabel>
                <div className="flex gap-2">
                    <Box2>
                        {!user.googleRefreshToken && <AuthGoogleCalendar />}
                        {user.googleRefreshToken && !research.docUrl && (
                            <Button data-role="new" onClick={clickCreateDoc}>
                                <FileText className="w-4 h-4" />
                                ליצור מסמך חקר
                            </Button>
                        )}
                        {research && research.docUrl && <a href={research.docUrl} target="_blank"><Button className='text-xl'>מסמך החקר שלי</Button></a>}
                    </Box2>
                </div>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-3 gap-2 auto-rows-fr">
                <Section_Questions />
                <Section_sources />
                <Section_quotes />
                <Section_summary />
                <Section_masters />
                <Box2 label="ציר זמן" LabelIcon={Clock} className="col-span-2 row-span-2 opacity-50"></Box2>
                <Section_vocabulary />
                {/* <Box2 label="שלוש נקודות מבט" LabelIcon={Eye} className="row-span-3 col-span-2"></Box2> */}
            </div>
        </div>
    )
}
