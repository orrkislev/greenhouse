import { supabase } from "@/utils/supabase/client"
import { useEffect, useState, useMemo, useRef } from "react";
import { toastsActions } from "@/utils/store/useToasts";
import { tw } from "@/utils/tw";
import usePopper from "@/components/Popper";
import { userActions, useUser } from "@/utils/store/useUser";
import Button from "@/components/Button";
import { getReportSemester } from "@/utils/store/useTime";
import { getYearSections, ikigaiStatus, portfolioStatus, libaStatus, learningStatus, vocationStatus } from "@/utils/reportConfig";
import { LATENESS, LATENESS_OPTIONS, pronounsKey, presencePercent } from "@/utils/presenceConfig";
import { upsertPresence, resolveStudentsByIdNumber, parseMashovXlsx } from "@/utils/actions/presence actions";

// Cell color by status:
//   empty     → red    (required section with nothing entered)
//   partial   → orange (in progress but incomplete)
//   attention → yellow (student done; staff must still act)
//   complete  → green  (fully done)
const STATUS_BG = {
    complete:  'bg-green-400 hover:bg-green-500',
    attention: 'bg-yellow-300 hover:bg-yellow-400',
    partial:   'bg-orange-400 hover:bg-orange-500',
    empty:     'bg-red-400 hover:bg-red-500',
};

const Cell = tw.td` text-center cursor-pointer
    ${p => STATUS_BG[p.$status] ?? STATUS_BG.empty}
`

// Severity order: empty > attention > partial > complete
const SEVERITY = { empty: 3, attention: 2, partial: 1, complete: 0 };
const worstStatus = statuses =>
    Object.keys(SEVERITY).find(s => SEVERITY[s] === Math.max(...statuses.map(s => SEVERITY[s] ?? 0)));

// mentors is private data (not in report_cards_public), so its status lives here
const mentorsStatus = r => {
    const m = r?.mentors;
    if (!m?.trim()) return 'empty';
    return m.trim().length >= 10 ? 'complete' : 'partial';
};

