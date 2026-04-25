import { KeyRound, Library, X } from 'lucide-react'
import Button from '@/components/Button'
import SmartText from '@/components/SmartText'
import RatingCell from './RatingCell'

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
}) {
    const colSpan = canEdit ? 5 : 4;

    return (
        <div className="mb-6">
            <h3 className="font-bold text-base text-gray-700 mb-2">{title}</h3>
            <table className="w-full text-right border-collapse">
                <thead>
                    <tr className="border-b-2 border-gray-300 text-sm text-gray-500">
                        <th className="font-semibold pb-1.5 pr-1 w-[22%]">נושא</th>
                        <th className="font-semibold pb-1.5 px-1 w-[28%]">פירוט</th>
                        <th className="font-semibold pb-1.5 px-1">יישום</th>
                        <th className="font-semibold pb-1.5 px-1 w-[80px] text-center">הערכה</th>
                        {canEdit && <th className="pb-1.5 w-6" />}
                    </tr>
                </thead>
                <tbody>
                    {topics.map((topic, index) => (
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
                                    placeholder="פירוט..."
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
                                    isSelfRated={topic.isSelfRated}
                                    canEdit={canEdit}
                                    isStaffMode={isStaffMode}
                                    onRatingChange={(v) => onUpdate(index, 'rating', v)}
                                    onToggleStar={(v) => onUpdate(index, 'isSelfRated', v)}
                                />
                            </td>
                            {canEdit && (
                                <td className="py-2 align-top text-center">
                                    {!topic.locked && (
                                        <button
                                            onClick={() => onRemove(index)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-0.5"
                                            title="הסר שורה"
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
            <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-2">
                    <Button data-role="main-new" onClick={() => onOpenBank(tableType)}>
                        <Library className="w-3.5 h-3.5" />
                        הוסף מבנק הנושאים
                    </Button>
                    <Button onClick={onAddManual}>+ הוסף שורה ידנית</Button>
                </div>
                <div className="text-xs text-stone-400 text-left">הערכה עצמית, ולא על ידי איש צוות *</div>
            </div>
        </div>
    );
}