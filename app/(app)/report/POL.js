'use client'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/utils/store/useUser'
import Button from '@/components/Button'
import SmartText from '@/components/SmartText'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, HeartHandshakeIcon, Target } from 'lucide-react'
import { ALLOW_STUDENT_EDIT } from './page';

export default function POL({ POL, onSave }) {
    const originalUser = useUser(state => state.originalUser);
    const [question, setQuestion] = useState(POL?.question || '');
    const [answer, setAnswer] = useState(POL?.answer || '');
    const [nextStep, setNextStep] = useState(POL?.nextStep || '');

    useEffect(() => {
        setQuestion(POL?.question || '');
        setAnswer(POL?.answer || '');
        setNextStep(POL?.nextStep || '');
    }, [POL]);

    const shouldSave = useMemo(() => {
        if (question.trim() === '' && answer.trim() === '') return false;
        return question.trim() !== POL?.question?.trim() || answer.trim() !== POL?.answer?.trim() || nextStep.trim() !== POL?.nextStep?.trim();
    }, [question, answer, nextStep, POL?.question, POL?.answer, POL?.nextStep]);

    const canEdit = ALLOW_STUDENT_EDIT || !!originalUser;

    return (
        <>
            <div className='mt-4 border-2 border-black bg-white rounded-lg flex overflow-hidden aspect-9/2'>
                <div className='bg-black p-1 flex items-center justify-center'>
                    <div className='text-white rotate-90 text-2xl font-bold'>
                        P.O.L
                    </div>
                </div>
                <div className='flex gap-4 flex-1'>
                    <div className='flex-1 p-4 flex flex-col gap-2'>
                        <SmartText
                            text={question}
                            onEdit={(newText) => setQuestion(newText)}
                            editable={canEdit}
                            withIcon={true}
                            multiline={false}
                            className='font-bold text-gray-600'
                            placeholder="שאלת POL"
                        />
                        <SmartText
                            text={answer}
                            onEdit={(newText) => setAnswer(newText)}
                            editable={canEdit}
                            withIcon={true}
                            className='text-gray-600'
                            placeholder="תשובת POL"
                        />
                    </div>
                    <div className='flex-1 p-4 flex flex-col gap-2'>
                        <div className='font-bold text-gray-600'>יעד להמשך</div>
                        <SmartText
                            text={nextStep}
                            onEdit={(newText) => setNextStep(newText)}
                            editable={canEdit}
                            withIcon={true}
                            className='text-gray-600'
                            placeholder="יעד להמשך"
                        />
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
