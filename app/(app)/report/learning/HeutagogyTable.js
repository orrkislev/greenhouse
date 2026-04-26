'use client'

import { useState } from 'react'
import { Library, X } from 'lucide-react'
import Button from '@/components/Button'
import SmartText from '@/components/SmartText'
import RatingCell from './RatingCell'
import StaffRatingCell from './StaffRatingCell'
import ConfirmDialog from '@/components/ConfirmDialog'

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
                    {skills.map((skill, index) => (
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
                                <StaffRatingCell
                                    staffRating={skill.staffRating}
                                    staffEvaluatorName={skill.staffEvaluatorName}
                                    isStaffMode={isStaffMode}
                                    onRatingChange={(v) => onUpdate(index, 'staffRating', v)}
                                    onNameChange={(v) => onUpdate(index, 'staffEvaluatorName', v)}
                                />
                            </td>
                            {canEdit && (
                                <td className="py-2 align-top text-center">
                                    {skill.name && (
                                        <button
                                            onClick={() => setConfirmIndex(index)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-0.5"
                                            title="נקה שורה"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
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
