// Each section's full descriptor.
// `component`      — interactive React component name (used by report/page.js)
// `printComponent` — print React component name (used by PrintReportPage.js)
// `printVariant`   — optional variant prop passed to the print component
// `columns`        — drives the staff evaluation table (one entry per table column)
export const SECTION_DEFS = {
    autumn: {
        key: 'autumn',
        label: 'תקופת סתו',
        component: 'Term',
        termName: 'סתו',
        projectKey: 'autumn_project',
        researchKey: 'autumn_research',
        columns: [
            { label: 'פרויקט סתו', check: r => r?.autumn_project?.summary?.length > 10, bad: r => !r?.autumn_project, navFn: 'project', navArg: 'autumn_project', termKey: 'autumn' },
            { label: 'חקר סתו',    check: r => r?.autumn_research?.summary?.length > 10, bad: r => !r?.autumn_research, navFn: 'research', navArg: 'autumn_research' },
        ],
    },
    winter: {
        key: 'winter',
        label: 'תקופת חורף',
        component: 'Term',
        termName: 'חורף',
        projectKey: 'winter_project',
        researchKey: 'winter_research',
        columns: [
            { label: 'פרויקט חורף', check: r => r?.winter_project?.summary?.length > 10, bad: r => !r?.winter_project, navFn: 'project', navArg: 'winter_project', termKey: 'winter' },
            { label: 'חקר חורף',    check: r => r?.winter_research?.summary?.length > 10, bad: r => !r?.winter_research, navFn: 'research', navArg: 'winter_research' },
        ],
    },
    spring: {
        key: 'spring',
        label: 'תקופת אביב',
        component: 'Term',
        termName: 'אביב',
        projectKey: 'spring_project',
        researchKey: 'spring_research',
        columns: [
            { label: 'פרויקט אביב', check: r => r?.spring_project?.summary?.length > 10, bad: r => !r?.spring_project, navFn: 'project', navArg: 'spring_project', termKey: 'spring' },
            { label: 'חקר אביב',    check: r => r?.spring_research?.summary?.length > 10, bad: r => !r?.spring_research, navFn: 'research', navArg: 'spring_research' },
        ],
    },
    summer: {
        key: 'summer',
        label: 'תקופת קיץ',
        component: 'SummerEval',
        dataKey: 'end_eval',
        columns: [
            { label: 'קיץ', check: r => !!r?.end_eval, navFn: 'report', navArg: 'summer' },
        ],
    },
    majors: {
        key: 'majors',
        label: 'תקופת קיץ',
        component: 'SummerEval',
        dataKey: 'end_eval',
        printComponent: 'Report_Majors',
        columns: [
            { label: 'ועדה למגמות', check: r => !!r?.majors, navFn: 'report', navArg: 'majors' },
        ],
    },
    finalProject: {
        key: 'finalProject',
        label: 'פרויקט גמר',
        component: 'FinalProject',
        dataKey: 'special',
        printComponent: 'Report_Projects',
        printVariant: 'final',
        columns: [
            { label: 'פרויקט גמר', check: r => r?.special?.summary?.length > 10, bad: r => !r?.special, navFn: 'report', navArg: 'finalProject' },
        ],
    },
    finalProject_B: {
        key: 'finalProject_B',
        label: 'פרויקט גמר',
        component: 'FinalProject',
        dataKey: 'special',
        printComponent: 'Report_Projects',
        printVariant: 'final',
        columns: [
            { label: 'פרויקט גמר', check: r => r?.special?.summary?.length > 10, bad: r => !r?.special, navFn: 'report', navArg: 'finalProject_B' },
        ],
    },
    personalGoals: {
        key: 'personalGoals',
        label: 'מטרות אישיות',
        component: 'PersonalGoals',
        dataKey: 'special',
        printComponent: 'Report_Projects',
        printVariant: 'goals',
        columns: [
            { label: 'מטרות אישיות', check: r => r?.special?.summary?.length > 10, bad: r => !r?.special, navFn: 'report', navArg: 'personalGoals' },
        ],
    },
    POL: {
        key: 'POL',
        label: 'P.O.L',
        component: 'POL',
        dataKey: 'end_eval',
        printComponent: 'Report_POL',
        columns: [
            { label: 'P.O.L', check: r => !!r?.end_eval, navFn: 'report', navArg: 'POL' },
        ],
    },

    // ── Always-present sections (appear in all years/semesters) ──────────────
    ikigai:   { key: 'ikigai',   label: 'איקיגאי',      component: 'Ikigai',    dataKey: 'ikigai',        printComponent: 'Report_General' },
    liba:     { key: 'liba',     label: 'ליבה',          component: 'Liba',      dataKey: 'liba',          printComponent: 'Report_Liba' },
    learning: { key: 'learning', label: 'למידה',         component: 'Learning',  dataKey: 'learning',      printComponent: 'Report_Learning' },
    vocation: { key: 'vocation', label: 'יזמות מקיימת', component: 'Vocation',  dataKey: 'vocation',      printComponent: 'Report_Vocation' },
    portfolio: { key: 'portfolio', label: 'פורטפוליו',   component: 'Portfolio', dataKey: 'portfolio_url', printComponent: 'Report_Portfolio' },

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
