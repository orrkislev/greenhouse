'use client'

import usePopper from '@/components/Popper'
import { RATING_LABELS } from '../topicBank'
import RatingBars from './RatingBars'

export default function RatingCell({ rating, canEdit, onRatingChange }) {
    const popper = usePopper({ onOpen: () => {}, onClose: () => {} });

    return (
        <div className="flex items-center justify-center">
            <div>
                <button
                    ref={popper.baseRef}
                    onClick={() => canEdit && popper.open()}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
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
        </div>
    );
}
