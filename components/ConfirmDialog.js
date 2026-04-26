'use client'

import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-[2px] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                >
                    <div className="fixed inset-0" onClick={onCancel} />
                    <motion.div
                        className="relative bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4 text-right"
                        initial={{ y: 10, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 10, opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                    >
                        <p className="text-sm text-stone-700 mb-5">{message}</p>
                        <div className="flex gap-2 justify-start">
                            <button
                                onClick={onConfirm}
                                className="px-4 py-1.5 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                                מחיקה
                            </button>
                            <button
                                onClick={onCancel}
                                className="px-4 py-1.5 rounded-lg text-sm text-stone-500 hover:bg-stone-100 transition-colors"
                            >
                                ביטול
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
