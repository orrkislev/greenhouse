'use client'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/utils/store/useUser'
import Button from '@/components/Button'
import SmartText from '@/components/SmartText'
import { motion, AnimatePresence } from 'motion/react'
import { ALLOW_STUDENT_EDIT } from './page';

export default function Vocation({ vocation, onSave }) {
    const originalUser = useUser(state => state.originalUser);
    const [employmentQuestion, setEmploymentQuestion] = useState(vocation?.employmentQuestion || '');
    const [employmentAnswer, setEmploymentAnswer] = useState(vocation?.employmentAnswer || '');
    const [volunteeringQuestion, setVolunteeringQuestion] = useState(vocation?.volunteeringQuestion || '');
    const [volunteeringAnswer, setVolunteeringAnswer] = useState(vocation?.volunteeringAnswer || '');
    const [jobTitle, setJobTitle] = useState(vocation?.jobTitle || '');
    const [hours, setHours] = useState(vocation?.hours || '');

    useEffect(() => {
        setEmploymentQuestion(vocation?.employmentQuestion || '');
        setEmploymentAnswer(vocation?.employmentAnswer || '');
        setVolunteeringQuestion(vocation?.volunteeringQuestion || '');
        setVolunteeringAnswer(vocation?.volunteeringAnswer || '');
    }, [vocation]);

    const shouldSave = useMemo(() => {
        if (employmentQuestion.trim() === '' && employmentAnswer.trim() === '' && volunteeringQuestion.trim() === '' && volunteeringAnswer.trim() === '' && jobTitle.trim() === '' && hours.trim() === '') return false;
        return employmentQuestion.trim() !== vocation?.employmentQuestion?.trim() || employmentAnswer.trim() !== vocation?.employmentAnswer?.trim() || volunteeringQuestion.trim() !== vocation?.volunteeringQuestion?.trim() || volunteeringAnswer.trim() !== vocation?.volunteeringAnswer?.trim() || jobTitle.trim() !== vocation?.jobTitle?.trim() || hours.trim() !== vocation?.hours?.trim();
    }, [employmentQuestion, employmentAnswer, volunteeringQuestion, volunteeringAnswer, jobTitle, hours, vocation?.employmentQuestion, vocation?.employmentAnswer, vocation?.volunteeringQuestion, vocation?.volunteeringAnswer, vocation?.jobTitle, vocation?.hours]);

    const canEdit = ALLOW_STUDENT_EDIT || !!originalUser;

    return (
        <>
            <div className='mt-4 border-2 border-black bg-white rounded-lg flex overflow-hidden aspect-9/2'>
                <div className='bg-black p-1 flex items-center justify-center'>
                    <div className='text-white rotate-90 text-2xl font-bold'>
                        יזמות מקיימת
                    </div>
                </div>
                <div className='flex gap-4 flex-1'>
                    <div className='flex-1 p-4 flex flex-col gap-2'>
                        <div className='flex gap-8'>
                            <SmartText
                                text={jobTitle}
                                onEdit={(newText) => setJobTitle(newText)}
                                editable={canEdit}
                                className='text-xl font-bold text-gray-800'
                                placeholder="תפקיד"
                            />
                            <div className='flxe gap-2'>
                                <SmartText
                                    text={hours}
                                    onEdit={(newText) => setHours(newText)}
                                    editable={canEdit}
                                    className='text-lg text-gray-800'
                                    placeholder="שעות"
                                />
                                <div>שעות</div>
                            </div>
                        </div>
                        <SmartText
                            text={employmentQuestion}
                            onEdit={(newText) => setEmploymentQuestion(newText)}
                            editable={canEdit}
                            withIcon={true}
                            className='font-bold text-gray-600'
                            placeholder="שאלת תעסוקה"
                        />
                        <SmartText
                            text={employmentAnswer}
                            onEdit={(newText) => setEmploymentAnswer(newText)}
                            editable={canEdit}
                            withIcon={true}
                            className='text-gray-600'
                            placeholder="תשובת תעסוקה"
                        />
                    </div>
                    <div className='flex-1 p-4 flex flex-col gap-2'>
                        <SmartText
                            text={volunteeringQuestion}
                            onEdit={(newText) => setVolunteeringQuestion(newText)}
                            editable={canEdit}
                            withIcon={true}
                            className='font-bold text-gray-600'
                            placeholder="שאלת מעורבות קהילתית"
                        />
                        <SmartText
                            text={volunteeringAnswer}
                            onEdit={(newText) => setVolunteeringAnswer(newText)}
                            editable={canEdit}
                            withIcon={true}
                            className='text-gray-600'
                            placeholder="תשובת מעורבות קהילתית"
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
                            onClick={() => onSave({ employmentQuestion, employmentAnswer, volunteeringQuestion, volunteeringAnswer, jobTitle, hours })}
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