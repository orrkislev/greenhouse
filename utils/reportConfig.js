import { hasLearningAlerts } from './learningWarnings';

// Each section's full descriptor.
// `component`      — interactive React component name (used by report/page.js)
// `printComponent` — print React component name (used by PrintReportPage.js)
// `printVariant`   — optional variant prop passed to the print component
// `columns`        — drives the staff evaluation table (one entry per table column)
//   Each column has a `status(r)` function returning one of:
//     'empty'     → red:    required section with nothing entered
//     'partial'   → orange: in progress but incomplete
//     'attention' → yellow: student done; staff must still act (write review / add rating)
//     'complete'  → green:  fully done
//   (A future 'na' state is reserved for sections irrelevant to a specific student.)
// `marker(r)`      — optional; return true to show an alert dot on the dashboard button
export const SECTION_DEFS = {
    autumn: {
        key: 'autumn',
        label: 'תקופת סתו',
        component: 'Term',
        termName: 'סתו',
        projectKey: 'autumn_project',
        researchKey: 'autumn_research',
        marker: r => !r?.autumn_project || !r?.autumn_research,
        columns: [
            {
                label: 'פרויקט סתו',
                // empty: no project linked; partial: project exists but review not written; complete: review summary written (>10 chars)
                status: r => !r?.autumn_project ? 'empty' : r.autumn_project.summary?.length > 10 ? 'complete' : 'partial',
                navFn: 'project', navArg: 'autumn_project', termKey: 'autumn',
            },
            {
                label: 'חקר סתו',
                status: r => !r?.autumn_research ? 'empty' : r.autumn_research.summary?.length > 10 ? 'complete' : 'partial',
                navFn: 'research', navArg: 'autumn_research',
            },
        ],
    },
    winter: {
        key: 'winter',
        label: 'תקופת חורף',
        component: 'Term',
        termName: 'חורף',
        projectKey: 'winter_project',
        researchKey: 'winter_research',
        marker: r => !r?.winter_project || !r?.winter_research,
        columns: [
            {
                label: 'פרויקט חורף',
                status: r => !r?.winter_project ? 'empty' : r.winter_project.summary?.length > 10 ? 'complete' : 'partial',
                navFn: 'project', navArg: 'winter_project', termKey: 'winter',
            },
            {
                label: 'חקר חורף',
                status: r => !r?.winter_research ? 'empty' : r.winter_research.summary?.length > 10 ? 'complete' : 'partial',
                navFn: 'research', navArg: 'winter_research',
            },
        ],
    },
    spring: {
        key: 'spring',
        label: 'תקופת אביב',
        component: 'Term',
        termName: 'אביב',
        projectKey: 'spring_project',
        researchKey: 'spring_research',
        marker: r => !r?.spring_project || !r?.spring_research,
        columns: [
            {
                label: 'פרויקט אביב',
                status: r => !r?.spring_project ? 'empty' : r.spring_project.summary?.length > 10 ? 'complete' : 'partial',
                navFn: 'project', navArg: 'spring_project', termKey: 'spring',
            },
            {
                label: 'חקר אביב',
                status: r => !r?.spring_research ? 'empty' : r.spring_research.summary?.length > 10 ? 'complete' : 'partial',
                navFn: 'research', navArg: 'spring_research',
            },
        ],
    },
    summer: {
        key: 'summer',
        label: 'תקופת קיץ',
        component: 'SummerEval',
        dataKey: 'end_eval',
        marker: r => !r?.end_eval,
        columns: [
            { label: 'קיץ', status: r => r?.end_eval ? 'complete' : 'empty', navFn: 'report', navArg: 'summer' },
        ],
    },
    majors: {
        key: 'majors',
        label: 'תקופת קיץ',
        component: 'SummerEval',
        dataKey: 'end_eval',
        printComponent: 'Report_Majors',
        // end_eval stores the summer evaluation (portfolio + majors acceptance); there is no separate 'majors' field
        marker: r => !r?.end_eval,
        columns: [
            { label: 'ועדה למגמות', status: r => r?.end_eval ? 'complete' : 'empty', navFn: 'report', navArg: 'majors' },
        ],
    },
    finalProject: {
        key: 'finalProject',
        label: 'פרויקט גמר',
        component: 'FinalProject',
        dataKey: 'special',
        printComponent: 'Report_Projects',
        printVariant: 'final',
        marker: r => !r?.special,
        columns: [
            {
                label: 'פרויקט גמר',
                // empty: no data; partial: data entered but summary not yet written; complete: summary written (>10 chars)
                status: r => !r?.special ? 'empty' : r.special.summary?.length > 10 ? 'complete' : 'partial',
                navFn: 'report', navArg: 'finalProject',
            },
        ],
    },
    finalProject_B: {
        key: 'finalProject_B',
        label: 'פרויקט גמר',
        component: 'FinalProject',
        dataKey: 'special',
        printComponent: 'Report_Projects',
        printVariant: 'final',
        marker: r => !r?.special,
        columns: [
            {
                label: 'פרויקט גמר',
                status: r => !r?.special ? 'empty' : r.special.summary?.length > 10 ? 'complete' : 'partial',
                navFn: 'report', navArg: 'finalProject_B',
            },
        ],
    },
    personalGoals: {
        key: 'personalGoals',
        label: 'מטרות אישיות',
        component: 'PersonalGoals',
        dataKey: 'special',
        printComponent: 'Report_Projects',
        printVariant: 'goals',
        marker: r => !r?.special,
        columns: [
            {
                label: 'מטרות אישיות',
                status: r => !r?.special ? 'empty' : r.special.summary?.length > 10 ? 'complete' : 'partial',
                navFn: 'report', navArg: 'personalGoals',
            },
        ],
    },
    POL: {
        key: 'POL',
        label: 'P.O.L',
        component: 'POL',
        dataKey: 'end_eval',
        printComponent: 'Report_POL',
        marker: r => !r?.end_eval,
        columns: [
            { label: 'P.O.L', status: r => r?.end_eval ? 'complete' : 'empty', navFn: 'report', navArg: 'POL' },
        ],
    },

    // ── Always-present sections (appear in all years/semesters) ──────────────
    ikigai:   { key: 'ikigai',   label: 'איקיגאי',      component: 'Ikigai',    dataKey: 'ikigai',        printComponent: 'Report_General' },
    liba:     { key: 'liba',     label: 'ליבה',          component: 'Liba',      dataKey: 'liba',          printComponent: 'Report_Liba' },
    learning: { key: 'learning', label: 'למידה',         component: 'Learning',  dataKey: 'learning',      printComponent: 'Report_Learning', marker: r => hasLearningAlerts(r?.learning) },
    vocation: { key: 'vocation', label: 'יזמות מקיימת', component: 'Vocation',  dataKey: 'vocation',      printComponent: 'Report_Vocation' },
    portfolio: { key: 'portfolio', label: 'פורטפוליו',  component: 'Portfolio', dataKey: 'portfolio_url', printComponent: 'Report_Portfolio', marker: r => !r?.portfolio_url },

    // ── Print-only sections ───────────────────────────────────────────────────
    // Term sections (autumn/winter/spring) are aggregated here by getYearSections
    projects_regular: { key: 'projects_regular', printComponent: 'Report_Projects', printVariant: 'regular' },
    chamama_logo:     { key: 'chamama_logo',     printComponent: 'ChamamaLogo' },
};

