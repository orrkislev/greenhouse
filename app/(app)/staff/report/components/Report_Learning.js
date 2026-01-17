import { ReportPageSection } from "./Layout";

export default function Report_Learning({ student }) {
    const learning = student.student?.learning;
    const topics = learning?.topics?.filter(t => t.name) || [];
    const question = learning?.question;
    const answer = learning?.answer;

    return (
        <ReportPageSection title="למידה" className="flex-2">
            <div className='h-full flex flex-col justify-between'>
                <div>
                    <table className='w-full text-right'>
                        <thead className='border-b border-neutral-600'>
                            <tr>
                                <th className='font-bold text-sm pb-1'>נושא הלמידה</th>
                                <th className='font-bold text-sm pb-1'>מה למדתי</th>
                                <th className='font-bold text-sm pb-1'>איך למדתי</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topics.map((topic, index) => (
                                <tr key={index} className='border-b border-dashed border-neutral-400'>
                                    <td className='font-bold p-1 text-sm align-top'>{topic.name}</td>
                                    <td className='p-1 align-top'>
                                        <ul className='list-disc list-inside text-xs'>
                                            {topic.learnings?.filter(l => l).map((learning, i) => (
                                                <li key={i}>{learning}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className='text-xs text-neutral-700 p-1 align-top'>{topic.howLearned}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(question || answer) && (
                    <div className="mb-8">
                        {question && <div className='font-bold text-sm'>{question}</div>}
                        {answer && <div className='text-xs text-neutral-700 mt-1'>{answer}</div>}
                    </div>
                )}
            </div>
        </ReportPageSection>
    )
}