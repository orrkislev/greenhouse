'use client'

import usePopper from '@/components/Popper'
import { RATING_LABELS } from './data'
import RatingBars from './RatingBars'
import { useUser } from '@/utils/store/useUser'

export default function StaffRatingCell({
    staffRating,
    staffEvaluatorName,
    isStaffMode,
    onRatingChange,
    onNameChange,
}) {
    const originalUser = useUser(state => state.originalUser);
    const popper = usePopper({ onOpen: () => {}, onClose: () => {} });

    const staffName = originalUser
        ? `${originalUser.user.first_name} ${originalUser.user.last_name}`
        : '';

    const handleRatingChange = (v) => {
        if (v === null) {
            onRatingChange(null);
            onNameChange('');
        } else {
            onRatingChange(v);
            if (!staffEvaluatorName) {
                onNameChange(staffName);
            }
        }
    };

    if (!isStaffMode && !staffRating) {
        return <span className="text-gray-300">—</span>;
    }

    return (
        <div className="flex flex-col items-center gap-1">
            <div>
                <button
                    ref={popper.baseRef}
                    onClick={() => isStaffMode && popper.open()}
                    className={`flex items-center gap-2 transition-opacity ${isStaffMode ? 'cursor-pointer hover:opacity-70' : 'cursor-default'}`}
                    title={staffRating ? RATING_LABELS[staffRating - 1] : 'לא הוגדר'}
                >
                    <RatingBars rating={staffRating} />
                    {RATING_LABELS[staffRating - 1]}
                </button>
                <popper.Popper className="flex justify-center items-center">
                    <>
                        <button
                            className="w-full text-right px-3 py-1.5 text-sm hover:bg-stone-50 text-stone-400"
                            onClick={() => { handleRatingChange(null); popper.close(); }}
                        >
                            —
                        </button>
                        {RATING_LABELS.map((label, i) => (
                            <button
                                key={i}
                                className={`w-full text-right px-3 py-1.5 text-sm hover:bg-stone-50 flex items-center justify-between gap-2 ${staffRating === i + 1 ? 'font-semibold bg-stone-50' : ''}`}
                                onClick={() => { handleRatingChange(i + 1); popper.close(); }}
                            >
                                <span>{label}</span>
                                <RatingBars rating={i + 1} />
                            </button>
                        ))}
                    </>
                </popper.Popper>
            </div>
            {isStaffMode && (popper.isOpen || staffEvaluatorName) ? (
                <input
                    type="text"
                    value={staffEvaluatorName || ''}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder={popper.isOpen ? staffName : ''}
                    className="text-xs text-center border-b border-dashed border-gray-300 outline-none w-full max-w-[80px] bg-transparent placeholder:text-gray-300"
                />
            ) : !isStaffMode && staffEvaluatorName ? (
                <span className="text-xs text-gray-400">{staffEvaluatorName}</span>
            ) : null}
        </div>
    );
}
