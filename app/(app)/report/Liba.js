'use client'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/utils/store/useUser'
import Button from '@/components/Button'
import Box2 from '@/components/Box2'
import WithLabel from '@/components/WithLabel'
import { HeartHandshakeIcon, Target } from 'lucide-react'

export default function Liba({ data, onSave }) {
    const originalUser = useUser(state => state.originalUser);
    const [question, setQuestion] = useState(data?.liba?.question || '');
    const [answer, setAnswer] = useState(data?.liba?.answer || '');
    const [nextStep, setNextStep] = useState(data?.liba?.nextStep || '');

    useEffect(() => {
        setQuestion(data?.liba?.question || '');
        setAnswer(data?.liba?.answer || '');
        setNextStep(data?.liba?.nextStep || '');
    }, [data]);

    const shouldSave = useMemo(() => {
        if (question.trim() === '' && answer.trim() === '') return false;
        return question.trim() !== data?.liba?.question?.trim() || answer.trim() !== data?.liba?.answer?.trim() || nextStep.trim() !== data?.liba?.nextStep?.trim();
    }, [question, answer, nextStep, data?.liba?.question, data?.liba?.answer, data?.liba?.nextStep]);


    return (
        <>
            {originalUser && (
                <Box2 label="ליבה" LabelIcon={Heart}>
                    <WithLabel label="שאלת ליבה" Icon={Heart} className="mb-2">
                        <input type="text" defaultValue={question} onChange={e => setQuestion(e.target.value)} placeholder="שאלת ליבה" className='w-full bg-white border border-border rounded-lg p-2' />
                    </WithLabel>
                    <WithLabel label="תשובת ליבה" Icon={HeartHandshakeIcon} className="mb-2">
                        <textarea rows={4} defaultValue={answer} onChange={e => setAnswer(e.target.value)} placeholder="תשובת ליבה" className="w-full bg-white border border-border rounded-lg p-2" />
                    </WithLabel>
                    <WithLabel label="יעד להמשך" Icon={Target} className="mb-2 mt-6">
                        <textarea rows={4} defaultValue={nextStep} onChange={e => setNextStep(e.target.value)} placeholder="יעד להמשך" className="w-full bg-white border border-border rounded-lg p-2" />
                    </WithLabel>
                    <Button data-role="save" onClick={() => onSave({ question, answer, nextStep })} disabled={!shouldSave} className="mt-2">שמירה</Button>
                </Box2>
            )}
            <div className='mt-4 border-2 border-black bg-white rounded-lg flex overflow-hidden aspect-9/2'>
                <div className='bg-black p-1 flex items-center justify-center'>
                    <div className='text-white rotate-90 text-2xl font-bold'>
                        ליבה
                    </div>
                </div>
                <div className='flex gap-4 flex-1'>
                    <div className='flex-1 p-4'>
                        <div className='font-bold text-gray-600'>{data?.liba?.question}</div>
                        <div className='text-gray-600'>{data?.liba?.answer}</div>
                    </div>
                    <div className='flex-1 p-4'>
                        <div className='font-bold text-gray-600'>יעד להמשך</div>
                        <div className='text-gray-600'>{data?.liba?.nextStep}</div>
                    </div>
                </div>
            </div>
        </>
    )
}
