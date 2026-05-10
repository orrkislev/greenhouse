'use client'

import { useState } from 'react'
import { Library, X } from 'lucide-react'
import Button from '@/components/Button'
import SmartText from '@/components/SmartText'
import RatingCell from './RatingCell'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useUser } from '@/utils/store/useUser'

export default function HeutagogyTable({
    title,
    skills,
    canEdit,
    isStaffMode,
    onOpenBank,
    onUpdate,
    onClear,
}) {
    const [confirmIndex, setConfirmIndex] = useState(null);
    const originalUser = useUser(state => state.originalUser);
    const staffName = originalUser ? `${originalUser.user.first_name} ${originalUser.user.last_name}` : '';

    return (
        <div className="mb-6">
            <h3 className="font-bold text-base text-gray-700 mb-2">{title}</h3>
            <table className="w-full text-right border-collapse">
                <thead>
                    <tr className="border-b-2 border-gray-300 text-sm text-gray-500">
                        <th className="font-semibold pb-1.5 pr-1 w-[28%]">מיומנות</th>
                        <th className="font-semibold pb-1.5 px-1">פירוט</th>
                        <th className="font-semibold pb-1.5 px-1 w-[90px] text-center">הערכה עצמית</th>
                        <th className="font-semibold pb-1.5 px-1 w-[90px] text-center">הערכת צוות</th>
                        {canEdit && <th className="pb-1.5 w-6" />}
                    </tr>
                </thead>
                <tbody>
                    {skills.map((skill, index) => {
                        const clearBlocked = !isStaffMode && !!skill.staffRating;
                        return (
                        <tr key={index} className="border-b border-dashed border-gray-200 group">
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
                            <td className="py-2 px-1 align-top">
                                <SmartText
                                    text={skill.detail}
                                    onEdit={(v) => onUpdate(index, 'detail', v)}
                                    editable={canEdit && !!skill.name}
                                    withIcon={false}
                                    multiline={false}
                                    className="text-sm text-gray-600"
                                    placeholder="פירוט..."
                                />
                            </td>
                            <td className="py-2 px-1 align-top text-center">
                                <RatingCell
                                    rating={skill.rating}
                                    canEdit={canEdit && !!skill.name}
                                    onRatingChange={(v) => onUpdate(index, 'rating', v)}
                                />
                            </td>
                            <td className="py-2 px-1 align-top text-center">
                                <RatingCell
                                    rating={skill.staffRating}
                                    canEdit={isStaffMode}
                                    onRatingChange={(v) => {
                                        onUpdate(index, 'staffRating', v);
                                        if (v === null) onUpdate(index, 'staffEvaluatorName', '');
                                        else if (!skill.staffEvaluatorName) onUpdate(index, 'staffEvaluatorName', staffName);
                                    }}
                                    evaluatorName={skill.staffEvaluatorName}
                                    onNameChange={(v) => onUpdate(index, 'staffEvaluatorName', v)}
                                />
                            </td>
                            {canEdit && (
                                <td className="py-2 align-top text-center">
                                    {skill.name && (
                                        <button
                                            onClick={() => !clearBlocked && setConfirmIndex(index)}
                                            disabled={clearBlocked}
                                            className={`opacity-0 group-hover:opacity-100 transition-all p-0.5 ${clearBlocked ? 'text-gray-200 cursor-not-allowed' : 'text-gray-300 hover:text-red-400'}`}
                                            title={clearBlocked ? 'צוות יכול להסיר את שורת ההערכה הזו' : 'נקה שורה'}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                        );
                    })}
                </tbody>
            </table>

            <ConfirmDialog
                isOpen={confirmIndex !== null}
                message="האם לנקות את השורה?"
                onConfirm={() => { onClear(confirmIndex); setConfirmIndex(null); }}
                onCancel={() => setConfirmIndex(null)}
            />
        </div>
    );
}
