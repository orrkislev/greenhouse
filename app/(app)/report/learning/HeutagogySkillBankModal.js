'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Plus, Search, X } from 'lucide-react'
import Button from '@/components/Button'
import { HEUTAGOGY_SKILLS_BANK } from '../topicBank'

export default function HeutagogySkillBankModal({
    isOpen,
    onClose,
    onSelect,
    selectedNames,
    currentName,
}) {
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSearch('');
        }
    }, [isOpen]);

    const filteredSkills = useMemo(() => {
        const q = search.trim().toLowerCase();
        return HEUTAGOGY_SKILLS_BANK.filter((skill) => {
            if (!q) return true;
            return (
                skill.name.toLowerCase().includes(q) ||
                skill.detail.toLowerCase().includes(q)
            );
        });
    }, [search]);

    if (typeof window === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-[2px] flex justify-center items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="fixed inset-0" onClick={onClose} />
                    <motion.div
                        className="relative bg-white rounded-xl border border-stone-200 shadow-xl w-[620px] max-w-[95vw] max-h-[85vh] flex flex-col"
                        initial={{ y: 20, opacity: 0, scale: 0.97 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        dir="rtl"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-stone-200">
                            <h2 className="font-bold text-lg">בנק מיומנויות יוטגוגיות</h2>
                            <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="px-4 pt-3 pb-2">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="חיפוש מיומנות..."
                                    className="w-full pr-9 pl-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="px-4 pb-2 text-xs text-stone-500 border-b border-stone-100">
                            יש לבחור 5 מיומנויות שונות, ללא כפילויות.
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
                            {filteredSkills.length === 0 ? (
                                <div className="text-center text-stone-400 py-8 text-sm">לא נמצאו מיומנויות</div>
                            ) : (
                                filteredSkills.map((skill, i) => {
                                    const isTaken = selectedNames.includes(skill.name) && skill.name !== currentName;
                                    return (
                                        <button
                                            key={i}
                                            disabled={isTaken}
                                            onClick={() => {
                                                onSelect(skill);
                                                onClose();
                                            }}
                                            className={`w-full text-right flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors border ${
                                                isTaken
                                                    ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
                                                    : 'border-transparent hover:bg-stone-50 hover:border-stone-200'
                                            }`}
                                        >
                                            <span>
                                                <span className="font-medium">{skill.name}</span>
                                                <span className="text-stone-500"> — {skill.detail}</span>
                                            </span>
                                            {isTaken ? (
                                                <Check className="w-4 h-4 text-stone-300 shrink-0" />
                                            ) : (
                                                <Plus className="w-4 h-4 text-stone-400 shrink-0" />
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        <div className="px-4 py-3 border-t border-stone-100 flex justify-end">
                            <Button data-role="close" onClick={onClose}>סגור</Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}