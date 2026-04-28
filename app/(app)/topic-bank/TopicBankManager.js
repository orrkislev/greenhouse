'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { toastsActions } from '@/utils/store/useToasts'
import {
    createTopicBankItem,
    updateTopicBankItem,
    deleteTopicBankItem,
    reorderTopicBankItems,
    reparentTopicBankItem,
    reparentAndPositionTopicBankItem,
    promoteTopicBankItem,
    demoteTopicBankItem,
    restoreTopicBankSnapshot,
} from '@/utils/actions/topic bank actions'
import Button from '@/components/Button'
import ConfirmDialog from '@/components/ConfirmDialog'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
    ChevronDown, ChevronLeft, Plus, Pencil, Trash2,
    Outdent, Indent, KeyRound, Check, X, FolderPlus, GripVertical, Undo2,
} from 'lucide-react'

const HEUTAGOGY_MAJOR_NAME = 'מיומנויות יוטגוגיות';

// ── Tree builder ──────────────────────────────────────────────────────────────

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

function getDescendantIds(node) {
    const ids = new Set();
    const walk = (n) => { ids.add(n.id); n.children.forEach(walk); };
    node.children.forEach(walk);
    return ids;
}

// ── Inline text input ─────────────────────────────────────────────────────────

function InlineInput({ value, onChange, onSave, onCancel, placeholder, className = '', autoFocus = false }) {
    const ref = useRef(null);
    useEffect(() => { if (autoFocus) ref.current?.focus(); }, []);
    return (
        <input
            ref={ref}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
            placeholder={placeholder}
            className={`border-b border-stone-400 focus:outline-none bg-transparent text-sm ${className}`}
            dir="rtl"
        />
    );
}

// ── Add-topic form (inline) ───────────────────────────────────────────────────

function AddTopicForm({ onSave, onCancel, indent }) {
    const [name, setName] = useState('');
    const [detail, setDetail] = useState('');
    const handleSave = () => { if (!name.trim()) return; onSave(name.trim(), detail.trim()); };
    return (
        <div style={{ paddingRight: `${indent}px` }} className="flex items-center gap-2 py-1.5 px-2" dir="rtl">
            <InlineInput value={name} onChange={setName} onSave={handleSave} onCancel={onCancel} placeholder="שם נושא..." className="w-36 font-medium" autoFocus />
            <InlineInput value={detail} onChange={setDetail} onSave={handleSave} onCancel={onCancel} placeholder="פירוט (אופציונלי)" className="w-48 text-stone-500" />
            <button onClick={handleSave} className="p-0.5 text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
            <button onClick={onCancel} className="p-0.5 text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>
        </div>
    );
}

// ── Topic row ─────────────────────────────────────────────────────────────────

