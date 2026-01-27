'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/utils/store/useUser'
import Button from '@/components/Button'
import SmartText from '@/components/SmartText'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { ALLOW_STUDENT_EDIT } from './page';

export default function Learning({ learning, onSave }) {
    const originalUser = useUser(state => state.originalUser);
    const [madeChanges, setMadeChanges] = useState(false);
    const defaultTopics = [
        { name: 'אנגלית', learnings: ['', '', ''], howLearned: '' },
        { name: '', learnings: ['', '', ''], howLearned: '' },
        { name: '', learnings: ['', '', ''], howLearned: '' },
        { name: '', learnings: ['', '', ''], howLearned: '' }
    ];

    const [topics, setTopics] = useState(learning?.topics || defaultTopics);
    const [question, setQuestion] = useState(learning?.question || '');
    const [answer, setAnswer] = useState(learning?.answer || '');
    const [englishMasterReview, setEnglishMasterReview] = useState(learning?.englishMasterReview || '');
    const [visibleTopicsCount, setVisibleTopicsCount] = useState(2); // English + 1 topic

    useEffect(() => {
        setTopics(learning?.topics || defaultTopics);
        setQuestion(learning?.question || '');
        setAnswer(learning?.answer || '');
        setEnglishMasterReview(learning?.englishMasterReview || '');
        // Calculate how many topics have content
        const filledTopics = (learning?.topics || defaultTopics).filter(t => t.name).length;
        setVisibleTopicsCount(Math.max(2, filledTopics));
    }, [learning]);

    const updateTopic = (index, field, value) => {
        const newTopics = [...topics];
        newTopics[index] = { ...newTopics[index], [field]: value };
        setTopics(newTopics);
        setMadeChanges(true);
    };

    const updateLearning = (topicIndex, learningIndex, value) => {
        const newTopics = [...topics];
        newTopics[topicIndex].learnings[learningIndex] = value;
        setTopics(newTopics);
        setMadeChanges(true);
    };

    const removeTopic = (topicIndex) => {
        if (topicIndex === 0) return; // Can't remove English topic
        const newTopics = [...topics];
        newTopics[topicIndex] = { name: '', learnings: ['', '', ''], howLearned: '' };
        setTopics(newTopics);
        // Adjust visible count if we cleared a visible topic
        const filledTopics = newTopics.filter(t => t.name).length;
        setVisibleTopicsCount(Math.max(2, filledTopics));
        setMadeChanges(true);
    };

    // const shouldSave = useMemo(() => {
    //     return JSON.stringify({ topics, question, answer }) !== JSON.stringify({
    //         topics: learning?.topics || defaultTopics,
    //         question: learning?.question || '',
    //         answer: learning?.answer || ''
    //     });
    // }, [topics, question, answer, learning?.topics, learning?.question, learning?.answer]);
    const shouldSave = madeChanges;

    const canEdit = ALLOW_STUDENT_EDIT || !!originalUser;

    return (
        <>
            <div className='mt-4 border-2 border-gray-400 bg-white rounded-2xl flex overflow-hidden'>
                <div className='bg-gray-400 p-2 flex items-center justify-center min-w-[60px]'>
                    <div className='text-white rotate-90 text-3xl font-bold whitespace-nowrap'>
                        למידה
                    </div>
                </div>
                <div className='flex-1 p-6'>
                    <table border={1} className='w-full text-right'>
                        <thead className='border-b border-gray-400'>
                            <tr>
                                <th className='font-bold'>נושא הלמידה</th>
                                <th className='font-bold'>מה למדתי</th>
                                <th className='font-bold'>איך למדתי</th>
                                {canEdit && <th className='w-8'></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {topics.slice(0, canEdit ? visibleTopicsCount : topics.length).filter(t => canEdit || t.name).map((topic) => {
                                const topicIndex = topics.indexOf(topic);
                                return (
                                    <>
                                        <tr key={topicIndex} className='border-b border-dashed border-gray-400'>
                                            <td className='font-bold p-2'>
                                                <SmartText
                                                    text={topic.name}
                                                    onEdit={(newText) => updateTopic(topicIndex, 'name', newText)}
                                                    editable={canEdit && topicIndex !== 0}
                                                    withIcon={true}
                                                    className='font-bold'
                                                    placeholder={topicIndex === 0 ? 'אנגלית' : `נושא ${topicIndex + 1}`}
                                                />
                                            </td>
                                            <td className='text-right p-2'>
                                                <ol className='list-disc text-sm space-y-1'>
                                                    {topic.learnings.map((learning, learningIndex) => (
                                                        <li key={learningIndex}>
                                                            <SmartText
                                                                text={learning}
                                                                onEdit={(newText) => updateLearning(topicIndex, learningIndex, newText)}
                                                                editable={canEdit}
                                                                withIcon={false}
                                                                className='text-sm inline'
                                                                placeholder={`דבר ${['ראשון', 'שני', 'שלישי'][learningIndex]}`}
                                                            />
                                                        </li>
                                                    ))}
                                                </ol>
                                            </td>
                                            <td className='text-right text-sm text-gray-700 p-2'>
                                                <SmartText
                                                    text={topic.howLearned}
                                                    onEdit={(newText) => updateTopic(topicIndex, 'howLearned', newText)}
                                                    editable={canEdit}
                                                    withIcon={false}
                                                    className='text-sm'
                                                    placeholder="איך למדתי"
                                                />
                                            </td>
                                            {canEdit && (
                                                <td className='p-2 text-center'>
                                                    {topicIndex !== 0 && (
                                                        <button
                                                            onClick={() => removeTopic(topicIndex)}
                                                            className='text-gray-400 hover:text-red-500 transition-colors p-1'
                                                            title="הסר נושא"
                                                        >
                                                            <X className='w-4 h-4' />
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                        {topicIndex === 0 && (
                                            <tr key="english-master-review" className='border-b border-dashed border-gray-400 bg-gray-50'>
                                                <td className='font-bold p-2 text-gray-600'>
                                                    משוב מאסטר אנגלית
                                                </td>
                                                <td colSpan={canEdit ? 3 : 2} className='text-right p-2'>
                                                    <SmartText
                                                        text={englishMasterReview}
                                                        onEdit={(newText) => { setEnglishMasterReview(newText); setMadeChanges(true); }}
                                                        editable={!!originalUser}
                                                        withIcon={!!originalUser}
                                                        className='text-sm'
                                                        placeholder="משוב מאסטר אנגלית"
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                            {canEdit && visibleTopicsCount < 4 && (
                                <tr>
                                    <td colSpan={4} className='p-2 text-center'>
                                        <button
                                            onClick={() => setVisibleTopicsCount(prev => Math.min(4, prev + 1))}
                                            className='text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold w-full py-2'
                                        >
                                            +
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Question/Answer Section */}
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-400">
                        <div className='text-right mb-2'>
                            <SmartText
                                text={question}
                                onEdit={(newText) => { setQuestion(newText); setMadeChanges(true); }}
                                editable={canEdit}
                                withIcon={true}
                                className='font-bold text-lg'
                                placeholder="שאלה"
                            />
                        </div>
                        <div className='text-right text-gray-700'>
                            <SmartText
                                text={answer}
                                onEdit={(newText) => { setAnswer(newText); setMadeChanges(true); }}
                                editable={canEdit}
                                withIcon={true}
                                className='text-gray-700'
                                placeholder="תשובה"
                            />
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
                            onClick={() => {
                                onSave({ topics, question, answer, englishMasterReview });
                                setMadeChanges(false);
                            }}
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
