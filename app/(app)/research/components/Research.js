import Box2 from "@/components/Box2";
import WithLabel from "@/components/WithLabel";
import { researchActions, useResearchData } from "@/utils/store/useResearch";
import { useUser } from "@/utils/store/useUser";
import AuthGoogleCalendar from "../../schedule/components/Google/AuthGoogleCalendar";
import Button, { IconButton } from "@/components/Button";
import { Plus, BadgeHelp, BookOpen, Quote, FileText, Brain, Clock, Type, Eye, ImageIcon, Trash2, MoreVertical } from "lucide-react";

import { tw } from "@/utils/tw";
import Section_21 from "./sections/Section_21";
import Section_sources from "./sections/Section_sources";
import Section_quotes from "./sections/Section_Quotes";
import Section_summary from "./sections/Section_summary";
import Section_mindmap from "./sections/Section_mindmap";
import Section_gallery from "./sections/Section_gallery";
import Section_timeline from "./sections/Section_timeline";
import Section_vocabulary from "./sections/Section_vocabulary";
import Section_perspectives from "./sections/Section_perspectives";
import usePopper from "@/components/Popper";

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
                        className="w-full text-xl outline outline-transparent hover:outline hover:outline-stone-300 focus:outline-stone-300 rounded-sm transition-all duration-200" />
                </WithLabel>
                <div className="flex gap-2">
                    <Box2>
                        {!user.googleRefreshToken && <AuthGoogleCalendar />}
                        {user.googleRefreshToken && !research.docUrl && <Button onClick={clickCreateDoc}>ליצור מסמך חקר</Button>}
                        {research && research.docUrl && <a href={research.docUrl} target="_blank"><Button className='text-xl'>מסמך החקר שלי</Button></a>}
                    </Box2>
                    <ResearchOptions research={research} />
                </div>
            </div>
            {research.sections && research.sections.map(section => {
                const SectionComponent = sectionsTypes[section.type].component;
                return (
                    <WithLabel key={section.id} label={sectionsTypes[section.type].title} Icon={sectionsTypes[section.type].icon} onClose={() => researchActions.removeSection(section.id)}>
                        <SectionComponent section={section} />
                    </WithLabel>
                )
            })}
            <div className="flex justify-center">
                <NewSection />
            </div>
        </div>
    )
}

const SectionCard = tw.div`flex-1 border border-stone-200 p-4 flex flex-col group/section-card cursor-pointer hover:bg-stone-200 transition-colors
    ${({ $disabled }) => $disabled && 'opacity-50 pointer-events-none'}
`
const SectionIconContainer = tw.div`aspect-square flex items-center justify-center`
const SectionIcon = tw.div`inset-0 rounded-full bg-stone-400 flex items-center justify-center p-2 text-white group-hover/section-card:bg-white group-hover/section-card:text-stone-400 transition-colors`


function NewSection() {
    const { open, close, Popper, baseRef } = usePopper()

    const clickSection = (name) => {
        close()
        researchActions.addSection(name)
    }

    return (
        <>
            <Button data-role="new" onClick={open}>
                <Plus className="w-4 h-4" />
                חדש
            </Button>
            <Popper className="bg-black/50">
                <div className="grid grid-cols-5 gap-2 p-4 bg-white w-4xl">
                    {Object.entries(sectionsTypes).map(([key, section]) => (
                        <SectionCard key={key} onClick={() => clickSection(key)} $disabled={section.disabled}>
                            <SectionIconContainer>
                                <SectionIcon>
                                    <section.icon className="w-16 h-16" />
                                </SectionIcon>
                            </SectionIconContainer>
                            <div className="font-semibold">{section.title}</div>
                            <div className="text-xs text-stone-500">{section.description}</div>
                        </SectionCard>
                    ))}
                </div>
            </Popper>
        </>
    )
}


const sectionsTypes = {
    '21-questions': {
        icon: BadgeHelp,
        title: "21 שאלות",
        description: "כתבי 21 שאלות שונות על הנושא שלך",
        component: Section_21
    },
    'sources': {
        icon: BookOpen,
        title: "מקורות",
        description: "אספי קישורים, סרטונים, מאמרים או ספרים שקשורים לנושא",
        component: Section_sources
    },
    'quotes': {
        icon: Quote,
        title: "ציטוטים",
        description: "רשמי משפטים או רעיונות שמצאת במקורותייך",
        component: Section_quotes
    },
    'summary': {
        icon: FileText,
        title: "תקציר קצר",
        description: "נסי לסכם את מה שלמדת בפסקה אחת בלבד",
        component: Section_summary
    },
    'mindmap': {
        icon: Brain,
        title: "מפת מושגים",
        description: "שרטטי חיבורים בין רעיונות, נושאים ומושגים שקשורים למחקר שלך",
        component: Section_mindmap,
        disabled: true
    },
    'gallery': {
        icon: ImageIcon,
        title: "גלריה",
        description: "הוסיפי תמונות, איורים או ויז'ואלים שמעוררים השראה לנושא",
        component: Section_gallery,
        disabled: true
    },
    'timeline': {
        icon: Clock,
        title: "ציר זמן",
        description: "צייני אירועים חשובים בהיסטוריה או בהתפתחות של הנושא",
        component: Section_timeline,
        disabled: true
    },
    'vocabulary': {
        icon: Type,
        title: "אוצר מילים",
        description: "כתבי מילים ומושגים חדשים שפגשת במחקר שלך והסבירי אותם",
        component: Section_vocabulary,
        disabled: true
    },
    'perspectives': {
        icon: Eye,
        title: "שלוש נקודות מבט",
        description: "הסתכלי על הנושא משלוש נקודות מבט שונות (מדעית, אישית, היסטורית וכו׳)",
        component: Section_perspectives,
        disabled: true
    },
}


function ResearchOptions({ research }) {
    const { open, close, Popper, baseRef } = usePopper()

    const clickDelete = () => {
        researchActions.deleteResearch(research.id)
        close()
    }

    return (
        <>
            <IconButton icon={MoreVertical} onClick={open} ref={baseRef} />
            <Popper>
                <Button onClick={clickDelete}>
                    <Trash2 className="w-4 h-4" />
                    מחק
                </Button>
            </Popper>
        </>

    )
}