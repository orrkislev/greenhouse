'use client'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/utils/store/useUser'
import Button from '@/components/Button'
import SmartText from '@/components/SmartText'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, HeartHandshakeIcon, Target } from 'lucide-react'

export default function Liba({ liba, onSave }) {
    const originalUser = useUser(state => state.originalUser);
    const [question, setQuestion] = useState(liba?.question || '');
    const [answer, setAnswer] = useState(liba?.answer || '');
    const [nextStep, setNextStep] = useState(liba?.nextStep || '');

    useEffect(() => {
        setQuestion(liba?.question || '');
        setAnswer(liba?.answer || '');
        setNextStep(liba?.nextStep || '');
    }, [liba]);

    const shouldSave = useMemo(() => {
        if (question.trim() === '' && answer.trim() === '') return false;
        return question.trim() !== liba?.question?.trim() || answer.trim() !== liba?.answer?.trim() || nextStep.trim() !== liba?.nextStep?.trim();
    }, [question, answer, nextStep, liba?.question, liba?.answer, liba?.nextStep]);


    return (
        <>
            <div className='mt-4 border-2 border-black bg-white rounded-lg flex overflow-hidden aspect-9/2'>
                <div className='bg-black p-1 flex items-center justify-center'>
                    <div className='text-white rotate-90 text-2xl font-bold'>
                        ליבה
                    </div>
                </div>
                <div className='flex gap-4 flex-1'>
                    <div className='flex-1 p-4 flex flex-col gap-2'>
                        <SmartText
                            text={question}
                            onEdit={(newText) => setQuestion(newText)}
                            editable={!!originalUser}
                            withIcon={true}
                            className='font-bold text-gray-600'
                            placeholder="שאלת ליבה"
                        />
                        <SmartText
                            text={answer}
                            onEdit={(newText) => setAnswer(newText)}
                            editable={!!originalUser}
                            withIcon={true}
                            className='text-gray-600'
                            placeholder="תשובת ליבה"
                        />
                    </div>
                    <div className='flex-1 p-4 flex flex-col gap-2'>
                        <div className='font-bold text-gray-600'>יעד להמשך</div>
                        <SmartText
                            text={nextStep}
                            onEdit={(newText) => setNextStep(newText)}
                            editable={!!originalUser}
                            withIcon={true}
                            className='text-gray-600'
                            placeholder="יעד להמשך"
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {originalUser && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{
                            opacity: shouldSave ? 1 : 0.5,
                            y: shouldSave ? 0 : -10,
                            scale: shouldSave ? 1 : 0.95
                        }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            duration: 0.3
                        }}
                        className="mt-4 flex justify-center"
                    >
                        <Button
                            data-role="save"
                            onClick={() => onSave({ question, answer, nextStep })}
                            disabled={!shouldSave}
                            className={shouldSave ? "shadow-lg" : ""}
                        >
                            שמירה
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
