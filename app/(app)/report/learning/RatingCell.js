'use client'

import { useState, Fragment } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CircleHelp } from 'lucide-react'
import usePopper from '@/components/Popper'
import { RATING_LABELS, RATING_DESCRIPTIONS } from './data'
import RatingBars from './RatingBars'

export default function RatingCell({ rating, canEdit, onRatingChange, evaluatorName, onNameChange }) {
    const [helpMode, setHelpMode] = useState(false);
    const [activeView, setActiveView] = useState(0);
    const [hoveredRow, setHoveredRow] = useState(null);

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
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${helpMode ? 'text-blue-600' : 'text-blue-300 hover:text-blue-500'}`}
                            >
                                <CircleHelp size={16} />
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

                        {/*
                          Three-column grid:
                            col 1 — label      (max-content: sized to the widest label, so bars
                                                always land in the same column regardless of label length)
                            col 2 — bars       (max-content: fixed-size SVG)
                            col 3 — description (1fr: fills remaining space; collapses to 0 when empty)
                          Header cells live inside the same grid, so alignment is exact with no spacer hacks.
                        */}
                        <div
                            className="grid items-center"
                            style={{ gridTemplateColumns: 'max-content max-content 1fr' }}
                        >
                            {/* Column headers — only visible in help mode */}
                            {helpMode && (
                                <>
                                    <div className="pb-1 pr-3 pl-2 border-b border-stone-100" />
                                    <div className="pb-1 px-1 border-b border-stone-100" />
                                    <div className="pb-1 pl-3 border-b border-stone-100 flex gap-4 text-xs font-medium text-stone-400">
                                        {view.columns.map(col => (
                                            <span key={col.key} className="flex-1 text-right">{col.label}</span>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Clear option — spans all columns */}
                            <button
                                className="col-span-full text-right pr-3 pl-2 py-1.5 text-sm hover:bg-stone-50 text-stone-400"
                                onClick={() => { onRatingChange(null); popper.close(); }}
                            >
                                —
                            </button>

                            {/* Rating rows — 3 cells each so columns stay aligned */}
                            {RATING_LABELS.map((label, i) => {
                                const isActive = rating === i + 1;
                                const rowBg = isActive || hoveredRow === i ? 'bg-stone-50' : '';
                                const rowHandlers = {
                                    onMouseEnter: () => setHoveredRow(i),
                                    onMouseLeave: () => setHoveredRow(null),
                                };
                                const rowClick = () => { onRatingChange(i + 1); popper.close(); };
                                return (
                                    <Fragment key={i}>
                                        <button
                                            {...rowHandlers}
                                            onClick={rowClick}
                                            tabIndex={-1}
                                            className={`py-1.5 pr-3 pl-1 flex items-center justify-center ${rowBg}`}
                                        >
                                            <RatingBars rating={i + 1} />
                                        </button>
                                        <button
                                            {...rowHandlers}
                                            onClick={rowClick}
                                            className={`text-right pr-2 pl-2 py-1.5 text-sm whitespace-nowrap ${isActive ? 'font-semibold' : ''} ${rowBg}`}
                                        >
                                            {label}
                                        </button>
                                        {helpMode ? (
                                            <motion.button
                                                {...rowHandlers}
                                                onClick={rowClick}
                                                tabIndex={-1}
                                                className={`py-1.5 pl-3 flex gap-4 text-xs text-stone-500 font-normal ${rowBg}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                {view.columns.map(col => (
                                                    <span key={col.key} className="flex-1 text-right">{col.values[i]}</span>
                                                ))}
                                            </motion.button>
                                        ) : (
                                            <div {...rowHandlers} />
                                        )}
                                    </Fragment>
                                );
                            })}
                        </div>
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
