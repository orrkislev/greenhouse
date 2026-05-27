'use client';

import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Briefcase, Phone, User, Plus, ChevronDown, CheckCircle2, Clock, RotateCcw, X, Pencil, Trash2, Check } from 'lucide-react';
import ContextBar, { PageMain } from '@/components/ContextBar';
import CvPortfolioCards from './CvPortfolioCards';
import { useVocation, useVocationData, vocationActions } from '@/utils/store/useVocation';
import { useUser, isVocationStaff } from '@/utils/store/useUser';
import { Edittable } from '../admin/components/Common';
import { daysOfWeek } from '@/utils/store/useTime';

export default function VocationPage() {
    const user = useUser(s => s.user);
    if (!user) return null;
    if (isVocationStaff()) return <StaffVocationDashboard />;
    return <StudentVocationPage />;
}

// ─── Student view ────────────────────────────────────────────────────────────

function StudentVocationPage() {
    const jobs = useVocation();
    const checkins = useVocationData(s => s.checkins);
    const vocation = jobs.find(j => j.is_active) ?? null;

    useEffect(() => {
        if (vocation?.id) vocationActions.loadCheckins();
    }, [vocation?.id]);

    return (
        <>
            <PageMain>
                <CvPortfolioCards />
                {!vocation
                    ? <NoVocationState />
                    : <VocationDashboard vocation={vocation} checkins={checkins} />
                }
            </PageMain>
            <ContextBar name="" />
        </>
    );
}

function NoVocationState() {
    return (
        <div className="mt-6 text-center text-stone-400 text-sm py-8 border border-dashed border-stone-200 rounded-xl">
            עדיין לא הוגדרה תעסוקה — פנה/י לאחראי/ת תעסוקה
        </div>
    );
}

function VocationDashboard({ vocation, checkins }) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayDayIndex = new Date().getDay();
    const isTodayWorkDay = vocation.days_of_week?.includes(todayDayIndex) ?? false;
    const todayCheckin = checkins.find(c => c.checkin_date === today);

    return (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
            <JobStatusCard vocation={vocation} todayDayIndex={todayDayIndex} />
            {isTodayWorkDay && (
                <CheckInButton vocation={vocation} todayCheckin={todayCheckin} today={today} />
            )}
            <RetroactiveReport vocation={vocation} checkins={checkins} />
            <CheckinHistory checkins={checkins} vocation={vocation} />
        </div>
    );
}