// Which interactive sections appear for each year × semester combination.
export const REPORT_SECTIONS = {
    '1': { 'A': ['autumn', 'winter'],  'B': ['spring', 'majors'] },
    '2': { 'A': ['autumn', 'winter'],  'B': ['spring', 'POL'] },
    '3': { 'A': ['finalProject'],      'B': ['finalProject_B', 'POL'] },
    '4': { 'A': ['personalGoals'],     'B': ['POL', 'finalProject_B'] },
};

export function getYearSections(year, semester) {
    return (REPORT_SECTIONS[String(year)]?.[String(semester)] ?? []).map(k => SECTION_DEFS[k]);
}

// Full ordered section list for the interactive dashboard, per year × semester.
// Replaces the mix of hardcoded buttons and getYearSections in report/page.js.
export const DASHBOARD_SECTIONS = {
    '1': {
        'A': ['ikigai', 'portfolio', 'liba', 'autumn', 'winter',            'learning', 'vocation'],
        'B': ['ikigai', 'portfolio', 'liba', 'spring', 'majors',            'learning', 'vocation'],
    },
    '2': {
        'A': ['ikigai', 'portfolio', 'liba', 'autumn', 'winter',            'learning', 'vocation'],
        'B': ['ikigai', 'portfolio', 'liba', 'spring', 'POL',               'learning', 'vocation'],
    },
    '3': {
        'A': ['ikigai', 'portfolio', 'liba', 'finalProject',                'learning', 'vocation'],
        'B': ['ikigai', 'portfolio', 'liba', 'finalProject_B', 'POL',       'learning', 'vocation'],
    },
    '4': {
        'A': ['ikigai', 'portfolio', 'liba', 'personalGoals',               'learning', 'vocation'],
        'B': ['ikigai', 'portfolio', 'liba', 'POL', 'finalProject_B',       'learning', 'vocation'],
    },
};

