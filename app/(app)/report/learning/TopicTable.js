'use client'

import { useState } from 'react'
import { CircleHelp, KeyRound, Library, X } from 'lucide-react'
import Button from '@/components/Button'
import SmartText from '@/components/SmartText'
import RatingCell from './RatingCell'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useUser } from '@/utils/store/useUser'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

function HintTooltip({ hint }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button className="text-blue-300 hover:text-blue-500 shrink-0">
                    <CircleHelp size={14} />
                </button>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p className="max-w-xs text-right">{hint}</p>
            </TooltipContent>
        </Tooltip>
    )
}

function SectionWarnings({ warnings }) {
    if (!warnings?.length) return null;
    return (
        <div className="flex flex-col gap-1 mb-2">
            {warnings.map((w, i) => (
                <div key={i} className={`text-xs px-2 py-1 rounded ${
                    w.red
                        ? 'bg-red-100 text-red-600 border border-red-300'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                    {w.message}
                </div>
            ))}
        </div>
    );
}

export default function TopicTable({
    title,
    topics,
    canEdit,
    isStaffMode,
    onUpdate,
    onRemove,
    onAddManual,
    onOpenBank,
    tableType,
    allTopics = [],
    warnings = [],
}) {
    const [confirmIndex, setConfirmIndex] = useState(null);
    const originalUser = useUser(state => state.originalUser);
    const staffName = originalUser ? `${originalUser.user.first_name} ${originalUser.user.last_name}` : '';

    return (
        <div className="mb-6">
            <h3 className="font-bold text-base text-gray-700 mb-2">{title}</h3>
            <SectionWarnings warnings={warnings} />
            <table className="w-full text-right border-collapse">
                <thead>
                    <tr className="border-b-2 border-gray-300 text-sm text-gray-500">
                        <th className="font-semibold pb-1.5 pr-1 w-[20%]">
                            <span className="flex items-center gap-1">
                                נושא
                                <HintTooltip hint="תחום או מקצוע הלימוד. מילה או שתיים, בדומה למקצוע בתעודת בגרות." />
                            </span>
                        </th>
                        <th className="font-semibold pb-1.5 px-1 w-[24%]">
                            <span className="flex items-center gap-1">
                                פירוט
                                <HintTooltip hint="פירוט הנושאים או תתי המיומנויות שמרכיבים את התחום/מקצוע ונלמדו במסגרת בית הספר." />
                            </span>
                        </th>
                        <th className="font-semibold pb-1.5 px-1">
                            <span className="flex items-center gap-1">
                                יישום
                                <HintTooltip hint="האופן בו הידע או המיומנות באו לידי ביטוי, כתבו כאן מה ה'ראיות' שיש לכך שאתם אוחזים בידע/מיומנות. לדוגמה: תוצר פרויקט שלכם, קורס או מבחן שעברתם בתחום, הישג מקצועי או אקדמי." />
                            </span>
                        </th>
                        <th className="font-semibold pb-1.5 px-1 w-[90px] text-center">
                            <span className="flex items-center justify-center gap-1">
                                הערכה עצמית
                                <HintTooltip hint="רמת הידע או הביצוע שהגעת אליה, בהתאם לפירוט שמופיע בשורה" />
                            </span>
                        </th>
                        <th className="font-semibold pb-1.5 px-1 w-[90px] text-center">
                            <span className="flex items-center justify-center gap-1">
                                הערכת צוות
                                <HintTooltip hint="הערכה חיצונית בנוסף להערכה העצמית. חשוב לכלול בהערכה כמה שיותר הערכות חיצוניות, זה בוחן מציאות חשוב מבחינתך, וגם דרך ליצור אמינות גבוה יותר של התעודה בעיני מי שיקרא אותה בעתיד. ניתן להזין הערכת צוות רק במהלך פגישה עם מאסטר/מנטור." />
                            </span>
                        </th>
                        {canEdit && <th className="pb-1.5 w-6" />}
                    </tr>
                </thead>
                <tbody>
                    {topics.map((topic, index) => {
                        const removeBlocked = !isStaffMode && !!topic.staffRating;
                        return (
                        <tr key={index} className="border-b border-dashed border-gray-200 group">
                            <td className="py-2 pr-1 align-top">
                                <div className="flex items-center gap-1">
                                    {topic.keyTopic && (
                                        <KeyRound className="w-3.5 h-3.5 text-gray-400" title="נושא מפתח בחממה" />
                                    )}
                                    <SmartText
                                        text={topic.name}
                                        onEdit={(v) => onUpdate(index, 'name', v)}
                                        editable={canEdit && !topic.locked}
                                        withIcon={canEdit && !topic.locked}
                                        multiline={false}
                                        className="font-semibold text-sm"
                                        placeholder="שם הנושא"
                                    />
                                </div>
                            </td>
                            <td className="py-2 px-1 align-top">
                                <SmartText
                                    text={topic.detail}
                                    onEdit={(v) => onUpdate(index, 'detail', v)}
                                    editable={canEdit}
                                    withIcon={false}
                                    multiline={false}
                                    className="text-sm text-gray-600"
                                    placeholder={allTopics.find(t => t.name === topic.name)?.detail || 'פירוט...'}
                                />
                            </td>
                            <td className="py-2 px-1 align-top">
                                <SmartText
                                    text={topic.application}
                                    onEdit={(v) => onUpdate(index, 'application', v)}
                                    editable={canEdit}
                                    withIcon={false}
                                    multiline={true}
                                    className="text-sm text-gray-600"
                                    placeholder="עדויות ליישום..."
                                />
                            </td>
                            <td className="py-2 px-1 align-top text-center">
                                <RatingCell
                                    rating={topic.rating}
                                    canEdit={canEdit}
                                    onRatingChange={(v) => onUpdate(index, 'rating', v)}
                                />
                            </td>
                            <td className="py-2 px-1 align-top text-center">
                                <RatingCell
                                    rating={topic.staffRating}
                                    canEdit={isStaffMode}
                                    onRatingChange={(v) => {
                                        onUpdate(index, 'staffRating', v);
                                        if (v === null) onUpdate(index, 'staffEvaluatorName', '');
                                        else if (!topic.staffEvaluatorName) onUpdate(index, 'staffEvaluatorName', staffName);
                                    }}
                                    evaluatorName={topic.staffEvaluatorName}
                                    onNameChange={(v) => onUpdate(index, 'staffEvaluatorName', v)}
                                />
                            </td>
                            {canEdit && (
                                <td className="py-2 align-top text-center">
                                    {!topic.locked && (
                                        <button
                                            onClick={() => !removeBlocked && setConfirmIndex(index)}
                                            disabled={removeBlocked}
                                            className={`opacity-0 group-hover:opacity-100 transition-all p-0.5 ${removeBlocked ? 'text-gray-200 cursor-not-allowed' : 'text-gray-300 hover:text-red-400'}`}
                                            title={removeBlocked ? 'צוות יכול להסיר את שורת ההערכה הזו' : 'הסר שורה'}
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
            <div className="flex justify-start items-center mt-3 gap-2">
                <Button data-role="main-new" onClick={() => onOpenBank(tableType)}>
                    <Library className="w-3.5 h-3.5" />
                    הוסף מבנק הנושאים
                </Button>
                <Button onClick={onAddManual}>+ הוסף שורה ידנית</Button>
            </div>

            <ConfirmDialog
                isOpen={confirmIndex !== null}
                message="האם למחוק את השורה?"
                onConfirm={() => { onRemove(confirmIndex); setConfirmIndex(null); }}
                onCancel={() => setConfirmIndex(null)}
            />
        </div>
    );
}