function TopicRow({
    node, depth, allTopics, expandedIds, onToggleExpand,
    addingChildOf, onStartAddChild, onSaveChild, onCancelAdd,
    onEdit, onDelete, onPromote, onDemote, onToggleKey, saving,
    draggingId, onDragStart, onDragEnd, onGapDrop, onReparent,
}) {
    const rowRef = useRef(null);
    const handleRef = useRef(null);
    const topGapRef = useRef(null);

    const isCategory = node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const indent = depth * 20;

    const canPromote = !!node.parent_id;
    const siblings = allTopics
        .filter(t => t.parent_id === node.parent_id)
        .sort((a, b) => a.position - b.position);
    const idx = siblings.findIndex(t => t.id === node.id);
    const canDemote = idx > 0;

    const [dropState, setDropState] = useState('idle'); // 'idle' | 'gap-above' | 'reparent'

    useEffect(() => {
        const el = rowRef.current;
        const handle = handleRef.current;
        const topGap = topGapRef.current;
        if (!el || !handle || !topGap) return;

        return combine(
            draggable({
                element: el,
                dragHandle: handle,
                getInitialData: () => ({ id: node.id, parentId: node.parent_id, depth }),
                onDragStart: () => onDragStart(node.id),
                onDrop: () => onDragEnd(),
            }),

            // Gap zone above this row → reorder or cross-parent drop
            dropTargetForElements({
                element: topGap,
                canDrop: ({ source }) => source.data.id !== node.id,
                getData: () => ({ type: 'gap', beforeId: node.id, parentId: node.parent_id }),
                onDragEnter: () => setDropState('gap-above'),
                onDragLeave: () => setDropState('idle'),
                onDrop: ({ source }) => {
                    setDropState('idle');
                    onGapDrop(source.data.id, source.data.parentId, node.parent_id, node.id);
                },
            }),

            // Row body → reparent
            dropTargetForElements({
                element: el,
                canDrop: ({ source }) => {
                    if (source.data.id === node.id) return false;
                    return !getDescendantIds(node).has(source.data.id);
                },
                getData: () => ({ type: 'reparent', targetId: node.id }),
                onDragEnter: () => setDropState('reparent'),
                onDragLeave: () => setDropState('idle'),
                onDrop: ({ source }) => {
                    setDropState('idle');
                    onReparent(source.data.id, node.id);
                },
            }),
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [node.id, node.parent_id, depth]);

    const isDragging = draggingId === node.id;

    return (
        <>
            <div
                ref={topGapRef}
                className={`h-1 rounded transition-colors ${dropState === 'gap-above' ? 'bg-blue-400' : ''}`}
            />
            <div
                ref={rowRef}
                style={{ paddingRight: `${indent + 4}px` }}
                className={`group flex items-center gap-1 py-1.5 px-2 rounded-lg transition-colors ${
                    isDragging ? 'opacity-40' :
                    dropState === 'reparent' ? 'bg-blue-50 ring-2 ring-blue-400' :
                    'hover:bg-stone-50'
                }`}
                dir="rtl"
            >
                <span
                    ref={handleRef}
                    className="shrink-0 text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                    title="גרור לשינוי סדר"
                >
                    <GripVertical className="w-3.5 h-3.5" />
                </span>

                <button
                    onClick={() => isCategory && onToggleExpand(node.id)}
                    className={`shrink-0 text-stone-400 ${isCategory ? 'hover:text-stone-600 cursor-pointer' : 'cursor-default'}`}
                >
                    {isCategory
                        ? (isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />)
                        : <span className="w-3.5 h-3.5 block" />
                    }
                </button>

                <span className={`text-sm min-w-[120px] ${isCategory ? 'font-bold' : 'font-medium'}`}>
                    {node.name}
                </span>

                {node.detail
                    ? <span className="text-xs text-stone-400 flex-1 truncate">{node.detail}</span>
                    : <span className="flex-1" />
                }

                <button
                    onClick={() => onToggleKey(node)}
                    title={node.is_key ? 'נושא מפתח (לחץ לביטול)' : 'סמן כנושא מפתח'}
                    className={`shrink-0 p-0.5 rounded transition-colors ${
                        node.is_key
                            ? 'text-amber-500 hover:text-amber-600'
                            : 'text-stone-200 hover:text-stone-400 opacity-0 group-hover:opacity-100'
                    }`}
                >
                    <KeyRound className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => onStartAddChild(node.id)} title="הוסף נושא בן" className="p-1 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded">
                        <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                    {/* RTL: Indent icon (→) = promote (move toward parent/right), Outdent icon (←) = demote (move deeper/left) */}
                    <button
                        onClick={() => canPromote && onPromote(node.id)}
                        title="רמה אחת מעלה"
                        disabled={!canPromote || saving}
                        className="p-1 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Indent className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => canDemote && onDemote(node.id)}
                        title="הפוך לתת נושא"
                        disabled={!canDemote || saving}
                        className="p-1 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Outdent className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onEdit(node)} title="ערוך" className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded">
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(node.id, node.children.length > 0)} title="מחק" className="p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {addingChildOf === node.id && (
                <AddTopicForm
                    indent={indent + 24}
                    onSave={(name, detail) => onSaveChild(node.id, name, detail)}
                    onCancel={onCancelAdd}
                />
            )}

            {isCategory && isExpanded && (
                <ChildList
                    nodes={node.children}
                    depth={depth + 1}
                    parentId={node.id}
                    allTopics={allTopics}
                    expandedIds={expandedIds}
                    onToggleExpand={onToggleExpand}
                    addingChildOf={addingChildOf}
                    onStartAddChild={onStartAddChild}
                    onSaveChild={onSaveChild}
                    onCancelAdd={onCancelAdd}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPromote={onPromote}
                    onDemote={onDemote}
                    onToggleKey={onToggleKey}
                    saving={saving}
                    draggingId={draggingId}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onGapDrop={onGapDrop}
                    onReparent={onReparent}
                />
            )}
        </>
    );
}

