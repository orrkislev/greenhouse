// Each section's full descriptor.
// `columns` drives the staff evaluation table (one entry per table column).
// `component` names the React component the report page and print report use.
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
        label: 'ועדה למגמות',
        component: 'SummerEval',
        dataKey: 'majors',
        columns: [
            { label: 'ועדה למגמות', check: r => !!r?.majors, navFn: 'report', navArg: 'majors' },
        ],
    },
    finalProject: {
        key: 'finalProject',
        label: 'פרויקט גמר',
        component: 'FinalProject',
        dataKey: 'special',
        columns: [
            { label: 'פרויקט גמר', check: r => r?.special?.summary?.length > 10, bad: r => !r?.special, navFn: 'report', navArg: 'finalProject' },
        ],
    },
    finalProject_B: {
        key: 'finalProject_B',
        label: 'פרויקט גמר',
        component: 'FinalProject',
        dataKey: 'special',
        columns: [
            { label: 'פרויקט גמר', check: r => r?.special?.summary?.length > 10, bad: r => !r?.special, navFn: 'report', navArg: 'finalProject_B' },
        ],
    },
    personalGoals: {
        key: 'personalGoals',
        label: 'מטרות אישיות',
        component: 'PersonalGoals',
        dataKey: 'special',
        columns: [
            { label: 'מטרות אישיות', check: r => r?.special?.summary?.length > 10, bad: r => !r?.special, navFn: 'report', navArg: 'personalGoals' },
        ],
    },
    POL: {
        key: 'POL',
        label: 'P.O.L',
        component: 'POL',
        dataKey: 'end_eval',
        columns: [
            { label: 'P.O.L', check: r => !!r?.end_eval, navFn: 'report', navArg: 'POL' },
        ],
    },
};

// Which sections appear for each year × semester combination.
export const REPORT_SECTIONS = {
    '1': { 'A': ['autumn', 'winter'],  'B': ['spring', 'majors'] },
    '2': { 'A': ['autumn', 'winter'],  'B': ['spring', 'POL'] },
    '3': { 'A': ['finalProject'],      'B': ['finalProject_B', 'POL'] },
    '4': { 'A': ['personalGoals'],     'B': ['POL', 'finalProject_B'] },
};

export function getYearSections(year, semester) {
    return (REPORT_SECTIONS[String(year)]?.[String(semester)] ?? []).map(k => SECTION_DEFS[k]);
}