'use client'

import usePopper from '@/components/Popper'
import { RATING_LABELS } from './data'
import RatingBars from './RatingBars'

export default function RatingCell({ rating, canEdit, onRatingChange, evaluatorName, onNameChange }) {
    const popper = usePopper({ onOpen: () => {}, onClose: () => {} });
    const isStaff = !!onNameChange;

    if (isStaff && !canEdit && !rating) {
        return <span className="text-gray-300">—</span>;
    }

    return (
        <div className={isStaff ? "flex flex-col items-center gap-1" : "flex items-center justify-center"}>
            <div>
                <button
                    ref={popper.baseRef}
                    onClick={() => canEdit && popper.open()}
                    className={`flex items-center gap-2 transition-opacity ${canEdit ? 'cursor-pointer hover:opacity-70' : 'cursor-default'}`}
                    title={rating ? RATING_LABELS[rating - 1] : 'לא הוגדר'}
                >
                    <RatingBars rating={rating} />
                    {RATING_LABELS[rating - 1]}
                </button>
                <popper.Popper className="flex justify-center items-center">
                    <>
                        <button
                            className="w-full text-right px-3 py-1.5 text-sm hover:bg-stone-50 text-stone-400"
                            onClick={() => { onRatingChange(null); popper.close(); }}
                        >
                            —
                        </button>
                        {RATING_LABELS.map((label, i) => (
                            <button
                                key={i}
                                className={`w-full text-right px-3 py-1.5 text-sm hover:bg-stone-50 flex items-center justify-between gap-2 ${rating === i + 1 ? 'font-semibold bg-stone-50' : ''}`}
                                onClick={() => { onRatingChange(i + 1); popper.close(); }}
                            >
                                <span>{label}</span>
                                <RatingBars rating={i + 1} />
                            </button>
                        ))}
                    </>
                </popper.Popper>
            </div>
            {isStaff && canEdit && (popper.isOpen || evaluatorName) && (
                <input
                    type="text"
                    value={evaluatorName || ''}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="שם המעריך"
                    className="text-xs text-center border-b border-dashed border-gray-300 outline-none w-full max-w-[80px] bg-transparent placeholder:text-gray-300"
                />
            )}
            {isStaff && !canEdit && evaluatorName && (
                <span className="text-xs text-gray-400">{evaluatorName}</span>
            )}
        </div>
    );
}
