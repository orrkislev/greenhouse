'use client'
import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X, Search, Plus, Check, ChevronDown, ChevronLeft } from 'lucide-react'
import Button from '@/components/Button'

// ── Tree helpers ──────────────────────────────────────────────────────────────

function buildTree(topics) {
    const map = {};
    topics.forEach(t => (map[t.id] = { ...t, children: [] }));
    const roots = [];
    topics.forEach(t => {
        if (t.parent_id && map[t.parent_id]) {
            map[t.parent_id].children.push(map[t.id]);
        } else if (!t.parent_id) {
            roots.push(map[t.id]);
        }
    });
    const sortByPosition = nodes => {
        nodes.sort((a, b) => a.position - b.position);
        nodes.forEach(n => sortByPosition(n.children));
        return nodes;
    };
    return sortByPosition(roots);
}

// ── TopicRow ──────────────────────────────────────────────────────────────────

function TopicRow({ node, depth, expandedIds, onToggle, recentlyAdded, onAdd }) {
    const isCategory = node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const added = recentlyAdded.has(node.id);
    const indent = depth * 16;

    return (
        <>
            <div
                style={{ paddingRight: `${indent + 8}px` }}
                className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                    added ? 'bg-green-50' : 'hover:bg-stone-50'
                }`}
            >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {isCategory ? (
                        <button
                            onClick={() => onToggle(node.id)}
                            className="shrink-0 text-stone-400 hover:text-stone-600"
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronLeft className="w-3.5 h-3.5" />
                            )}
                        </button>
                    ) : (
                        <span className="w-3.5 shrink-0" />
                    )}
                    <span className="min-w-0">
                        <span className={isCategory ? 'font-bold' : 'font-medium'}>
                            {node.name}
                        </span>
                        {node.detail && (
                            <span className="text-stone-500"> — {node.detail}</span>
                        )}
                    </span>
                </div>
                <button
                    onClick={() => onAdd(node)}
                    className="shrink-0 p-0.5 rounded hover:bg-stone-200 transition-colors"
                    title="הוסף נושא"
                >
                    {added ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : (
                        <Plus className="w-4 h-4 text-stone-400" />
                    )}
                </button>
            </div>
            {isCategory && isExpanded &&
                node.children.map(child => (
                    <TopicRow
                        key={child.id}
                        node={child}
                        depth={depth + 1}
                        expandedIds={expandedIds}
                        onToggle={onToggle}
                        recentlyAdded={recentlyAdded}
                        onAdd={onAdd}
                    />
                ))
            }
        </>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function TopicBankModal({
    isOpen,
    onClose,
    onAddTopic,
    defaultTable = 'professional',
    userMajor,
    allTopics = [],
    heutagogyMajorId,
}) {
    const [search, setSearch] = useState('');
    const [activeMajorId, setActiveMajorId] = useState(null); // null = "כולם"
    const [targetTable, setTargetTable] = useState(defaultTable);
    const [recentlyAdded, setRecentlyAdded] = useState(new Set());
    const [expandedIds, setExpandedIds] = useState(new Set());

    // ── Derived data ──────────────────────────────────────────────────────────
    const majors = useMemo(
        () => allTopics
            .filter(t => !t.parent_id && t.id !== heutagogyMajorId)
            .sort((a, b) => a.position - b.position),
        [allTopics, heutagogyMajorId]
    );

    const generalMajor = useMemo(
        () => majors.find(m => m.name === 'כללי'),
        [majors]
    );

    const fullTree = useMemo(() => buildTree(allTopics.filter(t => t.id !== heutagogyMajorId && t.parent_id !== heutagogyMajorId)), [allTopics, heutagogyMajorId]);

    // ── Reset on open ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        setSearch('');
        setRecentlyAdded(new Set());

        const table = defaultTable;
        setTargetTable(table);

        if (table === 'general') {
            setActiveMajorId(generalMajor?.id ?? null);
        } else {
            const matchedMajor = majors.find(m => m.name === userMajor);
            setActiveMajorId(matchedMajor?.id ?? null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Auto-expand level-2 nodes when major selection changes
    useEffect(() => {
        const newExpanded = new Set();
        const relevantMajors = activeMajorId
            ? [fullTree.find(m => m.id === activeMajorId)].filter(Boolean)
            : fullTree;

        relevantMajors.forEach(major => {
            major.children.forEach(cat => newExpanded.add(cat.id));
        });
        setExpandedIds(newExpanded);
    }, [activeMajorId, fullTree]);

    // ── Filter by target table ────────────────────────────────────────────────
    const visibleTree = useMemo(() => {
        if (targetTable === 'general') {
            return generalMajor ? fullTree.filter(m => m.id === generalMajor.id) : [];
        }
        return fullTree.filter(m => m.id !== generalMajor?.id);
    }, [fullTree, targetTable, generalMajor]);

    const displayedTree = useMemo(() => {
        if (activeMajorId) {
            return visibleTree.filter(m => m.id === activeMajorId);
        }
        return visibleTree;
    }, [visibleTree, activeMajorId]);

    // ── Search: flat filtered list ────────────────────────────────────────────
    const q = search.trim().toLowerCase();
    const searchResults = useMemo(() => {
        if (!q) return null;
        const pool = allTopics.filter(t => t.id !== heutagogyMajorId && t.parent_id !== heutagogyMajorId);
        return pool.filter(t =>
            t.name.toLowerCase().includes(q) || t.detail.toLowerCase().includes(q)
        ).filter(t => {
            if (targetTable === 'general') {
                // walk up to check major
                let cur = t;
                while (cur.parent_id) cur = allTopics.find(x => x.id === cur.parent_id) || cur;
                return cur.id === generalMajor?.id;
            } else {
                let cur = t;
                while (cur.parent_id) cur = allTopics.find(x => x.id === cur.parent_id) || cur;
                return cur.id !== generalMajor?.id;
            }
        });
    }, [q, allTopics, heutagogyMajorId, targetTable, generalMajor]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const toggleExpand = (id) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleTargetTableChange = (newTable) => {
        setTargetTable(newTable);
        setActiveMajorId(newTable === 'general' ? (generalMajor?.id ?? null) : null);
    };

    const handleAdd = (node) => {
        onAddTopic({ name: node.name, detail: node.detail }, targetTable);
        setRecentlyAdded(prev => new Set([...prev, node.id]));
        setTimeout(() => {
            setRecentlyAdded(prev => { const n = new Set(prev); n.delete(node.id); return n; });
        }, 1500);
    };

    const majorTabs = targetTable === 'general'
        ? (generalMajor ? [generalMajor] : [])
        : majors.filter(m => m.id !== generalMajor?.id);

    if (typeof window === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-[2px] flex justify-center items-center"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                                    placeholder="חיפוש לפי שם נושא או פירוט..."
                                    className="w-full pr-9 pl-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Major tabs — hidden during search */}
                        {!q && (
                            <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
                                {targetTable !== 'general' && (
                                    <button
                                        onClick={() => setActiveMajorId(null)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                            activeMajorId === null
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        }`}
                                    >
                                        כולם
                                    </button>
                                )}
                                {majorTabs.map(major => (
                                    <button
                                        key={major.id}
                                        onClick={() => setActiveMajorId(major.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                            activeMajorId === major.id
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        }`}
                                    >
                                        {major.name}
                                    </button>
                                ))}
                            </div>
                        )}

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

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-4 py-3">
                            {/* Search results: flat list */}
                            {q && (
                                searchResults.length === 0 ? (
                                    <div className="text-center text-stone-400 py-8 text-sm">לא נמצאו נושאים מתאימים</div>
                                ) : (
                                    <div className="space-y-0.5">
                                        {searchResults.map(t => {
                                            const added = recentlyAdded.has(t.id);
                                            return (
                                                <div
                                                    key={t.id}
                                                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                        added ? 'bg-green-50' : 'hover:bg-stone-50'
                                                    }`}
                                                >
                                                    <span>
                                                        <span className="font-medium">{t.name}</span>
                                                        {t.detail && <span className="text-stone-500"> — {t.detail}</span>}
                                                    </span>
                                                    <button onClick={() => handleAdd(t)} className="shrink-0 p-0.5 rounded hover:bg-stone-200">
                                                        {added ? <Check className="w-4 h-4 text-green-500" /> : <Plus className="w-4 h-4 text-stone-400" />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            )}

                            {/* Tree view */}
                            {!q && (
                                displayedTree.length === 0 ? (
                                    <div className="text-center text-stone-400 py-8 text-sm">אין נושאים להצגה</div>
                                ) : (
                                    <div className="space-y-3">
                                        {displayedTree.map(major => (
                                            <div key={major.id}>
                                                {/* Show major name as section header only in "כולם" mode */}
                                                {activeMajorId === null && (
                                                    <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1 px-2">{major.name}</div>
                                                )}
                                                <div className="space-y-0.5">
                                                    {major.children.map(cat => (
                                                        <TopicRow
                                                            key={cat.id}
                                                            node={cat}
                                                            depth={0}
                                                            expandedIds={expandedIds}
                                                            onToggle={toggleExpand}
                                                            recentlyAdded={recentlyAdded}
                                                            onAdd={handleAdd}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
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
