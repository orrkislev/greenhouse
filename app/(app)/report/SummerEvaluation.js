'use client'
import { useState, useEffect, useMemo } from 'react'
import { CircleHelp } from 'lucide-react'
import { useUser } from '@/utils/store/useUser'
import { supabase } from '@/utils/supabase/client'
import SmartText from '@/components/SmartText'
import AutoSaveIndicator from './components/AutoSaveIndicator'
import { useSaveOnUnmount } from '@/utils/useSaveOnUnmount'
import GooeySlider from '@/components/GooeySlider'
import RadarChart from '@/components/RadarChart'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ALLOW_STUDENT_EDIT } from './page'

const normalizeUrl = url => url && !/^https?:\/\//i.test(url) ? `https://${url}` : url

const FALLBACK_MAJORS = ['הייטק', 'הפקה', 'עיצוב']

const SLIDER_PROPS = {
    min: 25,
    max: 100,
    labelLeft: 'לא בוצע',
    labelRight: 'בוצע מעולה',
    midValues: ['חלקית', 'בוצע'],
    color: '#1a1a1a',
}

function HintTooltip({ hint }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button className="text-blue-300 hover:text-blue-500 shrink-0">
                    <CircleHelp size={14} />
                </button>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p className="max-w-xs text-right">{hint}</p>
            </TooltipContent>
        </Tooltip>
    )
}

