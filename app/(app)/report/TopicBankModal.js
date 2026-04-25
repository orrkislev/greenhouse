'use client'
import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X, Search, Plus, Check } from 'lucide-react'
import Button from '@/components/Button'
import { TOPIC_BANK, MAJORS } from './topicBank'

export default function TopicBankModal({ isOpen, onClose, onAddTopic, defaultTable = 'professional', userMajor }) {
    const [search, setSearch] = useState('');
    const [activeMajor, setActiveMajor] = useState('כולם');
    const [targetTable, setTargetTable] = useState(defaultTable);
    const [recentlyAdded, setRecentlyAdded] = useState(new Set());

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setTargetTable(defaultTable);
            setRecentlyAdded(new Set());
            // default to user's major tab if it exists in our bank
            if (userMajor && MAJORS.includes(userMajor)) {
                setActiveMajor(userMajor);
            } else {
                setActiveMajor('כולם');
            }
        }
    }, [isOpen, defaultTable, userMajor]);

    const filteredTopics = useMemo(() => {
        return TOPIC_BANK.filter(topic => {
            const matchesMajor = activeMajor === 'כולם' || topic.major === activeMajor;
            const q = search.trim().toLowerCase();
            const matchesSearch = !q || topic.name.toLowerCase().includes(q) || topic.detail.toLowerCase().includes(q) || topic.category.toLowerCase().includes(q);
            
            // Filter by target table: professional shows non-general, general shows only כללי
            const matchesTable = targetTable === 'professional' ? topic.major !== 'כללי' : topic.major === 'כללי';
            
            return matchesMajor && matchesSearch && matchesTable;
        });
    }, [activeMajor, search, targetTable]);

    const groupedTopics = useMemo(() => {
        const groups = {};
        filteredTopics.forEach(topic => {
            const key = (activeMajor === 'כולם' && targetTable === 'professional') ? `${topic.major} — ${topic.category}` : topic.category;
            if (!groups[key]) groups[key] = [];
            groups[key].push(topic);
        });
        return groups;
    }, [filteredTopics, activeMajor, targetTable]);

    const handleTargetTableChange = (newTable) => {
        setTargetTable(newTable);
        // When switching to general, set activeMajor to כללי
        if (newTable === 'general') {
            setActiveMajor('כללי');
        } else {
            // When switching to professional, reset to user's major or 'כולם'
            if (userMajor && MAJORS.includes(userMajor)) {
                setActiveMajor(userMajor);
            } else {
                setActiveMajor('כולם');
            }
        }
    };

    const majorTabs = targetTable === 'general' ? ['כללי'] : ['כולם', ...MAJORS];

    const handleAdd = (topic) => {
        onAddTopic(topic, targetTable);
        const key = `${topic.major}-${topic.category}-${topic.name}-${topic.detail}`;
        setRecentlyAdded(prev => new Set([...prev, key]));
        setTimeout(() => {
            setRecentlyAdded(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }, 1500);
    };

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
                        className="relative bg-white rounded-xl border border-stone-200 shadow-xl w-[640px] max-w-[95vw] max-h-[85vh] flex flex-col"
                        initial={{ y: 20, opacity: 0, scale: 0.97 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        dir="rtl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-stone-200">
                            <h2 className="font-bold text-lg">בנק הנושאים</h2>
                            <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-4 pt-3 pb-2">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="חיפוש לפי שם נושא, פירוט או קטגוריה..."
                                    className="w-full pr-9 pl-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Major filter tabs */}
                        <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
                            {majorTabs.map(major => (
                                <button
                                    key={major}
                                    onClick={() => setActiveMajor(major)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        activeMajor === major
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                                >
                                    {major}
                                </button>
                            ))}
                        </div>

                        {/* Target table selector */}
                        <div className="px-4 pb-3 flex items-center gap-4 text-sm border-b border-stone-100">
                            <span className="text-stone-500 shrink-0">הוסף ל:</span>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="targetTable" value="professional" checked={targetTable === 'professional'} onChange={() => handleTargetTableChange('professional')} className="accent-gray-700" />
                                <span className={targetTable === 'professional' ? 'font-semibold' : 'text-stone-600'}>נושאים מקצועיים</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" name="targetTable" value="general" checked={targetTable === 'general'} onChange={() => handleTargetTableChange('general')} className="accent-gray-700" />
                                <span className={targetTable === 'general' ? 'font-semibold' : 'text-stone-600'}>למידה כללית</span>
                            </label>
                        </div>

                        {/* Topic list */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                            {Object.keys(groupedTopics).length === 0 ? (
                                <div className="text-center text-stone-400 py-8 text-sm">לא נמצאו נושאים מתאימים</div>
                            ) : (
                                Object.entries(groupedTopics).map(([category, topics]) => (
                                    <div key={category}>
                                        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">{category}</div>
                                        <div className="space-y-1">
                                            {topics.map((topic, i) => {
                                                const key = `${topic.major}-${topic.category}-${topic.name}-${topic.detail}`;
                                                const added = recentlyAdded.has(key);
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleAdd(topic)}
                                                        className={`w-full text-right flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                            added
                                                                ? 'bg-green-50 border border-green-200'
                                                                : 'hover:bg-stone-50 border border-transparent hover:border-stone-200'
                                                        }`}
                                                    >
                                                        <span>
                                                            <span className="font-medium">{topic.name}</span>
                                                            <span className="text-stone-500"> — {topic.detail}</span>
                                                        </span>
                                                        {added ? (
                                                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                                                        ) : (
                                                            <Plus className="w-4 h-4 text-stone-400 shrink-0" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
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
