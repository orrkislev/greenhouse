import { ReportPageSection } from "./Layout";

function RatingBars({ rating, isSelf }) {
    const barW = 4; const barGap = 2; const maxH = 14;
    const totalW = 5 * barW + 4 * barGap;
    const barsHeight = [4, 8, 12, 8, 4];
    const filledColor = isSelf ? '#909090' : '#1c1917';
    return (
        <svg width={totalW} height={maxH} viewBox={`0 0 ${totalW} ${maxH}`} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            {[1, 2, 3, 4, 5].map(i => {
                const barH = barsHeight[i - 1];
                const x = (5 - i) * (barW + barGap); // RTL: i=1 rightmost
                const y = maxH / 2 - barH / 2;
                const filled = rating && rating >= i;
                return <rect key={i} x={x} y={y} width={barW} height={barH} fill={filled ? filledColor : '#e7e5e4'} rx={1} />;
            })}
        </svg>
    );
}

const KEY_ICON = '🔑';

function HeutagogyTable({ skills }) {
    const visible = skills?.filter(s => s.name) || [];
    if (visible.length === 0) return null;
    const hasAnySelf = visible.some(s => !s.staffRating && !!s.rating);
    return (
        <div className="mt-4">
            <div className="font-bold text-[9pt] mb-1 text-neutral-500">מיומנויות יוטגוגיות</div>
            <table className='w-full table-fixed text-right'>
                <thead className='border-b border-neutral-600'>
                    <tr>
                        <th className='font-bold pb-1 w-[28%] text-[8pt]'>מיומנות</th>
                        <th className='font-bold pb-1 text-[8pt]'>פירוט</th>
                        <th className='font-bold pb-1 w-[5em] text-center text-[8pt]'>הערכה</th>
                    </tr>
                </thead>
                <tbody>
                    {visible.map((skill, index) => {
                        const r = skill.staffRating || skill.rating;
                        const isSelf = !skill.staffRating && !!skill.rating;
                        return (
                            <tr key={index} className='border-b border-dashed border-neutral-300'>
                                <td className='p-1 align-top font-semibold text-[8pt]'>{skill.name}</td>
                                <td className='p-1 align-top text-neutral-700 text-[8pt]'>{skill.detail}</td>
                                <td className='p-1 align-top text-center text-[8pt]'>
                                    {r ? (
                                        <span className="flex items-center gap-1 justify-center">
                                            <RatingBars rating={r} isSelf={isSelf} />
                                            <span className={`font-bold ${isSelf ? '' : 'invisible'}`}>*</span>
                                        </span>
                                    ) : '—'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {hasAnySelf && (
                <div className="text-[7pt] text-neutral-500 mt-3">* הערכה המסומנת בכוכבית היא הערכה עצמית.</div>
            )}
        </div>
    );
}

function TopicTable({ title, topics }) {
    const visibleTopics = topics?.filter(t => t.name) || [];
    if (visibleTopics.length === 0) return null;
    return (
        <div className="mb-4">
            <div className="font-bold text-[9pt] mb-1 text-neutral-500">{title}</div>
            <table className='w-full table-fixed text-right'>
                <thead className='border-b border-neutral-600'>
                    <tr>
                        <th className='font-bold pb-1 w-[28%] text-[8pt]'>נושא</th>
                        <th className='font-bold pb-1 text-[8pt]'>פירוט</th>
                        <th className='font-bold pb-1 w-[22%] text-[8pt]'>יישום</th>
                        <th className='font-bold pb-1 w-[5em] text-center text-[8pt]'>הערכה</th>
                    </tr>
                </thead>
                <tbody>
                    {visibleTopics.map((topic, index) => (
                        <tr key={index} className='border-b border-dashed border-neutral-300'>
                            <td className='p-1 align-top font-semibold text-[8pt]' contentEditable suppressContentEditableWarning>
                                {topic.keyTopic && <span className="mr-0.5">{KEY_ICON}</span>}
                                {topic.name}
                            </td>
                            <td className='p-1 align-top text-neutral-700 text-[8pt]' contentEditable suppressContentEditableWarning>
                                {topic.detail}
                            </td>
                            <td className='p-1 align-top text-neutral-700 text-[8pt]' contentEditable suppressContentEditableWarning>
                                {topic.application}
                            </td>
                            <td className='p-1 align-top text-center text-[8pt]'>
                                {(() => {
                                    const r = topic.staffRating || topic.rating;
                                    const isSelf = !topic.staffRating && !!topic.rating;
                                    return r ? (
                                        <span className="flex items-center gap-1 justify-center">
                                            <RatingBars rating={r} isSelf={isSelf} />
                                            <span className={`font-bold ${isSelf ? '' : 'invisible'}`}>*</span>
                                        </span>
                                    ) : '—';
                                })()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function Report_Learning({ student }) {
    const learning = student.learning;

    // support both old and new data structures
    const professionalTopics = learning?.professionalTopics ?? null;
    const generalTopics = learning?.generalTopics ?? null;
    const heutagogySkills = learning?.heutagogySkills ?? null;

    // fallback for old structure
    const oldTopics = learning?.topics?.filter(t => t.name) || [];
    const isOldStructure = professionalTopics === null && oldTopics.length > 0;

    return (
        <ReportPageSection title="למידה" className="flex-2">
            <div className='h-full flex flex-col'>
                {isOldStructure ? (
                    <table className='w-full text-right mb-4'>
                        <thead className='border-b border-neutral-600'>
                            <tr>
                                <th className='font-bold pb-1 min-w-[8em]'>נושא הלמידה</th>
                                <th className='font-bold pb-1 min-w-[10em]'>מה למדתי</th>
                                <th className='font-bold pb-1'>איך למדתי</th>
                            </tr>
                        </thead>
                        <tbody>
                            {oldTopics.map((topic, index) => (
                                <tr key={index} className='border-b border-dashed border-neutral-400'>
                                    <td className='font-bold p-1 align-top' contentEditable suppressContentEditableWarning>{topic.name}</td>
                                    <td className='p-1 align-top' contentEditable suppressContentEditableWarning>
                                        <ul className='list-disc list-inside'>
                                            {topic.learnings?.filter(l => l).map((l, i) => <li key={i}>{l}</li>)}
                                        </ul>
                                    </td>
                                    <td className='text-neutral-700 p-1 align-top' contentEditable suppressContentEditableWarning>{topic.howLearned}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <>
                        <TopicTable title="נושאים מקצועיים" topics={professionalTopics} />
                        <TopicTable title="למידה כללית" topics={generalTopics} />
                        <HeutagogyTable skills={heutagogySkills} />
                    </>
                )}
            </div>
        </ReportPageSection>
    );
}
