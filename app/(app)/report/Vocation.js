'use client'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/utils/store/useUser'
import Button from '@/components/Button'
import Box2 from '@/components/Box2'
import WithLabel from '@/components/WithLabel'
import { Briefcase, BriefcaseBusiness, Earth } from 'lucide-react'

export default function Vocation({ data, onSave }) {
    const originalUser = useUser(state => state.originalUser);
    const [employmentQuestion, setEmploymentQuestion] = useState(data?.vocation?.employmentQuestion || '');
    const [employmentAnswer, setEmploymentAnswer] = useState(data?.vocation?.employmentAnswer || '');
    const [volunteeringQuestion, setVolunteeringQuestion] = useState(data?.vocation?.volunteeringQuestion || '');
    const [volunteeringAnswer, setVolunteeringAnswer] = useState(data?.vocation?.volunteeringAnswer || '');

    useEffect(() => {
        setEmploymentQuestion(data?.vocation?.employmentQuestion || '');
        setEmploymentAnswer(data?.vocation?.employmentAnswer || '');
        setVolunteeringQuestion(data?.vocation?.volunteeringQuestion || '');
        setVolunteeringAnswer(data?.vocation?.volunteeringAnswer || '');
    }, [data]);

    const shouldSave = useMemo(() => {
        if (employmentQuestion.trim() === '' && employmentAnswer.trim() === '' && volunteeringQuestion.trim() === '' && volunteeringAnswer.trim() === '') return false;
        return employmentQuestion.trim() !== data?.vocation?.employmentQuestion?.trim() || employmentAnswer.trim() !== data?.vocation?.employmentAnswer?.trim() || volunteeringQuestion.trim() !== data?.vocation?.volunteeringQuestion?.trim() || volunteeringAnswer.trim() !== data?.vocation?.volunteeringAnswer?.trim();
    }, [employmentQuestion, employmentAnswer, volunteeringQuestion, volunteeringAnswer, data?.vocation?.employmentQuestion, data?.vocation?.employmentAnswer, data?.vocation?.volunteeringQuestion, data?.vocation?.volunteeringAnswer]);

    return (
        <>
            {originalUser && (
                <Box2 label="יזמות מקיימת" LabelIcon={Earth}>
                    <WithLabel label="שאלת תעסוקה" Icon={Briefcase} className="mb-2">
                        <input type="text" defaultValue={employmentQuestion} onChange={e => setEmploymentQuestion(e.target.value)} placeholder="שאלת תעסוקה" className='w-full bg-white border border-border rounded-lg p-2' />
                    </WithLabel>
                    <WithLabel label="תשובה" Icon={BriefcaseBusiness} className="mb-2">
                        <textarea rows={4} defaultValue={employmentAnswer} onChange={e => setEmploymentAnswer(e.target.value)} placeholder="תשובה" className="w-full bg-white border border-border rounded-lg p-2" />
                    </WithLabel>

                    <WithLabel label="שאלת התנדבות" Icon={Earth} className="mb-2">
                        <input type="text" defaultValue={volunteeringQuestion} onChange={e => setVolunteeringQuestion(e.target.value)} placeholder="שאלת התנדבות" className='w-full bg-white border border-border rounded-lg p-2' />
                    </WithLabel>
                    <WithLabel label="תשובה" Icon={Earth} className="mb-2">
                        <textarea rows={4} defaultValue={volunteeringAnswer} onChange={e => setVolunteeringAnswer(e.target.value)} placeholder="תשובה" className="w-full bg-white border border-border rounded-lg p-2" />
                    </WithLabel>
                    <Button data-role="save" onClick={() => onSave({ employmentQuestion, employmentAnswer, volunteeringQuestion, volunteeringAnswer })} disabled={!shouldSave} className="mt-2">שמירה</Button>
                </Box2>
            )}

            <div className='mt-4 border-2 border-black bg-white rounded-lg flex overflow-hidden aspect-9/2'>
                <div className='bg-black p-1 flex items-center justify-center'>
                    <div className='text-white rotate-90 text-2xl font-bold'>
                        יזמות מקיימת
                    </div>
                </div>
                <div className='flex gap-4 flex-1'>
                    <div className='flex-1 p-4'>
                        <div className='font-bold text-gray-600'>{data?.vocation?.employmentQuestion}</div>
                        <div className='text-gray-600'>{data?.vocation?.employmentAnswer}</div>
                    </div>
                    <div className='flex-1 p-4'>
                        <div className='font-bold text-gray-600'>{data?.vocation?.volunteeringQuestion}</div>
                        <div className='text-gray-600'>{data?.vocation?.volunteeringAnswer}</div>
                    </div>
                </div>
            </div>
        </>
    )
}