// Renders a list of sibling nodes + a trailing gap zone for "drop at end"
function ChildList({ nodes, depth, parentId, ...rowProps }) {
    const trailingGapRef = useRef(null);

    useEffect(() => {
        const el = trailingGapRef.current;
        if (!el) return;
        return dropTargetForElements({
            element: el,
            // Allow drop at end unless the item is already last in this group
            canDrop: ({ source }) => source.data.id !== nodes[nodes.length - 1]?.id,
            getData: () => ({ type: 'gap', beforeId: null, parentId }),
            onDragEnter: () => el.classList.add('bg-blue-400'),
            onDragLeave: () => el.classList.remove('bg-blue-400'),
            onDrop: ({ source }) => {
                el.classList.remove('bg-blue-400');
                rowProps.onGapDrop(source.data.id, source.data.parentId, parentId, null);
            },
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodes.length, parentId]);

    return (
        <>
            {nodes.map(node => (
                <TopicRow key={node.id} node={node} depth={depth} parentId={parentId} {...rowProps} />
            ))}
            <div ref={trailingGapRef} className="h-1.5 rounded transition-colors" />
        </>
    );
}

// ── Edit dialog ───────────────────────────────────────────────────────────────

function EditDialog({ topic, onSave, onCancel }) {
    const [name, setName] = useState(topic.name);
    const [detail, setDetail] = useState(topic.detail || '');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" dir="rtl">
            <div className="bg-white rounded-xl shadow-xl p-6 w-96 flex flex-col gap-4">
                <h3 className="font-bold text-base">עריכת נושא</h3>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-stone-500">שם</label>
                    <input autoFocus value={name} onChange={e => setName(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-stone-500" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-stone-500">פירוט</label>
                    <input value={detail} onChange={e => setDetail(e.target.value)} className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-stone-500" placeholder="פירוט (אופציונלי)" />
                </div>
                <div className="flex justify-end gap-2">
                    <Button data-role="main-new" onClick={() => name.trim() && onSave(name.trim(), detail.trim())} disabled={!name.trim()}>שמור</Button>
                    <Button onClick={onCancel}>בטל</Button>
                </div>
            </div>
        </div>
    );
}

// ── Main manager ──────────────────────────────────────────────────────────────

export default function TopicBankManager({ isAdmin }) {
    const [allTopics, setAllTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedMajorId, setSelectedMajorId] = useState(null);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [addingChildOf, setAddingChildOf] = useState(null);
    const [addingMajor, setAddingMajor] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [draggingId, setDraggingId] = useState(null);
    // Cross-parent gap drop: { draggedId, currentParentId, targetParentId, beforeId }
    const [pendingCrossParentDrop, setPendingCrossParentDrop] = useState(null);
    const [undoStack, setUndoStack] = useState([]); // [{label: string, snapshot: [...rows]}]
    const handleUndoRef = useRef(null);

    const load = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('topic_bank').select('*').order('position');
        if (error) toastsActions.addFromError(error, 'שגיאה בטעינת בנק הנושאים');
        setAllTopics(data || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (allTopics.length > 0 && selectedMajorId === null) {
            const majors = allTopics.filter(t => !t.parent_id && (isAdmin || t.name !== HEUTAGOGY_MAJOR_NAME));
            if (majors.length > 0) setSelectedMajorId(majors[0].id);
        }
    }, [allTopics, isAdmin, selectedMajorId]);

    const majors = allTopics
        .filter(t => !t.parent_id && (isAdmin || t.name !== HEUTAGOGY_MAJOR_NAME))
        .sort((a, b) => a.position - b.position);

    const fullTree = buildTree(allTopics);
    const selectedMajorNode = fullTree.find(m => m.id === selectedMajorId);

    useEffect(() => {
        if (!selectedMajorNode) return;
        const next = new Set();
        selectedMajorNode.children.forEach(cat => next.add(cat.id));
        setExpandedIds(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMajorId]);

    const toggleExpand = id => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const withSave = async (fn) => {
        setSaving(true);
        try { await fn(); await load(); }
        catch (e) { toastsActions.addToast({ message: e.message, type: 'error' }); }
        finally { setSaving(false); }
    };

    const pushUndo = (label, affectedIds) => {
        const idSet = new Set(affectedIds);
        const snapshot = allTopics.filter(t => idSet.has(t.id));
        setUndoStack(prev => [{ label, snapshot }, ...prev].slice(0, 20));
    };

    const handleUndo = () => {
        if (undoStack.length === 0 || saving) return;
        const [top, ...rest] = undoStack;
        setUndoStack(rest);
        withSave(() => restoreTopicBankSnapshot(top.snapshot));
    };
    handleUndoRef.current = handleUndo;

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndoRef.current?.();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaveChild = (parentId, name, detail) => {
        withSave(async () => {
            await createTopicBankItem({ name, detail, parent_id: parentId });
            setAddingChildOf(null);
            setExpandedIds(prev => new Set([...prev, parentId]));
        });
    };

    const handleSaveMajor = (name, detail) => {
        withSave(async () => {
            await createTopicBankItem({ name, detail, parent_id: null });
            setAddingMajor(false);
        });
    };

    const handleSaveEdit = (name, detail) => {
        pushUndo('עריכת נושא', [editingTopic.id]);
        withSave(async () => {
            await updateTopicBankItem(editingTopic.id, { name, detail });
            setEditingTopic(null);
        });
    };

    const handleToggleKey = (node) => {
        pushUndo('שינוי מפתח', [node.id]);
        withSave(() => updateTopicBankItem(node.id, { is_key: !node.is_key }));
    };

    const handleDelete = (id) => {
        withSave(async () => {
            await deleteTopicBankItem(id);
            setConfirmDelete(null);
            if (id === selectedMajorId) setSelectedMajorId(null);
        });
    };

    const handlePromote = (id) => {
        const topic = allTopics.find(t => t.id === id);
        const parent = allTopics.find(t => t.id === topic?.parent_id);
        const oldPeerIds = allTopics.filter(t => t.parent_id === topic?.parent_id).map(t => t.id);
        const newPeerIds = allTopics.filter(t => t.parent_id === parent?.parent_id).map(t => t.id);
        pushUndo('קידום רמה', [id, ...oldPeerIds, ...newPeerIds]);
        withSave(() => promoteTopicBankItem(id, allTopics));
    };
    const handleDemote = (id) => {
        const topic = allTopics.find(t => t.id === id);
        const siblings = allTopics
            .filter(t => t.parent_id === topic?.parent_id)
            .sort((a, b) => a.position - b.position);
        const idx = siblings.findIndex(t => t.id === id);
        const prevSiblingId = idx > 0 ? siblings[idx - 1].id : null;
        const prevSiblingChildIds = prevSiblingId
            ? allTopics.filter(t => t.parent_id === prevSiblingId).map(t => t.id)
            : [];
        pushUndo('הורדת רמה', [id, ...siblings.map(t => t.id), ...prevSiblingChildIds]);
        withSave(() => demoteTopicBankItem(id, allTopics));
    };

    // Called when an item is dropped in a gap between rows.
    // draggedParentId: current parent of the dragged item
    // targetParentId: parent of the gap (= desired new parent)
    // beforeId: the item just after the gap (null = drop at end)
    const handleGapDrop = (draggedId, draggedParentId, targetParentId, beforeId) => {
        const isCrossParent = draggedParentId !== targetParentId;

        if (isCrossParent) {
            // Ask for confirmation before reparenting
            setPendingCrossParentDrop({ draggedId, draggedParentId, targetParentId, beforeId });
            return;
        }

        // Same parent: reorder
        const siblings = allTopics
            .filter(t => t.parent_id === targetParentId)
            .sort((a, b) => a.position - b.position);

        pushUndo('שינוי סדר', siblings.map(t => t.id));

        const withoutDragged = siblings.filter(t => t.id !== draggedId);
        const insertIdx = beforeId ? withoutDragged.findIndex(t => t.id === beforeId) : withoutDragged.length;
        withoutDragged.splice(insertIdx === -1 ? withoutDragged.length : insertIdx, 0, siblings.find(t => t.id === draggedId));

        // Optimistic update
        const newPositions = Object.fromEntries(withoutDragged.map((t, i) => [t.id, i]));
        setAllTopics(prev => prev.map(t =>
            t.parent_id === targetParentId ? { ...t, position: newPositions[t.id] ?? t.position } : t
        ));

        withSave(() => reorderTopicBankItems(withoutDragged.map(t => t.id)));
    };

    const handleReparent = (draggedId, newParentId) => {
        const item = allTopics.find(t => t.id === draggedId);
        const oldSiblingIds = allTopics.filter(t => t.parent_id === item?.parent_id).map(t => t.id);
        const newChildIds = allTopics.filter(t => t.parent_id === newParentId).map(t => t.id);
        pushUndo('שינוי הורה', [draggedId, ...oldSiblingIds, ...newChildIds]);
        withSave(async () => {
            await reparentTopicBankItem(draggedId, newParentId);
            setExpandedIds(prev => new Set([...prev, newParentId]));
        });
    };

    const handleConfirmCrossParentDrop = () => {
        const { draggedId, draggedParentId, targetParentId, beforeId } = pendingCrossParentDrop;
        setPendingCrossParentDrop(null);
        const oldSiblingIds = allTopics.filter(t => t.parent_id === draggedParentId).map(t => t.id);
        const newSiblingIds = allTopics.filter(t => t.parent_id === targetParentId).map(t => t.id);
        pushUndo('העברה לרמה אחרת', [draggedId, ...oldSiblingIds, ...newSiblingIds]);
        withSave(async () => {
            await reparentAndPositionTopicBankItem(draggedId, targetParentId, beforeId);
            setExpandedIds(prev => new Set([...prev, targetParentId]));
        });
    };

    const handleAddCategory = () => {
        if (selectedMajorId) setAddingChildOf(selectedMajorId);
    };

    // Names for the cross-parent drop confirmation message
    const crossParentDraggedName = pendingCrossParentDrop
        ? allTopics.find(t => t.id === pendingCrossParentDrop.draggedId)?.name
        : null;
    const crossParentTargetName = pendingCrossParentDrop
        ? allTopics.find(t => t.id === pendingCrossParentDrop.targetParentId)?.name
        : null;

    if (loading) {
        return <div className="flex items-center justify-center p-12 text-stone-500">טוען...</div>;
    }

    const rowProps = {
        allTopics,
        expandedIds,
        onToggleExpand: toggleExpand,
        addingChildOf,
        onStartAddChild: setAddingChildOf,
        onSaveChild: handleSaveChild,
        onCancelAdd: () => setAddingChildOf(null),
        onEdit: setEditingTopic,
        onDelete: (id, hasChildren) => setConfirmDelete({ id, hasChildren }),
        onPromote: handlePromote,
        onDemote: handleDemote,
        onToggleKey: handleToggleKey,
        saving,
        draggingId,
        onDragStart: setDraggingId,
        onDragEnd: () => setDraggingId(null),
        onGapDrop: handleGapDrop,
        onReparent: handleReparent,
    };

    return (
        <div className="flex flex-col h-full" dir="rtl">
            {/* Major tabs */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-stone-200 bg-stone-50 flex-wrap">
                {majors.map(major => (
                    <button
                        key={major.id}
                        onClick={() => { setSelectedMajorId(major.id); setAddingChildOf(null); setUndoStack([]); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            selectedMajorId === major.id
                                ? 'bg-gray-800 text-white'
                                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                        }`}
                    >
                        {major.name}
                    </button>
                ))}
                <button
                    onClick={() => setAddingMajor(true)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-400 border border-dashed border-stone-300 hover:border-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" />
                    הוסף מגמה
                </button>
                {undoStack.length > 0 && (
                    <button
                        onClick={handleUndo}
                        disabled={saving}
                        title={`בטל: ${undoStack[0].label}`}
                        className="mr-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-stone-500 border border-stone-200 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                    >
                        <Undo2 className="w-3.5 h-3.5" />
                        בטל: {undoStack[0].label}
                    </button>
                )}
            </div>

            {/* Tree content */}
            <div className="flex-1 overflow-y-auto p-4">
                {!selectedMajorNode ? (
                    <div className="text-center text-stone-400 py-8 text-sm">בחר מגמה</div>
                ) : (
                    <div>
                        {selectedMajorNode.children.length === 0 && addingChildOf !== selectedMajorId && (
                            <div className="text-stone-400 text-sm px-2 py-4 text-center">אין קטגוריות עדיין</div>
                        )}
                        <ChildList
                            nodes={selectedMajorNode.children}
                            depth={0}
                            parentId={selectedMajorId}
                            {...rowProps}
                        />
                        {addingChildOf === selectedMajorId ? (
                            <AddTopicForm
                                indent={0}
                                onSave={(name, detail) => handleSaveChild(selectedMajorId, name, detail)}
                                onCancel={() => setAddingChildOf(null)}
                            />
                        ) : (
                            <button
                                onClick={handleAddCategory}
                                className="mt-2 flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 px-2 py-1 rounded hover:bg-stone-50 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                הוסף קטגוריה תחת {selectedMajorNode.name}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Add major form */}
            {addingMajor && (
                <div className="px-4 pb-3 border-t border-stone-100 pt-3">
                    <p className="text-xs text-stone-500 mb-2">הוסף מגמה חדשה (נושא ברמה ראשונה)</p>
                    <AddTopicForm indent={0} onSave={handleSaveMajor} onCancel={() => setAddingMajor(false)} />
                </div>
            )}

            {editingTopic && (
                <EditDialog topic={editingTopic} onSave={handleSaveEdit} onCancel={() => setEditingTopic(null)} />
            )}

            <ConfirmDialog
                isOpen={!!confirmDelete}
                message={confirmDelete?.hasChildren ? 'למחוק את הנושא וכל הנושאים שתחתיו?' : 'האם למחוק את הנושא?'}
                onConfirm={() => handleDelete(confirmDelete.id)}
                onCancel={() => setConfirmDelete(null)}
            />

            {/* Cross-parent gap drop confirmation */}
            <ConfirmDialog
                isOpen={!!pendingCrossParentDrop}
                message={`להעביר את "${crossParentDraggedName}" להיות תחת "${crossParentTargetName}"?`}
                confirmLabel="אישור"
                onConfirm={handleConfirmCrossParentDrop}
                onCancel={() => setPendingCrossParentDrop(null)}
            />
        </div>
    );
}
