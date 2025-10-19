import Box2 from "@/components/Box2";
import WithLabel from "@/components/WithLabel";
import { researchActions, useResearchData } from "@/utils/store/useResearch";
import { useUser } from "@/utils/store/useUser";
import AuthGoogleCalendar from "../../schedule/components/Google/AuthGoogleCalendar";
import Button from "@/components/Button";
import { BadgeHelp, BookOpen, Quote, FileText, Brain, Clock, Type, Eye } from "lucide-react";

export default function Research() {
    const user = useUser(state => state.user)
    const research = useResearchData(state => state.research)

    const clickCreateDoc = async () => {
        researchActions.createGoogleDoc();
    }

    return (
        <div className="flex-1 flex flex-col gap-3">
            <div className="flex justify-between gap-4">
                <WithLabel label="על מה החקר שלי" className="flex-1">
                    <input type="text" placeholder="על מה החקר שלי" key={research.id}
                        defaultValue={research.title} onBlur={(e) => researchActions.updateResearch({ title: e.target.value })}
                        className="bg-white border border-stone-300 font-bold p-2 w-full text-xl outline outline-transparent hover:outline hover:outline-stone-300 focus:outline-stone-300 rounded-sm transition-all duration-200" />
                </WithLabel>
                <div className="flex gap-2">
                    <Box2>
                        {!user.googleRefreshToken && <AuthGoogleCalendar />}
                        {user.googleRefreshToken && !research.docUrl && <Button onClick={clickCreateDoc}>ליצור מסמך חקר</Button>}
                        {research && research.docUrl && <a href={research.docUrl} target="_blank"><Button className='text-xl'>מסמך החקר שלי</Button></a>}
                    </Box2>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2 auto-rows-fr">
                <Box2 label="21 שאלות" LabelIcon={BadgeHelp} className="row-span-4"></Box2>
                <Box2 label="מקורות" LabelIcon={BookOpen} className="row-span-2"></Box2>
                <Box2 label="ציטוטים" LabelIcon={Quote} className="row-span-3"></Box2>
                <Box2 label="תקציר קצר" LabelIcon={FileText} className="row-span-3"></Box2>
                <Box2 label="ציר זמן" LabelIcon={Clock} className="col-span-2"></Box2>
                <Box2 label="מפת מושגים" LabelIcon={Brain} className="row-span-4 col-span-2"></Box2>
                <Box2 label="אוצר מילים" LabelIcon={Type} className="row-span-4"></Box2>
                <Box2 label="שלוש נקודות מבט" LabelIcon={Eye} className="row-span-3 col-span-2"></Box2>
            </div>
        </div>
    )
}
