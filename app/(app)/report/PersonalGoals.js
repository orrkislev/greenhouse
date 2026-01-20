'use client'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/utils/store/useUser'
import Button from '@/components/Button'
import Box2 from '@/components/Box2'
import { Target } from 'lucide-react'
import RadarChart from '@/components/RadarChart'
import { ALLOW_STUDENT_EDIT } from './page';

export default function PersonalGoals({ personalGoals, onSave }) {
    const originalUser = useUser(state => state.originalUser);
    const defaultGoals = {
        initialGoals: ['', '', ''],
        updatedGoals: ['', '', ''],
        mode: 'questions', // 'questions' or 'radar'
        question: '',
        radarData: [
            { subject: 'תכנון', value: 50 },
            { subject: 'למידה', value: 50 },
            { subject: 'ביצוע', value: 50 },
            { subject: 'רכישת מקצוע', value: 50 },
            { subject: 'הצגה', value: 50 }
        ],
        summary: ''
    };

    const [initialGoals, setInitialGoals] = useState(personalGoals?.initialGoals || defaultGoals.initialGoals);
    const [updatedGoals, setUpdatedGoals] = useState(personalGoals?.updatedGoals || defaultGoals.updatedGoals);
    const [mode, setMode] = useState(personalGoals?.mode || 'questions');
    const [question, setQuestion] = useState(personalGoals?.question || '');
    const [answer, setAnswer] = useState(personalGoals?.answer || '');
    const [radarData, setRadarData] = useState(personalGoals?.radarData || defaultGoals.radarData);
    const [summary, setSummary] = useState(personalGoals?.summary || '');

    useEffect(() => {
        setInitialGoals(personalGoals?.initialGoals || defaultGoals.initialGoals);
        setUpdatedGoals(personalGoals?.updatedGoals || defaultGoals.updatedGoals);
        setMode(personalGoals?.mode || 'questions');
        setQuestion(personalGoals?.question || '');
        setAnswer(personalGoals?.answer || '');
        setRadarData(personalGoals?.radarData || defaultGoals.radarData);
        setSummary(personalGoals?.summary || '');
    }, [personalGoals]);

    const updateInitialGoal = (index, value) => {
        const newGoals = [...initialGoals];
        newGoals[index] = value;
        setInitialGoals(newGoals);
    };

    const updateUpdatedGoal = (index, value) => {
        const newGoals = [...updatedGoals];
        newGoals[index] = value;
        setUpdatedGoals(newGoals);
    };

    const shouldSave = useMemo(() => {
        return JSON.stringify({ initialGoals, updatedGoals, mode, question, answer, radarData, summary }) !== JSON.stringify({
            initialGoals: personalGoals?.initialGoals || defaultGoals.initialGoals,
            updatedGoals: personalGoals?.updatedGoals || defaultGoals.updatedGoals,
            mode: personalGoals?.mode || 'questions',
            question: personalGoals?.question || '',
            answer: personalGoals?.answer || '',
            radarData: personalGoals?.radarData || defaultGoals.radarData,
            summary: personalGoals?.summary || ''
        });
    }, [initialGoals, updatedGoals, mode, question, answer, radarData, summary, personalGoals]);

    const canEdit = ALLOW_STUDENT_EDIT || !!originalUser;

    return (
        <>
            {canEdit && (
                <Box2 label="מטרות אישיות" LabelIcon={Target}>
                    <div className="space-y-4">
                        <div className="border border-border rounded-2xl p-4 bg-gray-50">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <h3 className="text-center font-medium">מטרות מתחילת השנה</h3>
                                <h3 className="text-center font-medium">מטרות מעודכנות</h3>
                            </div>
                            <div className="space-y-2">
                                {initialGoals.map((_, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-4">
                                        <textarea
                                            rows={2}
                                            value={initialGoals[index]}
                                            onChange={e => updateInitialGoal(index, e.target.value)}
                                            placeholder={`מטרה ${index + 1}`}
                                            className='w-full bg-white border border-border rounded-lg px-3 py-2 text-sm resize-none'
                                            disabled={!canEdit}
                                        />
                                        <textarea
                                            rows={2}
                                            value={updatedGoals[index]}
                                            onChange={e => updateUpdatedGoal(index, e.target.value)}
                                            placeholder={`מטרה ${index + 1}`}
                                            className='w-full bg-white border border-border rounded-lg px-3 py-2 text-sm resize-none'
                                            disabled={!canEdit}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-3 mt-3">
                            <div className="flex justify-center mb-4">
                                <div className="inline-flex rounded-lg border border-border bg-gray-100 p-1">
                                    {canEdit && (<button
                                        onClick={() => setMode('questions')}
                                        className={`px-4 py-2 rounded-md text-sm transition-colors ${
                                            mode === 'questions'
                                                ? 'bg-white shadow-sm font-medium'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        לא עשיתי פ.גמר
                                    </button>
                                    )}
                                    <button
                                        onClick={() => setMode('radar')}
                                        className={`px-4 py-2 rounded-md text-sm transition-colors ${
                                            mode === 'radar'
                                                ? 'bg-white shadow-sm font-medium'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        עשיתי פ.גמר
                                    </button>
                                </div>
                            </div>

                            {mode === 'questions' ? (
                                <>
                                    <textarea
                                        rows={3}
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                        placeholder="תיאור של דברים שעשיתי"
                                        className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm resize-none"
                                        disabled={!canEdit}
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-center mb-4">
                                        <RadarChart
                                            data={radarData}
                                            size={250}
                                            onEdit={setRadarData}
                                        />
                                    </div>
                                    <textarea
                                        rows={4}
                                        value={summary}
                                        onChange={e => setSummary(e.target.value)}
                                        placeholder="סיכום משותף של הפרויקט"
                                        className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm resize-none"
                                        disabled={!canEdit}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {canEdit && (<Button
                        data-role="save"
                        onClick={() => onSave({ initialGoals, updatedGoals, mode, question, answer, radarData, summary })}
                        disabled={!shouldSave}
                        className="mt-3"
                    >
                        שמירה
                    </Button>)}
                </Box2>
            )}

            <div className='mt-4 border-2 border-gray-400 bg-white rounded-2xl flex overflow-hidden'>
                <div className='bg-gray-400 p-2 flex items-center justify-center min-w-[60px]'>
                    <div className='text-white rotate-90 text-3xl font-bold whitespace-nowrap'>
                        מטרות אישיות
                    </div>
                </div>
                <div className='flex-1 p-6'>
                    <div className="space-y-6">
                        {/* Goals Section - Side by Side */}
                        {(personalGoals?.initialGoals?.some(g => g) || personalGoals?.updatedGoals?.some(g => g)) && (
                            <div className="grid grid-cols-2 gap-6">
                                {/* Initial Goals */}
                                {personalGoals?.initialGoals?.some(g => g) && (
                                    <div>
                                        <h3 className="font-bold text-lg mb-3 text-right">מטרות מתחילת השנה</h3>
                                        <ol className='list-decimal list-inside text-right space-y-2'>
                                            {personalGoals.initialGoals.filter(g => g).map((goal, index) => (
                                                <li key={index} className="text-gray-700">{goal}</li>
                                            ))}
                                        </ol>
                                    </div>
                                )}

                                {/* Updated Goals */}
                                {personalGoals?.updatedGoals?.some(g => g) && (
                                    <div>
                                        <h3 className="font-bold text-lg mb-3 text-right">מטרות מעודכנות</h3>
                                        <ol className='list-decimal list-inside text-right space-y-2'>
                                            {personalGoals.updatedGoals.filter(g => g).map((goal, index) => (
                                                <li key={index} className="text-gray-700">{goal}</li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Question/Answer or Radar Chart Section */}
                        {personalGoals?.mode === 'questions' && personalGoals?.question && (
                            <div className="pt-4 border-t-2 border-dashed border-gray-400">
                                <div className='text-right mb-2'>
                                    <span className='font-bold text-lg'>{personalGoals?.question}</span>
                                </div>
                                <div className='text-right text-gray-700'>
                                    {personalGoals?.answer}
                                </div>
                            </div>
                        )}

                        {personalGoals?.mode === 'radar' && personalGoals?.radarData && (
                            <div className="pt-4 border-t-2 border-dashed border-gray-400">
                                <div className="flex gap-6">
                                    <div className="flex-1 flex items-center justify-center">
                                        <RadarChart data={personalGoals.radarData} size={200} />
                                    </div>
                                    {personalGoals?.summary && (
                                        <div className="flex-1 text-right text-gray-700">
                                            {personalGoals.summary}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