export default function StaffGroup_Evaluations({ group }) {
    const [data, setData] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [popperMode, setPopperMode] = useState(null); // 'mentors' | 'presence' | 'lateness' | 'import'
    const { open, close, Popper } = usePopper();
    const user = useUser(s => s.user);

    const currentSemester = getReportSemester() ?? '2026A';
    const semester = currentSemester.slice(4); // 'A' or 'B'
    const sections = getYearSections(group?.description, semester);

    useEffect(() => {
        if (!group || !group.members) return;
        const studentIds = group.members.filter(member => member?.role === 'student').map(member => member.id);
        (async () => {
            const { data, error } = await supabase.from('report_cards_public').select('*')
                .in('id', studentIds)
                .eq('report_semester', currentSemester);
            if (error) toastsActions.addFromError(error, 'שגיאה בטעינת הדוחות הציבוריים');
            const { data: privateData, error: privateError } = await supabase.from('report_cards_private').select('id,mentors')
                .in('id', studentIds)
                .eq('report_semester', currentSemester);
            if (privateError) toastsActions.addFromError(privateError, 'שגיאה בטעינת הדוחות הפרטיים');
            setData(group.members.filter(member => member?.role === 'student').map(member => ({
                ...member,
                report: {
                    ...data?.find(report => report.id === member.id),
                    mentors: privateData?.find(report => report.id === member.id)?.mentors || null
                }
            })));
        })();
    }, [group]);

    const openPopper = (student, mode) => {
        setSelectedStudent(student);
        setPopperMode(mode);
        open();
    };

    const goToProject = (student, project, termKey) => {
        if (!project) {
            userActions.switchToStudent(student, '/project');
        } else {
            userActions.switchToStudent(student, '/project?id=' + project.id + '&view=review_' + termKey);
        }
    };
    const goToResearch = (student, research) => {
        if (!research) {
            userActions.switchToStudent(student, '/research');
        } else {
            userActions.switchToStudent(student, '/research?id=' + research.id + '&view=review');
        }
    };
    const goToReport = (student, section) => userActions.switchToStudent(student, '/report?view=' + section);
    const viewFullReport = (student) => window.open(`/print_report/${student.id}`, "_blank", "noopener,noreferrer");

    const columnDefs = sections.flatMap(s => s.columns);

    const updateStudentPresence = (studentId, updates) => {
        setData(prev => prev.map(s =>
            s.id === studentId
                ? { ...s, report: { ...s.report, ...updates } }
                : s
        ));
    };

    return (
        <div className="flex flex-col gap-2 border border-border p-4 sticky top-0">
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold">הערכות</h4>
                {user?.is_admin && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setPopperMode('import'); open(); }}
                    >
                        יבוא נוכחות ממשו"ב
                    </Button>
                )}
            </div>

            <table className="text-xs table-auto border-separate border-spacing-1">
                <thead>
                    <tr>
                        {['תעודה', 'ממני אליך', 'איקיגאי', 'פורטפוליו', 'ליבה'].map(t => <th key={t} className="p-2">{t}</th>)}
                        {columnDefs.map(col => <th key={col.navArg} className="p-2">{col.label}</th>)}
                        {['למידה', 'יזמות מקיימת', 'נוכחות', 'איחורים'].map(t => <th key={t} className="p-2">{t}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data
                        .sort((a, b) => a.first_name.localeCompare(b.first_name))
                        .map(student => {
                            const pct = presencePercent(student.report?.presence_days, student.report?.absence_days);
                            const latenessLabel = student.report?.lateness
                                ? LATENESS[pronounsKey(student.report?.pronouns)]?.[student.report.lateness]
                                : null;

                            return (
                                <tr key={student.id} className="border-b border-border/50 hover:border-2 hover:border-black">
                                    <Cell $status={worstStatus([
                                        ['3','4'].includes(group?.description) ? 'complete' : mentorsStatus(student.report),
                                        ikigaiStatus(student.report),
                                        portfolioStatus(student.report),
                                        libaStatus(student.report),
                                        ...columnDefs.map(col => col.status(student.report)),
                                        learningStatus(student.report),
                                        vocationStatus(student.report),
                                    ])} onClick={() => viewFullReport(student)}>{student.first_name} {student.last_name.charAt(0)}.</Cell>
                                    <Cell $status={['3','4'].includes(group?.description) ? 'complete' : mentorsStatus(student.report)}
                                        onClick={() => openPopper(student, 'mentors')} />
                                    <Cell $status={ikigaiStatus(student.report)}
                                        onClick={() => goToReport(student, 'ikigai')} />
                                    <Cell $status={portfolioStatus(student.report)}
                                        onClick={() => goToReport(student, 'portfolio')} />
                                    <Cell $status={libaStatus(student.report)}
                                        onClick={() => goToReport(student, 'liba')} />
                                    {columnDefs.map(col => (
                                        <Cell key={col.navArg}
                                            $status={col.status(student.report)}
                                            onClick={() => {
                                                if (col.navFn === 'project') goToProject(student, student.report?.[col.navArg], col.termKey);
                                                else if (col.navFn === 'research') goToResearch(student, student.report?.[col.navArg]);
                                                else goToReport(student, col.navArg);
                                            }}
                                        />
                                    ))}
                                    <Cell $status={learningStatus(student.report)}
                                        onClick={() => goToReport(student, 'learning')} />
                                    <Cell $status={vocationStatus(student.report)}
                                        onClick={() => goToReport(student, 'vocation')} />
                                    {/* Presence cell: shows percentage, neutral background */}
                                    <td
                                        className="text-center cursor-pointer bg-stone-100 hover:bg-stone-200 px-2"
                                        onClick={() => openPopper(student, 'presence')}
                                    >
                                        {pct != null ? `${pct}%` : '—'}
                                    </td>
                                    {/* Lateness cell: red when not set, green when set */}
                                    <Cell
                                        $status={student.report?.lateness ? 'complete' : 'empty'}
                                        onClick={() => openPopper(student, 'lateness')}
                                    >
                                        {latenessLabel ?? ''}
                                    </Cell>
                                </tr>
                            );
                        })}
                </tbody>
            </table>

            <div className="flex gap-4 text-xs text-stone-500 mt-1">
                {[
                    ['bg-green-400',  'הושלם'],
                    ['bg-yellow-300', 'דורש טיפול'],
                    ['bg-orange-400', 'בתהליך'],
                    ['bg-red-400',    'ריק'],
                ].map(([color, label]) => (
                    <span key={label} className="flex items-center gap-1">
                        <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
                        {label}
                    </span>
                ))}
            </div>

            <Popper className="backdrop-blur-sm p-2">
                {selectedStudent && popperMode === 'mentors' && (
                    <div className="w-2xl">
                        <div className="flex justify-center items-center flex-col mb-2">
                            <div className="">ממני אליך</div>
                            <div className="font-bold text-lg">{selectedStudent.first_name} {selectedStudent.last_name}</div>
                        </div>
                        <MentorsEditor
                            student={selectedStudent}
                            closeModal={close}
                            onSave={(id, mentors) => setData(prev => prev.map(s => s.id === id ? { ...s, report: { ...s.report, mentors } } : s))}
                        />
                    </div>
                )}
                {selectedStudent && popperMode === 'presence' && (
                    <div className="w-sm">
                        <div className="flex justify-center items-center flex-col mb-2">
                            <div className="">נוכחות</div>
                            <div className="font-bold text-lg">{selectedStudent.first_name} {selectedStudent.last_name}</div>
                        </div>
                        <PresenceEditor
                            student={selectedStudent}
                            semester={currentSemester}
                            closeModal={close}
                            onSave={(id, updates) => updateStudentPresence(id, updates)}
                        />
                    </div>
                )}
                {selectedStudent && popperMode === 'lateness' && (
                    <div className="w-sm">
                        <div className="flex justify-center items-center flex-col mb-2">
                            <div className="">איחורים</div>
                            <div className="font-bold text-lg">{selectedStudent.first_name} {selectedStudent.last_name}</div>
                        </div>
                        <LatenessEditor
                            student={selectedStudent}
                            semester={currentSemester}
                            closeModal={close}
                            onSave={(id, updates) => updateStudentPresence(id, updates)}
                        />
                    </div>
                )}
                {popperMode === 'import' && (
                    <div className="w-3xl">
                        <div className="flex justify-center items-center flex-col mb-2">
                            <div className="font-bold text-lg">יבוא נוכחות מ-Mashov</div>
                            <div className="text-sm text-stone-500">{currentSemester}</div>
                        </div>
                        <ImportPresenceModal
                            semester={currentSemester}
                            closeModal={close}
                            onSave={(updates) => {
                                setData(prev => prev.map(s => {
                                    const u = updates[s.id];
                                    if (!u) return s;
                                    return { ...s, report: { ...s.report, ...u } };
                                }));
                            }}
                        />
                    </div>
                )}
            </Popper>
        </div>
    )
}




