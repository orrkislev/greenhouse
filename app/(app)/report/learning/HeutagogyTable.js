import { Library } from 'lucide-react'
import Button from '@/components/Button'
import RatingCell from './RatingCell'

export default function HeutagogyTable({
    title,
    skills,
    canEdit,
    isStaffMode,
    onOpenBank,
    onUpdate,
}) {
    return (
        <div className="mb-6">
            <h3 className="font-bold text-base text-gray-700 mb-2">{title}</h3>
            <table className="w-full text-right border-collapse">
                <thead>
                    <tr className="border-b-2 border-gray-300 text-sm text-gray-500">
                        <th className="font-semibold pb-1.5 pr-1 w-[30%]">מיומנות</th>
                        <th className="font-semibold pb-1.5 px-1">פירוט</th>
                        <th className="font-semibold pb-1.5 px-1 w-[80px] text-center">הערכה</th>
                    </tr>
                </thead>
                <tbody>
                    {skills.map((skill, index) => (
                        <tr key={index} className="border-b border-dashed border-gray-200">
                            <td className="py-2 pr-1 align-top">
                                {canEdit ? (
                                    <Button onClick={() => onOpenBank(index)}>
                                        <Library className="w-3.5 h-3.5" />
                                        {skill.name || 'בחר מיומנות'}
                                    </Button>
                                ) : (
                                    <span className="font-semibold text-sm">{skill.name || '—'}</span>
                                )}
                            </td>
                            <td className="py-2 px-1 align-top text-sm text-gray-600">
                                {skill.detail || '—'}
                            </td>
                            <td className="py-2 px-1 align-top text-center">
                                <RatingCell
                                    rating={skill.rating}
                                    isSelfRated={skill.isSelfRated}
                                    canEdit={canEdit && !!skill.name}
                                    isStaffMode={isStaffMode}
                                    onRatingChange={(v) => onUpdate(index, 'rating', v)}
                                    onToggleStar={(v) => onUpdate(index, 'isSelfRated', v)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-3 text-xs text-stone-400 text-left">הערכה עצמית, ולא על ידי איש צוות *</div>
        </div>
    );
}