'use client'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/utils/store/useUser'
import Button from '@/components/Button'
import SmartText from '@/components/SmartText'
import GooeySlider from '@/components/GooeySlider'
import RadarChart from '@/components/RadarChart'
import { motion, AnimatePresence } from 'motion/react'
import { ALLOW_STUDENT_EDIT } from './page'

const DEFAULT_RANKINGS = { content: 0, presentation: 0, portfolio: 0, planning: 0 }

const CATEGORIES = [
    { key: 'content', label: 'תוכן' },
    { key: 'presentation', label: 'הצגה' },
    { key: 'portfolio', label: 'תיק עבודות' },
    { key: 'planning', label: 'תכנון קדימה' },
]

export default function POLEvaluation({ pol, year, onSave }) {
    const originalUser = useUser(state => state.originalUser)
    const canEdit = ALLOW_STUDENT_EDIT || !!originalUser
    const isStaffMode = !!originalUser

    const [studentSummary, setStudentSummary] = useState(pol?.studentSummary || '')
    const [studentQuote, setStudentQuote] = useState(pol?.studentQuote || '')
    const [mentorSummary, setMentorSummary] = useState(pol?.mentorSummary || '')
    const [rankings, setRankings] = useState({ ...DEFAULT_RANKINGS, ...pol?.rankings })
    const [futurePlan, setFuturePlan] = useState(pol?.futurePlan || '')

    useEffect(() => {
        setStudentSummary(pol?.studentSummary || '')
        setStudentQuote(pol?.studentQuote || '')
        setMentorSummary(pol?.mentorSummary || '')
        setRankings({ ...DEFAULT_RANKINGS, ...pol?.rankings })
        setFuturePlan(pol?.futurePlan || '')
    }, [pol])

    const shouldSave = useMemo(() => {
        if (!studentSummary.trim() && !studentQuote.trim() && !mentorSummary.trim()) return false
        return (
            studentSummary.trim() !== (pol?.studentSummary || '').trim() ||
            studentQuote.trim() !== (pol?.studentQuote || '').trim() ||
            mentorSummary.trim() !== (pol?.mentorSummary || '').trim() ||
            futurePlan.trim() !== (pol?.futurePlan || '').trim() ||
            CATEGORIES.some(({ key }) => rankings[key] !== ({ ...DEFAULT_RANKINGS, ...pol?.rankings })[key])
        )
    }, [studentSummary, studentQuote, mentorSummary, rankings, futurePlan, pol])

    const setRanking = (key, value) => setRankings(prev => ({ ...prev, [key]: value }))

    const radarData = CATEGORIES.map(({ key, label }) => ({ subject: label, value: rankings[key] }))

    return (
        <>
            <div className='mt-4 border-2 border-black bg-white rounded-lg flex overflow-hidden'>
                <div className='bg-black p-1 flex items-center justify-center min-h-32'>
                    <div className='text-white rotate-90 text-2xl font-bold whitespace-nowrap'>
                        P.O.L
                    </div>
                </div>

                <div className='flex flex-col flex-1 divide-y divide-gray-200'>

                    {/* Zone 1: Text fields */}
                    <div className='flex gap-0 divide-x divide-gray-200'>
                        <div className='flex-1 p-4 flex flex-col gap-3'>
                            <div className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>סיכום החניכ/ה</div>
                            <SmartText
                                text={studentSummary}
                                onEdit={setStudentSummary}
                                editable={canEdit}
                                withIcon={true}
                                className='text-gray-700 text-sm leading-relaxed'
                                placeholder='סיכום הצגת הלמידה של התלמיד...'
                            />
                            <div className='text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2'>ציטוט משמעותי</div>
                            <SmartText
                                text={studentQuote}
                                onEdit={setStudentQuote}
                                editable={canEdit}
                                withIcon={true}
                                multiline={false}
                                className='text-gray-700 text-sm italic'
                                placeholder='ציטוט מרכזי מההצגה...'
                            />
                            {year === '2' && (
                                <>
                                    <div className='text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2'>תוכנית להמשך</div>
                                    <SmartText
                                        text={futurePlan}
                                        onEdit={setFuturePlan}
                                        editable={canEdit}
                                        withIcon={true}
                                        className='text-gray-700 text-sm leading-relaxed'
                                        placeholder='תוכנית להמשך הדרך...'
                                    />
                                </>
                            )}
                        </div>
                        <div className='flex-1 p-4 flex flex-col gap-3'>
                            <div className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>סיכום מנטור</div>
                            <SmartText
                                text={mentorSummary}
                                onEdit={setMentorSummary}
                                editable={isStaffMode}
                                withIcon={isStaffMode}
                                className='text-gray-700 text-sm leading-relaxed'
                                placeholder={isStaffMode ? 'סיכום המנטור...' : ''}
                            />
                        </div>
                    </div>

                    {/* Zone 2: Sliders + Radar */}
                    <div className='flex gap-0 divide-x divide-gray-200'>
                        <div className={`flex-1 p-4 flex flex-col gap-4 ${!isStaffMode ? 'pointer-events-none opacity-80' : ''}`}>
                            <div className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>הערכה</div>
                            {CATEGORIES.map(({ key, label }) => (
                                <div key={key}>
                                    <div className='text-sm font-medium text-gray-600 mb-1'>{label}</div>
                                    <GooeySlider
                                        min={0}
                                        max={100}
                                        value={rankings[key]}
                                        onChange={val => setRanking(key, val)}
                                        labelLeft='לא בוצע'
                                        labelRight='בוצע מעולה'
                                        midValues={['חלקית', 'בוצע']}
                                        color='#1a1a1a'
                                    />
                                </div>
                            ))}
                        </div>
                        <div className='flex-1 p-4 flex items-center justify-center'>
                            <RadarChart data={radarData} size={240} />
                        </div>
                    </div>

                </div>
            </div>

            <AnimatePresence>
                {canEdit && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{
                            opacity: shouldSave ? 1 : 0.5,
                            y: shouldSave ? 0 : -10,
                            scale: shouldSave ? 1 : 0.95
                        }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.3 }}
                        className='mt-4 flex justify-center'
                    >
                        <Button
                            data-role='save'
                            onClick={() => onSave({ studentSummary, studentQuote, mentorSummary, rankings, futurePlan })}
                            disabled={!shouldSave}
                            className={shouldSave ? 'shadow-lg' : ''}
                        >
                            שמירה
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