function MentorsEditor({ student, closeModal, onSave }) {
    const [value, setValue] = useState(student.report?.mentors || '');
    const [buttonText, setButtonText] = useState('שמור');

    useEffect(() => {
        setValue(student.report?.mentors || '');
    }, [student]);

    const shouldSave = useMemo(() => {
        return value.trim() !== student.report?.mentors?.trim()
    }, [value, student]);

    const save = async () => {
        if (!shouldSave) return;
        setButtonText('...');
        const currentSemester = getReportSemester() ?? '2026A';
        const { error } = await supabase
            .from('report_cards_private')
            .update({ mentors: value })
            .eq('id', student.id)
            .eq('report_semester', currentSemester);
        if (error) toastsActions.addFromError(error, 'שגיאה בשמירת הממני אליך');
        setButtonText('רונן!');
        onSave(student.id, value);
        setTimeout(() => {
            closeModal();
        }, 500);
    };

    return (
        <>
            <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full min-h-[200px] p-3 border border-border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`${student.first_name} היקר...`}
                dir="rtl"
            />
            <div className="flex gap-2 mt-1">
                <Button data-role="save" onClick={save} disabled={!shouldSave}>{buttonText}</Button>
                <Button data-role="cancel" onClick={closeModal}>ביטול</Button>
            </div>
        </>
    );
}