function JobStatusCard({ vocation, todayDayIndex }) {
    return (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <div className="text-xl font-bold text-stone-800 mb-1">
                {vocation.place_of_work || '—'}
            </div>
            <div className="text-stone-500 text-sm mb-4">{vocation.position || ''}</div>

            {(vocation.contact_name || vocation.contact_phone) && (
                <div className="flex items-center gap-3 text-sm text-stone-600 mb-4">
                    <User className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    <span>{vocation.contact_name}</span>
                    {vocation.contact_phone && (
                        <>
                            <Phone className="w-4 h-4 text-stone-400 flex-shrink-0" />
                            <a href={`tel:${vocation.contact_phone}`} className="text-primary hover:underline" dir="ltr">
                                {vocation.contact_phone}
                            </a>
                        </>
                    )}
                </div>
            )}

            <div className="flex gap-2 flex-wrap">
                {daysOfWeek.map((label, idx) => {
                    const isWorkDay = vocation.days_of_week?.includes(idx);
                    const isToday = idx === todayDayIndex;
                    return (
                        <div key={idx} className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border transition-all
                            ${isWorkDay
                                ? isToday
                                    ? 'bg-green-500 text-white border-green-500'
                                    : 'bg-green-100 text-green-700 border-green-300'
                                : 'bg-stone-50 text-stone-300 border-stone-200'
                            }`}>
                            {label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function CheckInButton({ vocation, todayCheckin, today }) {
    const [hours, setHours] = useState(todayCheckin?.hours ?? '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Keep local hours in sync if todayCheckin changes (e.g. after save)
    useEffect(() => {
        setHours(todayCheckin?.hours ?? '');
    }, [todayCheckin?.hours]);

    const handleCheckIn = async () => {
        setSaving(true);
        await vocationActions.checkIn(vocation.id, hours || null, null);
        setSaving(false);
    };

    const handleUpdateHours = async () => {
        setSaving(true);
        await vocationActions.checkIn(vocation.id, hours || null, null);
        setSaving(false);
    };

    const handleDelete = async () => {
        setDeleting(true);
        await vocationActions.deleteCheckin(todayCheckin.id);
        setDeleting(false);
        setConfirmDelete(false);
        setHours('');
    };

    if (todayCheckin) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    נרשמת להיום!
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="0.5"
                        max="12"
                        step="0.5"
                        value={hours}
                        onChange={e => setHours(e.target.value)}
                        placeholder="שעות"
                        className="w-24 border border-green-300 bg-white rounded-lg px-3 py-2 text-center text-base focus:outline-none focus:border-green-500"
                    />
                    <span className="text-green-700 text-sm">שעות</span>
                    <button
                        onClick={handleUpdateHours}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                        שמור
                    </button>
                    <div className="mr-auto">
                        {confirmDelete ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-500">בטוח?</span>
                                <button onClick={handleDelete} disabled={deleting}
                                    className="text-xs text-red-600 font-medium hover:text-red-700 disabled:opacity-50">
                                    {deleting ? '...' : 'מחק'}
                                </button>
                                <button onClick={() => setConfirmDelete(false)} className="text-xs text-stone-400">ביטול</button>
                            </div>
                        ) : (
                            <button onClick={() => setConfirmDelete(true)}
                                className="p-1.5 text-stone-300 hover:text-red-400 transition-colors rounded">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <button
                onClick={handleCheckIn}
                disabled={saving}
                className="w-full min-h-20 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-2xl font-bold rounded-2xl shadow-lg transition-all duration-150 active:scale-95 disabled:opacity-60">
                {saving ? '...' : 'אני בעבודה היום'}
            </button>
            <div className="flex items-center gap-2 px-1">
                <span className="text-sm text-stone-400">שעות (אופציונלי):</span>
                <input
                    type="number"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={hours}
                    onChange={e => setHours(e.target.value)}
                    placeholder="4"
                    className="w-20 border border-stone-300 rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:border-green-400"
                />
            </div>
        </div>
    );
}

function RetroactiveReport({ vocation, checkins }) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState('');
    const [hours, setHours] = useState('');
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    const maxDate = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!date) return;
        setSaving(true);
        await vocationActions.checkIn(vocation.id, hours || null, date);
        setSaving(false);
        setDone(true);
        setDate('');
        setHours('');
        setTimeout(() => setDone(false), 3000);
    };

    return (
        <div className="bg-white rounded-2xl border border-stone-200">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3 text-sm text-stone-500 hover:text-stone-700 transition-colors">
                <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    דיווח על יום עבר
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <form onSubmit={handleSubmit} className="px-5 pb-4 flex flex-col gap-3 border-t border-stone-100">
                    <div className="flex flex-col gap-1 pt-3">
                        <label className="text-xs text-stone-500">תאריך</label>
                        <input
                            type="date"
                            max={maxDate}
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                            className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-stone-500">שעות (אופציונלי)</label>
                        <input
                            type="number"
                            min="0.5"
                            max="12"
                            step="0.5"
                            value={hours}
                            onChange={e => setHours(e.target.value)}
                            placeholder="כמה שעות?"
                            className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving || !date}
                        className="bg-primary text-white rounded-xl py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                        {done ? '✓ נשמר!' : saving ? '...' : 'שמור דיווח'}
                    </button>
                </form>
            )}
        </div>
    );
}

function CheckinHistory({ checkins, vocation }) {
    const past = checkins.filter(c => c.checkin_date !== format(new Date(), 'yyyy-MM-dd'));
    if (!past.length) return null;
    return (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="text-xs text-stone-400 px-5 pt-4 pb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> נוכחות קודמת
            </div>
            <div className="divide-y divide-stone-100">
                {past.slice(0, 10).map(c => (
                    <CheckinRow key={c.id} checkin={c} vocation={vocation} />
                ))}
            </div>
        </div>
    );
}

function CheckinRow({ checkin, vocation }) {
    const [editing, setEditing] = useState(false);
    const [hours, setHours] = useState(checkin.hours ?? '');
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await vocationActions.checkIn(vocation.id, hours || null, checkin.checkin_date);
        setSaving(false);
        setEditing(false);
    };

    const handleDelete = async () => {
        setDeleting(true);
        await vocationActions.deleteCheckin(checkin.id);
        setDeleting(false);
    };

    return (
        <div className="flex items-center gap-3 px-5 py-2.5 text-sm">
            <span className="text-stone-500 tabular-nums min-w-[90px]">{checkin.checkin_date}</span>
            {checkin.is_retroactive && (
                <span className="text-amber-500 text-[10px] border border-amber-200 rounded-full px-1.5 py-0.5">עבר</span>
            )}
            {editing ? (
                <>
                    <input
                        type="number"
                        min="0.5"
                        max="12"
                        step="0.5"
                        value={hours}
                        onChange={e => setHours(e.target.value)}
                        placeholder="שעות"
                        autoFocus
                        className="w-20 border border-stone-300 rounded-lg px-2 py-1 text-center text-sm focus:outline-none focus:border-primary"
                    />
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50">
                        <Check className="w-3 h-3" />
                        שמור
                    </button>
                    <button onClick={() => { setEditing(false); setHours(checkin.hours ?? ''); }}
                        className="text-xs text-stone-400 hover:text-stone-600">
                        ביטול
                    </button>
                </>
            ) : (
                <>
                    <span className="text-green-600 font-medium min-w-[48px]">
                        {checkin.hours ? `${checkin.hours}ש׳` : <span className="text-stone-300 font-normal">—</span>}
                    </span>
                    <button onClick={() => setEditing(true)}
                        className="p-1 text-stone-300 hover:text-stone-500 transition-colors rounded">
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <div className="mr-auto">
                        {confirmDelete ? (
                            <div className="flex items-center gap-2">
                                <button onClick={handleDelete} disabled={deleting}
                                    className="text-xs text-red-600 font-medium hover:text-red-700 disabled:opacity-50">
                                    {deleting ? '...' : 'מחק'}
                                </button>
                                <button onClick={() => setConfirmDelete(false)} className="text-xs text-stone-400">ביטול</button>
                            </div>
                        ) : (
                            <button onClick={() => setConfirmDelete(true)}
                                className="p-1 text-stone-300 hover:text-red-400 transition-colors rounded">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Staff view ──────────────────────────────────────────────────────────────

const HEBREW_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const ALL_DAY_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

function checkinDayLabel(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return ALL_DAY_LABELS[d.getDay()] ?? '';
}

function monthOptions() {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
        const d = subMonths(now, i);
        return {
            label: `${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
            start: format(startOfMonth(d), 'yyyy-MM-dd'),
            end: format(endOfMonth(d), 'yyyy-MM-dd'),
        };
    });
}

function StaffVocationDashboard() {
    const allVocations = useVocationData(s => s.allVocations);
    const staffCheckins = useVocationData(s => s.staffCheckins);
    const [selectedId, setSelectedId] = useState(null);
    const [showAssign, setShowAssign] = useState(false);
    const [monthIdx, setMonthIdx] = useState(0);
    const options = monthOptions();

    useEffect(() => { vocationActions.loadAllVocations(); }, []);
    useEffect(() => {
        const opt = options[monthIdx];
        vocationActions.loadStaffCheckins(opt.start, opt.end);
    }, [monthIdx]);

    const studentsWithVocation = allVocations.filter(s => s.vocation);

    const hoursMap = staffCheckins.reduce((acc, c) => {
        acc[c.user_id] = (acc[c.user_id] ?? 0) + (parseFloat(c.hours) || 0);
        return acc;
    }, {});

    return (
        <>
            <PageMain>
                <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                    <h1 className="text-base font-bold text-stone-800 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        תעסוקת חניכים בחוץ
                    </h1>
                    <div className="flex items-center gap-2">
                        <select
                            value={monthIdx}
                            onChange={e => setMonthIdx(Number(e.target.value))}
                            className="text-xs border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary bg-white">
                            {options.map((o, i) => (
                                <option key={i} value={i}>{o.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => { setSelectedId(null); setShowAssign(s => !s); }}
                            className="flex items-center gap-1 bg-primary text-white text-xs px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                            הוסף חניך
                        </button>
                    </div>
                </div>

                {showAssign && (
                    <AssignVocationPanel
                        allStudents={allVocations}
                        onClose={() => setShowAssign(false)}
                        onAssigned={(id) => { setShowAssign(false); setSelectedId(id); }}
                    />
                )}

                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-stone-200 bg-stone-50 text-stone-500 text-xs">
                                <th className="px-3 py-2 text-right font-medium">שם</th>
                                <th className="px-3 py-2 text-right font-medium hidden md:table-cell">מקום עבודה</th>
                                <th className="px-3 py-2 text-right font-medium hidden md:table-cell">תפקיד</th>
                                <th className="px-3 py-2 text-right font-medium hidden sm:table-cell">ימים</th>
                                <th className="px-3 py-2 text-right font-medium">שעות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentsWithVocation.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-stone-400 text-sm">
                                        אין חניכים עם תעסוקה פעילה
                                    </td>
                                </tr>
                            )}
                            {studentsWithVocation.map(student => (
                                <StudentTableRow
                                    key={student.id}
                                    student={student}
                                    hours={hoursMap[student.id]}
                                    isOpen={selectedId === student.id}
                                    onToggle={() => setSelectedId(id => id === student.id ? null : student.id)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </PageMain>
            <ContextBar name="" />
        </>
    );
}

function StudentTableRow({ student, hours, isOpen, onToggle }) {
    return (
        <>
            <tr
                onClick={onToggle}
                className={`border-b border-stone-100 cursor-pointer transition-colors text-sm
                    ${isOpen ? 'bg-primary/5 border-b-0' : 'hover:bg-stone-50'}`}>
                <td className="px-3 py-2 font-medium text-stone-800">
                    {student.first_name} {student.last_name}
                </td>
                <td className="px-3 py-2 text-stone-600 hidden md:table-cell">
                    {student.vocation?.place_of_work || '—'}
                </td>
                <td className="px-3 py-2 text-stone-400 hidden md:table-cell text-xs">
                    {student.vocation?.position || '—'}
                </td>
                <td className="px-3 py-2 hidden sm:table-cell">
                    <DaysChips days={student.vocation?.days_of_week ?? []} />
                </td>
                <td className="px-3 py-2 font-medium text-stone-700">
                    {hours ? `${hours}ש׳` : '—'}
                </td>
            </tr>
            {isOpen && (
                <tr className="border-b-2 border-primary/20">
                    <td colSpan={5} className="p-0 bg-primary/5">
                        <StudentDetailPanel student={student} onClose={onToggle} />
                    </td>
                </tr>
            )}
        </>
    );
}

function DaysChips({ days }) {
    return (
        <div className="flex gap-0.5">
            {daysOfWeek.map((label, idx) => (
                <div key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border
                    ${days.includes(idx)
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-stone-50 text-stone-300 border-stone-200'
                    }`}>
                    {label}
                </div>
            ))}
        </div>
    );
}

function StudentDetailPanel({ student, onClose }) {
    const vocation = student.vocation;
    const [localVoc, setLocalVoc] = useState({ ...vocation });
    const [checkins, setCheckins] = useState([]);
    const [loadingCheckins, setLoadingCheckins] = useState(false);
    const [deactivateConfirm, setDeactivateConfirm] = useState(false);

    useEffect(() => {
        setLocalVoc({ ...vocation });
        setDeactivateConfirm(false);
        setLoadingCheckins(true);
        vocationActions.loadCheckinsForStudent(student.id).then(data => {
            setCheckins(data ?? []);
            setLoadingCheckins(false);
        });
    }, [student.id]);

    const save = (field, value) => {
        setLocalVoc(v => ({ ...v, [field]: value }));
        vocationActions.updateVocationDetails(vocation.id, { [field]: value });
    };

    const toggleDay = (idx) => {
        const current = localVoc.days_of_week ?? [];
        const next = current.includes(idx) ? current.filter(d => d !== idx) : [...current, idx].sort();
        save('days_of_week', next);
    };

    const totalHours = checkins.reduce((sum, c) => sum + (parseFloat(c.hours) || 0), 0);

    return (
        <div className="px-4 py-3 border-t border-primary/10">
            {/* Job fields + days side by side */}
            <div className="flex gap-6 flex-wrap mb-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1 min-w-0">
                    <Field label="מקום עבודה">
                        <Edittable value={localVoc.place_of_work} onFinish={v => save('place_of_work', v)} placeholder="מקום העבודה" />
                    </Field>
                    <Field label="תפקיד">
                        <Edittable value={localVoc.position} onFinish={v => save('position', v)} placeholder="תפקיד" />
                    </Field>
                    <Field label="איש קשר">
                        <Edittable value={localVoc.contact_name} onFinish={v => save('contact_name', v)} placeholder="שם" />
                    </Field>
                    <Field label="טלפון">
                        <Edittable value={localVoc.contact_phone} onFinish={v => save('contact_phone', v)} placeholder="טלפון" />
                    </Field>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                    <span className="text-xs text-stone-400">ימי עבודה</span>
                    <div className="flex gap-1.5">
                        {daysOfWeek.map((label, idx) => {
                            const active = localVoc.days_of_week?.includes(idx);
                            return (
                                <button key={idx} onClick={() => toggleDay(idx)}
                                    className={`w-8 h-8 rounded-full text-xs font-medium border transition-all
                                        ${active ? 'bg-green-500 text-white border-green-500' : 'bg-white text-stone-400 border-stone-200 hover:border-green-300'}`}>
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Checkins table */}
            <div className="border border-stone-200 rounded-lg overflow-hidden mb-3">
                <div className="flex items-center justify-between px-3 py-1.5 bg-stone-50 border-b border-stone-200">
                    <span className="text-xs font-medium text-stone-500">נוכחות</span>
                    {totalHours > 0 && (
                        <span className="text-xs font-semibold text-green-600">{totalHours} שעות סה״כ</span>
                    )}
                </div>
                {loadingCheckins ? (
                    <div className="px-3 py-3 text-xs text-stone-400">טוען...</div>
                ) : checkins.length === 0 ? (
                    <div className="px-3 py-3 text-xs text-stone-300">אין נוכחות רשומה</div>
                ) : (
                    <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-stone-50 sticky top-0 border-b border-stone-200">
                                <tr>
                                    <th className="px-3 py-1.5 text-right text-stone-400 font-medium">תאריך</th>
                                    <th className="px-3 py-1.5 text-right text-stone-400 font-medium">יום</th>
                                    <th className="px-3 py-1.5 text-right text-stone-400 font-medium">שעות</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {checkins.map(c => (
                                    <tr key={c.id}>
                                        <td className="px-3 py-1.5 text-stone-500 tabular-nums">{c.checkin_date}</td>
                                        <td className="px-3 py-1.5 text-stone-500">{checkinDayLabel(c.checkin_date)}</td>
                                        <td className="px-3 py-1.5 font-medium text-stone-700">{c.hours ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                {deactivateConfirm ? (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500">בטוח/ה?</span>
                        <button onClick={() => vocationActions.deactivateVocation(vocation.id)}
                            className="text-xs text-red-600 font-medium hover:text-red-700 px-2 py-1 border border-red-200 rounded">
                            כן, שחרר
                        </button>
                        <button onClick={() => setDeactivateConfirm(false)}
                            className="text-xs text-stone-400 hover:text-stone-600">
                            ביטול
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setDeactivateConfirm(true)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors">
                        שחרר מתעסוקה
                    </button>
                )}
                <button onClick={onClose} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> סגור
                </button>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <div className="text-[10px] text-stone-400 mb-0.5 uppercase tracking-wide">{label}</div>
            <div className="text-sm text-stone-700">{children}</div>
        </div>
    );
}

function AssignVocationPanel({ allStudents, onClose, onAssigned }) {
    const studentsWithoutVocation = allStudents.filter(s => !s.vocation);
    const [selectedId, setSelectedId] = useState('');
    const [form, setForm] = useState({
        place_of_work: '', position: '', contact_name: '', contact_phone: '', days_of_week: []
    });
    const [saving, setSaving] = useState(false);

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const toggleDay = (idx) => {
        const current = form.days_of_week;
        const next = current.includes(idx) ? current.filter(d => d !== idx) : [...current, idx].sort();
        set('days_of_week', next);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedId) return;
        setSaving(true);
        await vocationActions.assignVocation(selectedId, form);
        setSaving(false);
        onAssigned(selectedId);
    };

    return (
        <div className="mb-4 bg-white rounded-2xl border border-primary/30 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-stone-800">הקצאת תעסוקה לתלמיד/ה</h2>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="text-xs text-stone-400 block mb-1">בחר/י תלמיד/ה</label>
                    <select
                        required
                        value={selectedId}
                        onChange={e => setSelectedId(e.target.value)}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                        <option value="">— בחר תלמיד/ה —</option>
                        {studentsWithoutVocation.map(s => (
                            <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                        ))}
                    </select>
                    {studentsWithoutVocation.length === 0 && (
                        <p className="text-xs text-stone-400 mt-1">לכל התלמידים כבר יש תעסוקה פעילה</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput label="מקום עבודה" value={form.place_of_work} onChange={v => set('place_of_work', v)} required />
                    <FormInput label="תפקיד" value={form.position} onChange={v => set('position', v)} />
                    <FormInput label="איש קשר" value={form.contact_name} onChange={v => set('contact_name', v)} />
                    <FormInput label="טלפון" value={form.contact_phone} onChange={v => set('contact_phone', v)} type="tel" />
                </div>

                <div>
                    <div className="text-xs text-stone-400 mb-2">ימי עבודה</div>
                    <div className="flex gap-2 flex-wrap">
                        {daysOfWeek.map((label, idx) => {
                            const active = form.days_of_week.includes(idx);
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => toggleDay(idx)}
                                    className={`w-10 h-10 rounded-full font-medium border text-sm transition-all
                                        ${active
                                            ? 'bg-green-500 text-white border-green-500'
                                            : 'bg-stone-50 text-stone-400 border-stone-200 hover:border-green-300'
                                        }`}>
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-2 pt-1">
                    <button
                        type="submit"
                        disabled={saving || !selectedId}
                        className="flex-1 bg-primary text-white rounded-xl py-2 font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm">
                        {saving ? 'שומר...' : 'הקצה תעסוקה'}
                    </button>
                    <button type="button" onClick={onClose} className="px-4 py-2 text-stone-500 hover:text-stone-700 transition-colors text-sm">
                        ביטול
                    </button>
                </div>
            </form>
        </div>
    );
}

function FormInput({ label, value, onChange, required = false, type = 'text' }) {
    return (
        <div>
            <label className="text-xs text-stone-400 block mb-1">{label}{required && ' *'}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                required={required}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
        </div>
    );
}
