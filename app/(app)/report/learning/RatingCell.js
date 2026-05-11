'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import usePopper from '@/components/Popper'
import { RATING_LABELS, RATING_DESCRIPTIONS } from './data'
import RatingBars from './RatingBars'

export default function RatingCell({ rating, canEdit, onRatingChange, evaluatorName, onNameChange }) {
    const [helpMode, setHelpMode] = useState(false);
    const [activeView, setActiveView] = useState(0);

    const popper = usePopper({
        onOpen: () => {},
        onClose: () => { setHelpMode(false); setActiveView(0); },
    });
    const isStaff = !!onNameChange;

    if (isStaff && !canEdit && !rating) {
        return <span className="text-gray-300">—</span>;
    }

    const view = RATING_DESCRIPTIONS[activeView];

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
                    <div className="max-w-[620px] overflow-x-auto">
                        {/* Help toggle + view selectors */}
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={() => setHelpMode(h => !h)}
                                className={`text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${helpMode ? 'bg-stone-200 text-stone-700' : 'text-stone-400 hover:bg-stone-100'}`}
                            >
                                ?
                            </button>
                            <AnimatePresence>
                                {helpMode && (
                                    <motion.div
                                        className="flex gap-1"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {RATING_DESCRIPTIONS.map((v, i) => (
                                            <button
                                                key={v.key}
                                                onClick={() => setActiveView(i)}
                                                className={`text-xs px-2 py-0.5 rounded transition-colors ${activeView === i ? 'bg-stone-200 font-medium' : 'text-stone-500 hover:bg-stone-100'}`}
                                            >
                                                {v.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Column headers aligned with description cells */}
                        {helpMode && (
                            <div className="flex items-center gap-3 px-3 py-1 text-xs font-medium text-stone-400 border-b border-stone-100 mb-1">
                                {/* Invisible spacer matching the width of the label+bars group */}
                                <span className="flex items-center gap-2 shrink-0 invisible select-none" aria-hidden>
                                    <span>{RATING_LABELS[4]}</span>
                                    <RatingBars rating={5} />
                                </span>
                                <div className="flex-1 flex gap-4">
                                    {view.columns.map(col => (
                                        <span key={col.key} className="flex-1 text-right">{col.label}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Clear option */}
                        <button
                            className="w-full text-right px-3 py-1.5 text-sm hover:bg-stone-50 text-stone-400"
                            onClick={() => { onRatingChange(null); popper.close(); }}
                        >
                            —
                        </button>

                        {/* Rating rows */}
                        {RATING_LABELS.map((label, i) => (
                            <button
                                key={i}
                                className={`w-full text-right px-3 py-1.5 text-sm hover:bg-stone-50 flex items-center gap-3 ${rating === i + 1 ? 'font-semibold bg-stone-50' : ''}`}
                                onClick={() => { onRatingChange(i + 1); popper.close(); }}
                            >
                                {/* Label + bars — anchored to the right in RTL */}
                                <span className="flex items-center gap-2 shrink-0">
                                    <span>{label}</span>
                                    <RatingBars rating={i + 1} />
                                </span>
                                {/* Description columns — slide in to the left in RTL */}
                                <AnimatePresence>
                                    {helpMode && (
                                        <motion.span
                                            className="flex-1 flex gap-4"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            {view.columns.map(col => (
                                                <span key={col.key} className="flex-1 text-right text-xs text-stone-500 font-normal">
                                                    {col.values[i]}
                                                </span>
                                            ))}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        ))}
                    </div>
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