function PresenceEditor({ student, semester, closeModal, onSave }) {
    const [presenceDays, setPresenceDays] = useState(student.report?.presence_days ?? '');
    const [absenceDays, setAbsenceDays]   = useState(student.report?.absence_days ?? '');
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await upsertPresence([{
                student_id: student.id,
                semester,
                presence_days: Number(presenceDays) || 0,
                absence_days:  Number(absenceDays) || 0,
            }]);
            onSave(student.id, {
                presence_days: Number(presenceDays) || 0,
                absence_days:  Number(absenceDays) || 0,
            });
            closeModal();
        } catch (e) {
            toastsActions.addFromError(e, 'שגיאה בשמירת הנוכחות');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-3" dir="rtl">
            <label className="flex items-center gap-2">
                <span className="w-28 text-sm">ימי נוכחות</span>
                <input
                    type="number" min="0"
                    value={presenceDays}
                    onChange={e => setPresenceDays(e.target.value)}
                    className="w-24 border border-border rounded px-2 py-1 text-center"
                />
            </label>
            <label className="flex items-center gap-2">
                <span className="w-28 text-sm">ימי היעדרות</span>
                <input
                    type="number" min="0"
                    value={absenceDays}
                    onChange={e => setAbsenceDays(e.target.value)}
                    className="w-24 border border-border rounded px-2 py-1 text-center"
                />
            </label>
            <div className="flex gap-2">
                <Button data-role="save" onClick={save} disabled={saving}>
                    {saving ? '...' : 'שמור'}
                </Button>
                <Button data-role="cancel" onClick={closeModal}>ביטול</Button>
            </div>
        </div>
    );
}


