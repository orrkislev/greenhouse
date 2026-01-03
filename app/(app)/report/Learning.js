'use client'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/utils/store/useUser'
import Button from '@/components/Button'
import Box2 from '@/components/Box2'
import { Heart } from 'lucide-react'

export default function Learning({ data, onSave }) {
    const originalUser = useUser(state => state.originalUser);

    const defaultTopics = [
        { name: 'אנגלית', learnings: ['', '', ''], howLearned: '' },
        { name: '', learnings: ['', '', ''], howLearned: '' },
        { name: '', learnings: ['', '', ''], howLearned: '' },
        { name: '', learnings: ['', '', ''], howLearned: '' }
    ];

    const [topics, setTopics] = useState(data?.learning?.topics || defaultTopics);
    const [question, setQuestion] = useState(data?.learning?.question || '');
    const [answer, setAnswer] = useState(data?.learning?.answer || '');

    useEffect(() => {
        setTopics(data?.learning?.topics || defaultTopics);
        setQuestion(data?.learning?.question || '');
        setAnswer(data?.learning?.answer || '');
    }, [data]);

    const updateTopic = (index, field, value) => {
        const newTopics = [...topics];
        newTopics[index] = { ...newTopics[index], [field]: value };
        setTopics(newTopics);
    };

    const updateLearning = (topicIndex, learningIndex, value) => {
        const newTopics = [...topics];
        newTopics[topicIndex].learnings[learningIndex] = value;
        setTopics(newTopics);
    };

    const shouldSave = useMemo(() => {
        return JSON.stringify({ topics, question, answer }) !== JSON.stringify({
            topics: data?.learning?.topics || defaultTopics,
            question: data?.learning?.question || '',
            answer: data?.learning?.answer || ''
        });
    }, [topics, question, answer, data]);

    return (
        <>
            {originalUser && (
                <Box2 label="למידה" LabelIcon={Heart}>
                    <div className="space-y-3">
                        {topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="border border-border rounded-2xl p-3 bg-gray-50">
                                <input
                                    type="text"
                                    value={topic.name}
                                    onChange={e => updateTopic(topicIndex, 'name', e.target.value)}
                                    placeholder={topicIndex === 0 ? 'אנגלית' : `נושא ${topicIndex}`}
                                    disabled={topicIndex === 0}
                                    className='w-full bg-white border border-border rounded-full px-3 py-1 text-center text-sm font-medium mb-2 disabled:bg-gray-200'
                                />

                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {topic.learnings.map((learning, learningIndex) => (
                                        <input
                                            key={learningIndex}
                                            type="text"
                                            value={learning}
                                            onChange={e => updateLearning(topicIndex, learningIndex, e.target.value)}
                                            placeholder={`דבר ${['ראשון', 'שני', 'שלישי'][learningIndex]}`}
                                            className='bg-white border border-border rounded-full px-3 py-1 text-xs text-center'
                                        />
                                    ))}
                                </div>

                                <textarea
                                    rows={1}
                                    value={topic.howLearned}
                                    onChange={e => updateTopic(topicIndex, 'howLearned', e.target.value)}
                                    placeholder="איך למדתי"
                                    className="w-full bg-white border border-border rounded-full px-3 py-1 text-xs resize-none"
                                />
                            </div>
                        ))}

                        <div className="border-t pt-3 mt-3">
                            <input
                                type="text"
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                placeholder="שאלה"
                                className='w-full bg-white border border-border rounded-lg px-3 py-2 text-sm mb-2'
                            />
                            <textarea
                                rows={3}
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                placeholder="תשובה"
                                className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm resize-none"
                            />
                        </div>
                    </div>

                    <Button
                        data-role="save"
                        onClick={() => onSave({ topics, question, answer })}
                        disabled={!shouldSave}
                        className="mt-3"
                    >
                        שמירה
                    </Button>
                </Box2>
            )}

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
                            </tr>
                        </thead>
                        <tbody>
                            {data?.learning?.topics?.filter(t => t.name).map((topic, index) => (
                                <tr key={index} className='border-b border-dashed border-gray-400'>
                                    <td className='font-bold'>{topic.name}</td>
                                    <td className='text-right'>
                                        <ol className='list-decimal list-inside text-sm space-y-1'>
                                            {topic.learnings.filter(l => l).map((learning, i) => (
                                                <li key={i}>{learning}</li>
                                            ))}
                                        </ol>
                                    </td>
                                    <td className='text-right text-sm text-gray-700'>
                                        {topic.howLearned}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Question/Answer Section */}
                    {data?.learning?.question && (
                        <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-400">
                            <div className='text-right mb-2'>
                                <span className='font-bold text-lg'>{data?.learning?.question}</span>
                            </div>
                            <div className='text-right text-gray-700'>
                                {data?.learning?.answer}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