export function getDashboardSections(year, semester) {
    return (DASHBOARD_SECTIONS[String(year)]?.[String(semester)] ?? []).map(k => SECTION_DEFS[k]);
}

// Print layout per year × semester: array of A4 pages.
// Each page is either:
//   { type: 'resizable', top, bottom, initialRatio } — drag-to-resize pair
//   { type: 'stack', sections: [...] }               — fixed flex-column
// All keys reference SECTION_DEFS entries.
export const PRINT_REPORT_PAGES = {
    '1': {
        'A': [
            { type: 'resizable', top: 'ikigai',   bottom: 'liba',     initialRatio: 0.6 },
            { type: 'stack',     sections: ['projects_regular', 'portfolio'] },
            { type: 'resizable', top: 'learning', bottom: 'vocation', initialRatio: 0.5 },
            { type: 'stack',     sections: ['chamama_logo'] },
        ],
        'B': [
            { type: 'resizable', top: 'ikigai',   bottom: 'liba',     initialRatio: 0.6 },
            { type: 'stack',     sections: ['projects_regular', 'portfolio'] },
            { type: 'stack',     sections: ['majors'] },
            { type: 'resizable', top: 'learning', bottom: 'vocation', initialRatio: 0.5 },
            { type: 'stack',     sections: ['chamama_logo'] },
        ],
    },
    '2': {
        'A': [
            { type: 'resizable', top: 'ikigai',   bottom: 'liba',     initialRatio: 0.6 },
            { type: 'stack',     sections: ['projects_regular', 'portfolio'] },
            { type: 'resizable', top: 'learning', bottom: 'vocation', initialRatio: 0.5 },
            { type: 'stack',     sections: ['chamama_logo'] },
        ],
        'B': [
            { type: 'resizable', top: 'ikigai',   bottom: 'liba',     initialRatio: 0.6 },
            { type: 'stack',     sections: ['projects_regular', 'portfolio'] },
            { type: 'stack',     sections: ['POL'] },
            { type: 'resizable', top: 'learning', bottom: 'vocation', initialRatio: 0.5 },
            { type: 'stack',     sections: ['chamama_logo'] },
        ],
    },
    '3': {
        'A': [
            { type: 'resizable', top: 'ikigai',   bottom: 'liba',     initialRatio: 0.6 },
            { type: 'stack',     sections: ['finalProject', 'portfolio'] },
            { type: 'resizable', top: 'learning', bottom: 'vocation', initialRatio: 0.5 },
            { type: 'stack',     sections: ['chamama_logo'] },
        ],
        'B': [
            { type: 'resizable', top: 'ikigai',   bottom: 'liba',     initialRatio: 0.6 },
            { type: 'stack',     sections: ['finalProject_B', 'portfolio'] },
            { type: 'stack',     sections: ['POL'] },
            { type: 'resizable', top: 'learning', bottom: 'vocation', initialRatio: 0.5 },
            { type: 'stack',     sections: ['chamama_logo'] },
        ],
    },
    '4': {
        'A': [
            { type: 'resizable', top: 'ikigai',   bottom: 'liba',     initialRatio: 0.6 },
            { type: 'stack',     sections: ['personalGoals', 'portfolio'] },
            { type: 'resizable', top: 'learning', bottom: 'vocation', initialRatio: 0.5 },
            { type: 'stack',     sections: ['chamama_logo'] },
        ],
        'B': [
            { type: 'resizable', top: 'ikigai',   bottom: 'liba',     initialRatio: 0.6 },
            { type: 'stack',     sections: ['personalGoals', 'portfolio'] },
            { type: 'stack',     sections: ['POL'] },
            { type: 'resizable', top: 'learning', bottom: 'vocation', initialRatio: 0.5 },
            { type: 'stack',     sections: ['chamama_logo'] },
        ],
    },
};

