import { Fragment } from "react";
import { ReportPageSection, SectionSubtitle, SectionText } from "./Layout";

export default function Report_Learning({ student }) {
    const learning = student.learning;
    const topics = learning?.topics?.filter(t => t.name) || [];
    const question = learning?.question;
    const answer = learning?.answer;
    const englishMasterReview = learning?.englishMasterReview;

    return (
        <ReportPageSection title="למידה" className="flex-2">
            <div className='h-full flex flex-col justify-between'>
                <div>
                    <table className='w-full text-right'>
                        <thead className='border-b border-neutral-600'>
                            <tr>
                                <th className='font-bold pb-1'>נושא הלמידה</th>
                                <th className='font-bold pb-1'>מה למדתי</th>
                                <th className='font-bold pb-1'>איך למדתי</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topics.map((topic, index) => (
                                <Fragment key={index}>
                                    <tr className='border-b border-dashed border-neutral-400'>
                                        <td className='font-bold p-1 align-top' contentEditable suppressContentEditableWarning>{topic.name}</td>
                                        <td className='p-1 align-top' contentEditable suppressContentEditableWarning>
                                            <ul className='list-disc list-inside'>
                                                {topic.learnings?.filter(l => l).map((learning, i) => (
                                                    <li key={i}>{learning}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className='text-neutral-700 p-1 align-top' contentEditable suppressContentEditableWarning>{topic.howLearned}</td>
                                    </tr>
                                    {index === 0 && englishMasterReview && (
                                        <tr key={`${index}-master-review`} className='border-b border-dashed border-neutral-400'>
                                            <td className='font-bold p-1 align-top' contentEditable suppressContentEditableWarning>חוות דעת מנחה</td>
                                            <td colSpan="2" className='p-1 align-top text-neutral-700 italic' contentEditable suppressContentEditableWarning>
                                                {englishMasterReview}
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(question || answer) && (
                    <div className="mb-8">
                        {/* {question && <div className='font-bold text-sm' contentEditable suppressContentEditableWarning>{question}</div>} */}
                        <SectionSubtitle>{question}</SectionSubtitle>
                        <SectionText>{answer}</SectionText>
                        {/* {answer && <div className='text-xs text-neutral-700 mt-1' contentEditable suppressContentEditableWarning>{answer}</div>} */}
                    </div>
                )}
            </div>
        </ReportPageSection>
    )
}