function LatenessEditor({ student, semester, closeModal, onSave }) {
    const [latenessCount, setLatenessCount] = useState(student.report?.lateness_count ?? '');
    const [lateness, setLateness]           = useState(student.report?.lateness ?? '');
    const [saving, setSaving] = useState(false);

    const gKey = pronounsKey(student.report?.pronouns);
    const labels = LATENESS[gKey];

    const save = async () => {
        setSaving(true);
        try {
            await upsertPresence([{
                student_id:     student.id,
                semester,
                presence_days:  student.report?.presence_days ?? 0,
                absence_days:   student.report?.absence_days ?? 0,
                lateness_count: latenessCount !== '' ? Number(latenessCount) : null,
                lateness:       lateness || null,
            }]);
            onSave(student.id, {
                lateness_count: latenessCount !== '' ? Number(latenessCount) : null,
                lateness:       lateness || null,
            });
            closeModal();
        } catch (e) {
            toastsActions.addFromError(e, 'שגיאה בשמירת האיחורים');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-3" dir="rtl">
            <label className="flex items-center gap-2">
                <span className="w-28 text-sm">מספר איחורים <span className="text-stone-400">(ממשו"ב)</span></span>
                <input
                    type="number" min="0"
                    value={latenessCount}
                    onChange={e => setLatenessCount(e.target.value)}
                    className="w-24 border border-border rounded px-2 py-1 text-center"
                />
            </label>
            <div className="flex flex-col gap-1">
                <span className="text-sm">הערכת איחורים</span>
                {LATENESS_OPTIONS.map(key => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="lateness"
                            value={key}
                            checked={lateness === key}
                            onChange={() => setLateness(key)}
                        />
                        <span className="text-sm">{labels?.[key]}</span>
                    </label>
                ))}
            </div>
            <div className="flex gap-2">
                <Button data-role="save" onClick={save} disabled={saving}>
                    {saving ? '...' : 'שמור'}
                </Button>
                <Button data-role="cancel" onClick={closeModal}>ביטול</Button>
            </div>
        </div>
    );
}


function ImportPresenceModal({ semester, closeModal, onSave }) {
    const [matched, setMatched]     = useState(null); // resolved rows with student info
    const [unmatched, setUnmatched] = useState(null); // rows not found in app
    const [saving, setSaving]       = useState(false);
    const [fileName, setFileName]   = useState(null);
    const [parseError, setParseError] = useState(null);
    const fileRef = useRef();

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setParseError(null);
        setMatched(null);
        setUnmatched(null);

        try {
            // Parse XLSX on the server (ExcelJS is Node.js only)
            const formData = new FormData();
            formData.append('file', file);
            const parsed = await parseMashovXlsx(formData);

            const resolved = await resolveStudentsByIdNumber(parsed.map(r => Number(r.idNum)));
            const resolvedMap = Object.fromEntries(resolved.map(r => [r.id_number, r]));
            const matchedRows = [];
            const unmatchedRows = [];
            parsed.forEach(r => {
                const student = resolvedMap[r.idNum];
                if (student) {
                    matchedRows.push({ ...r, ...student });
                } else {
                    unmatchedRows.push(r);
                }
            });
            setMatched(matchedRows);
            setUnmatched(unmatchedRows);
        } catch (e) {
            setParseError(e.message);
        }
    };

    const confirmImport = async () => {
        if (!matched?.length) return;
        setSaving(true);
        try {
            await upsertPresence(matched.map(r => ({
                student_id:     r.student_id,
                semester,
                presence_days:  r.presence_days,
                absence_days:   r.absence_days,
                lateness_count: r.lateness_count,
                isImport:       true, // triggers clearing lateness + setting imported_at/by
            })));
            // Build update map for local state
            const updates = {};
            matched.forEach(r => {
                updates[r.student_id] = {
                    presence_days:  r.presence_days,
                    absence_days:   r.absence_days,
                    lateness_count: r.lateness_count,
                    lateness:       null,
                };
            });
            onSave(updates);
            closeModal();
        } catch (e) {
            toastsActions.addFromError(e, 'שגיאה ביבוא הנוכחות');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4" dir="rtl">
            <p className="text-sm text-stone-500">{'יש להעלות קובץ אקסל XLSX, שאותו ניתן להפיק מהמשו"ב, במסך יומן מחנך ← דוח כללי.'}</p>
            <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                className="hidden"
            />
            <div className="flex items-center gap-2">
                <Button onClick={() => fileRef.current?.click()}>בחר קובץ Excel</Button>
                <span className="text-sm text-stone-500">{fileName ?? 'לא נבחר קובץ'}</span>
                <Button data-role="cancel" onClick={closeModal}>ביטול</Button>
            </div>
            {parseError && (
                <p className="text-sm text-red-600">{parseError}</p>
            )}

            {matched && (
                <>
                    <div className="text-sm font-medium">תלמידים שזוהו ({matched.length})</div>
                    <div className="max-h-48 overflow-y-auto border border-border rounded">
                        <table className="text-xs w-full">
                            <thead className="bg-stone-100 sticky top-0">
                                <tr>
                                    {['שם', 'נוכחות', 'היעדרות', 'איחורים'].map(h => (
                                        <th key={h} className="p-1 text-center">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {matched.map(r => (
                                    <tr key={r.student_id} className="border-t border-border">
                                        <td className="p-1">{r.first_name} {r.last_name}</td>
                                        <td className="p-1 text-center">{r.presence_days}</td>
                                        <td className="p-1 text-center">{r.absence_days}</td>
                                        <td className="p-1 text-center">{r.lateness_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {unmatched?.length > 0 && (
                        <>
                            <div className="text-sm font-medium text-red-600">לא זוהו ({unmatched.length})</div>
                            <div className="text-xs text-stone-500">
                                {unmatched.map(r => r.idNum).join(', ')}
                            </div>
                        </>
                    )}

                    <div className="text-xs text-stone-500">
                        שים לב: יבוא חדש יאפס את הערכת האיחורים הידנית לתלמידים אלו.
                    </div>

                    <div className="flex gap-2">
                        <Button data-role="save" onClick={confirmImport} disabled={saving || !matched.length}>
                            {saving ? '...' : `יבא ${matched.length} תלמידים`}
                        </Button>
                        <Button data-role="cancel" onClick={closeModal}>ביטול</Button>
                    </div>
                </>
            )}
        </div>
    );
}