export function getPrintPages(year, semester) {
    return PRINT_REPORT_PAGES[String(year)]?.[String(semester)] ?? [];
}

// ── Standalone status functions for always-present sections ──────────────────
// Used by both the staff evaluation table and the screen report card view.
// All take `r` = a row from report_cards_public (flat object: ikigai, liba, etc. as top-level fields).

// complete: any markers placed on the ikigai diagram
export const ikigaiStatus = r =>
    r?.ikigai?.markers?.length > 0 ? 'complete' : 'empty';

// complete: portfolio URL is set
export const portfolioStatus = r =>
    r?.portfolio_url ? 'complete' : 'empty';

// complete: both core question and answer filled; partial: only one of the three fields touched
export const libaStatus = r => {
    const l = r?.liba;
    const hasQ = !!l?.question?.trim();
    const hasA = !!l?.answer?.trim();
    if (!hasQ && !hasA && !l?.nextStep?.trim()) return 'empty';
    if (hasQ && hasA) return 'complete';
    return 'partial';
};

// attention: student has filled enough content but no staff ratings yet (staff must act).
// Thresholds mirror computeSectionWarnings: min 2 professional topics, all 5 heutagogy skills.
export const learningStatus = r => {
    const l = r?.learning;
    if (!l) return 'empty';

    // Old format (pre-migration to professionalTopics/generalTopics/heutagogySkills)
    if (l.topics !== undefined) return l.topics.some(t => t.name) ? 'partial' : 'empty';

    const profFilled = (l.professionalTopics || []).filter(t => t.name);
    const hetFilled  = (l.heutagogySkills    || []).filter(s => s.name);
    if (!profFilled.length && !hetFilled.length) return 'empty';

    const allTopics      = [...profFilled, ...(l.generalTopics || []).filter(t => t.name)];
    const hasStaffRating = allTopics.some(t => t.staffRating != null);
    const enoughProf     = profFilled.length >= 2; // min per computeSectionWarnings
    const allHeutagogy   = hetFilled.length >= 5;  // HEUTAGOGY_ROW_COUNT from learning/data.js

    if (enoughProf && allHeutagogy) return hasStaffRating ? 'complete' : 'attention';
    return 'partial';
};

// complete: employment answer is filled
export const vocationStatus = r =>
    r?.vocation?.employmentAnswer?.trim() ? 'complete' : 'empty';
