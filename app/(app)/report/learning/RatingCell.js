'use client'

import { useEffect, useRef, useState } from 'react'
import { RATING_LABELS } from '../topicBank'
import RatingBars from './RatingBars'

export default function RatingCell({
    rating,
    isSelfRated,
    canEdit,
    isStaffMode,
    onRatingChange,
    onToggleStar,
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;

        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="flex items-center gap-1 justify-center" ref={ref}>
            <div className="relative">
                <button
                    onClick={() => canEdit && setOpen((prev) => !prev)}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                    title={rating ? RATING_LABELS[rating - 1] : 'לא הוגדר'}
                >
                    <RatingBars rating={rating} />
                    {RATING_LABELS[rating - 1]}
                </button>
                {open && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-50 min-w-[130px] overflow-hidden">
                        <button
                            className="w-full text-right px-3 py-1.5 text-sm hover:bg-stone-50 text-stone-400"
                            onClick={() => {
                                onRatingChange(null);
                                setOpen(false);
                            }}
                        >
                            —
                        </button>
                        {RATING_LABELS.map((label, i) => (
                            <button
                                key={i}
                                className={`w-full text-right px-3 py-1.5 text-sm hover:bg-stone-50 flex items-center justify-between gap-2 ${rating === i + 1 ? 'font-semibold bg-stone-50' : ''}`}
                                onClick={() => {
                                    onRatingChange(i + 1);
                                    setOpen(false);
                                }}
                            >
                                <span>{label}</span>
                                <RatingBars rating={i + 1} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {rating &&
                (isSelfRated ? (
                    <button
                        className={`text-base font-bold leading-none text-stone-500 ${isStaffMode ? 'cursor-pointer hover:text-red-400' : 'cursor-default'}`}
                        onClick={() => isStaffMode && onToggleStar(false)}
                        title={isStaffMode ? 'לחץ לאישור הערכה חיצונית (הסרת כוכבית)' : 'הערכה עצמית'}
                    >
                        *
                    </button>
                ) : isStaffMode ? (
                    <button
                        className="text-base font-bold leading-none text-stone-300 cursor-pointer hover:text-stone-500"
                        onClick={() => onToggleStar(true)}
                        title="החזר כוכבית (סמן כהערכה עצמית)"
                    >
                        *
                    </button>
                ) : null)}
        </div>
    );
}