export default function SummerEvaluation({ evalData, onSave }) {
    const originalUser = useUser(state => state.originalUser)
    const user = useUser(state => state.user)
    const canEdit = ALLOW_STUDENT_EDIT || !!originalUser
    const isStaffMode = !!originalUser

    const [portfolioContent, setPortfolioContent] = useState(evalData?.portfolio?.content || 0)
    const [portfolioDesign, setPortfolioDesign] = useState(evalData?.portfolio?.design || 0)
    const [portfolioReview, setPortfolioReview] = useState(evalData?.portfolio?.review || '')
    const [requestedMajor, setRequestedMajor] = useState(evalData?.majorsAcceptance?.requestedMajor || '')
    const [majorsReview, setMajorsReview] = useState(evalData?.majorsAcceptance?.review || '')
    const [presentation, setPresentation] = useState(evalData?.majorsAcceptance?.presentation || 0)
    const [reflection, setReflection] = useState(evalData?.majorsAcceptance?.reflection || 0)
    const [allMajors, setAllMajors] = useState(FALLBACK_MAJORS)

    useEffect(() => {
        setPortfolioContent(evalData?.portfolio?.content || 0)
        setPortfolioDesign(evalData?.portfolio?.design || 0)
        setPortfolioReview(evalData?.portfolio?.review || '')
        setRequestedMajor(evalData?.majorsAcceptance?.requestedMajor || '')
        setMajorsReview(evalData?.majorsAcceptance?.review || '')
        setPresentation(evalData?.majorsAcceptance?.presentation || 0)
        setReflection(evalData?.majorsAcceptance?.reflection || 0)
    }, [evalData])

    useEffect(() => {
        supabase.from('groups').select('name').eq('type', 'major')
            .then(({ data }) => {
                const names = data?.map(g => g.name).filter(Boolean)
                if (names?.length) setAllMajors(names)
            })
    }, [])

    const buildPayload = () => ({
        type: 'summer_eval_1b',
        portfolio: { content: portfolioContent, design: portfolioDesign, review: portfolioReview },
        majorsAcceptance: { requestedMajor, review: majorsReview, presentation, reflection },
    })

    const shouldSave = useMemo(() => {
        const p = evalData?.portfolio || {}
        const m = evalData?.majorsAcceptance || {}
        return (
            portfolioContent !== (p.content || 0) ||
            portfolioDesign !== (p.design || 0) ||
            portfolioReview.trim() !== (p.review || '').trim() ||
            requestedMajor !== (m.requestedMajor || '') ||
            majorsReview.trim() !== (m.review || '').trim() ||
            presentation !== (m.presentation || 0) ||
            reflection !== (m.reflection || 0)
        )
    }, [portfolioContent, portfolioDesign, portfolioReview, requestedMajor, majorsReview, presentation, reflection, evalData])

    useEffect(() => {
        if (!shouldSave) return
        const timer = setTimeout(() => { onSave(buildPayload()) }, 5000)
        return () => clearTimeout(timer)
    }, [shouldSave, portfolioContent, portfolioDesign, portfolioReview, requestedMajor, majorsReview, presentation, reflection])

    useSaveOnUnmount(
        () => shouldSave,
        () => buildPayload(),
        onSave
    )

    const radarData = [
        { subject: 'תוכן', value: portfolioContent },
        { subject: 'עיצוב', value: portfolioDesign },
        { subject: 'הצגה', value: presentation },
        { subject: 'רפלקציה', value: reflection },
    ]

    return (
        <TooltipProvider>
            <div className='mt-4 border-2 border-black bg-white rounded-lg flex overflow-hidden'>
                <div className='bg-black p-1 flex items-center justify-center min-h-32'>
                    <div className='text-white rotate-90 text-2xl font-bold whitespace-nowrap'>
                        תקופת קיץ
                    </div>
                </div>

                <div className='flex flex-col flex-1 divide-y divide-gray-200'>

                    {/* Row 1: Portfolio + Majors side by side */}
                    <div className='flex divide-x divide-gray-200'>

                    {/* Column 1: Digital Portfolio */}
                    <div className={`flex-1 p-4 flex flex-col gap-4 ${!isStaffMode ? 'pointer-events-none opacity-80' : ''}`}>
                        <div className='flex items-center gap-2'>
                            <div className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>תיק עבודות דיגיטלי</div>
                            {!user?.portfolio_url
                                ? <span className='text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-300'>חסר</span>
                                : <a href={normalizeUrl(user.portfolio_url)} target="_blank" rel="noopener noreferrer" className='text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 border border-green-300 hover:bg-green-200'>קיים</a>
                            }
                        </div>

                        <div>
                            <div className='text-sm font-medium text-gray-600 mb-1 flex items-center gap-1.5'>
                                תוכן
                                <HintTooltip hint='תיק העבודות מכיל את כל הרכיבים (מי אני, פרויקטים, נושאי למידה), ברמת פירוט טובה' />
                            </div>
                            <GooeySlider {...SLIDER_PROPS} value={portfolioContent} onChange={setPortfolioContent} />
                        </div>

                        <div>
                            <div className='text-sm font-medium text-gray-600 mb-1 flex items-center gap-1.5'>
                                עיצוב
                                <HintTooltip hint='עיצוב התיק אפקטיבי, עקבי, אסתטי ומושך את העין' />
                            </div>
                            <GooeySlider {...SLIDER_PROPS} value={portfolioDesign} onChange={setPortfolioDesign} />
                        </div>

                        <div>
                            <div className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1'>משוב</div>
                            <SmartText
                                text={portfolioReview}
                                onEdit={setPortfolioReview}
                                editable={isStaffMode}
                                withIcon={isStaffMode}
                                className='text-gray-700 text-sm leading-relaxed'
                                placeholder='משוב מילולי לתיק העבודות. מה בוצע היטב (נקודות לשימור), מה צריך לשפר?'
                            />
                        </div>
                    </div>

                    {/* Column 2: Majors Acceptance */}
                    <div className={`flex-1 p-4 flex flex-col gap-4 ${!isStaffMode ? 'pointer-events-none opacity-80' : ''}`}>
                        <div className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>קבלה למגמה</div>

                        <div>
                            <div className='text-sm font-medium text-gray-600 mb-1'>מגמה מבוקשת</div>
                            <select
                                value={requestedMajor}
                                onChange={e => setRequestedMajor(e.target.value)}
                                className='text-sm border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400'
                            >
                                <option value=''>— בחר מגמה —</option>
                                {allMajors.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className='text-sm font-medium text-gray-600 mb-1 flex items-center gap-1.5'>
                                הצגה
                                <HintTooltip hint='הוצג פרויקט או אתגר רלוונטי, וכוונה למסלול הלמידה במגמה' />
                            </div>
                            <GooeySlider {...SLIDER_PROPS} value={presentation} onChange={setPresentation} />
                        </div>

                        <div>
                            <div className='text-sm font-medium text-gray-600 mb-1 flex items-center gap-1.5'>
                                רפלקציה
                                <HintTooltip hint='התייחסות לאתגרים ולהתמודדות איתם במהלך השנה, זיהוי חוזקות, כשרונות וסגנון למידה' />
                            </div>
                            <GooeySlider {...SLIDER_PROPS} value={reflection} onChange={setReflection} />
                        </div>

                        <div>
                            <div className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1'>משוב</div>
                            <SmartText
                                text={majorsReview}
                                onEdit={setMajorsReview}
                                editable={isStaffMode}
                                withIcon={isStaffMode}
                                className='text-gray-700 text-sm leading-relaxed'
                                placeholder='משוב מילולי למצגת הקבלה למגמה. התייחסות להנחת כוונה, הצגת תוצר ותהליך, והתאמה למגמה. נקודות לשימור ולשיפור.'
                            />
                        </div>
                    </div>

                    </div>{/* end Row 1 */}

                    {/* Row 2: Radar Chart */}
                    <div className='p-4 flex items-center justify-center'>
                        <RadarChart data={radarData} size={240} />
                    </div>

                </div>{/* end content flex-col */}
            </div>{/* end outer box */}

            <AutoSaveIndicator isDirty={shouldSave} canEdit={isStaffMode} />
        </TooltipProvider>
    )
}
