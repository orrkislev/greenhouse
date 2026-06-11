import RadarChart from "@/components/RadarChart";
import { getYearSections } from "@/utils/reportConfig";
import { ReportPageSection, SectionSubtitle, SectionText, SectionTitle } from "./Layout";

export default function Report_Projects({ student, variant, semester }) {
    if (variant === 'regular') return <Regular student={student} semester={semester} />;
    if (variant === 'final')   return <Final student={student} />;
    if (variant === 'goals')   return <PersonalGoals student={student} />;
    return null;
}

function TermSection({ project, research, term }) {
    if (!project && !research) return null;

    const data = [
        { subject: 'הגדרת יעדים', value: project?.['הגדרת יעדים']?.overview || 0 },
        { subject: 'הצגה ותיעוד', value: project?.['הצגה ותיעוד']?.overview || 0 },
        { subject: 'למידה וביצוע', value: project?.['למידה וביצוע']?.overview || 0 },
        { subject: 'תכנון', value: project?.['תכנון']?.overview || 0 },
    ];

    return (
        <div className='flex-1 flex flex-col'>
            <div className="flex gap-8 items-start">
                <div className="flex-1 flex flex-col">
                    <SectionTitle className='underline'>{term}</SectionTitle>
                    <SectionSubtitle>פרויקט ה{project?.term || term} - <span className='text-2xl'>{project?.title}</span></SectionSubtitle>
                    {project?.master?.first_name && (
                        <SectionText smaller className="text-muted-foreground -mt-2">בליווי {project?.master?.first_name}</SectionText>
                    )}
                    <SectionText smaller className="italic mt-1">{project?.summary}</SectionText>
                </div>
                <div className="flex-shrink-0 pt-2">
                    <RadarChart data={data} size={200} />
                </div>
            </div>
            <div className="mt-6">
                <SectionSubtitle>חקר ה{term} - {research?.title}</SectionSubtitle>
                <SectionText smaller className="italic">{research?.summary}</SectionText>
            </div>
        </div>
    );
}

// Semester-aware: reads which term sections to display from REPORT_SECTIONS via getYearSections.
// To add winter alongside spring for year 2 Sem B, just update REPORT_SECTIONS['2']['B'] — no change here needed.
function Regular({ student, semester }) {
    const semesterLetter = semester?.slice(-1); // 'A' or 'B'
    const termSections = getYearSections(student.year, semesterLetter)
        .filter(s => s.projectKey);

    return (
        <ReportPageSection title="פרויקטים" className="flex-1">
            <div className='w-full flex-1 h-full flex flex-col gap-4'>
                {termSections.map(section => (
                    <TermSection
                        key={section.key}
                        project={student[section.projectKey]}
                        research={student[section.researchKey]}
                        term={section.termName}
                    />
                ))}
            </div>
        </ReportPageSection>
    );
}

function Final({ student }) {
    const finalProject = student.special;

    const radarData = finalProject?.radar || [
        { subject: 'הצבת יעדים', value: 0 },
        { subject: 'תכנון', value: 0 },
        { subject: 'למידה', value: 0 },
        { subject: 'ביצוע', value: 0 },
        { subject: 'הצגה', value: 0 },
    ];

    return (
        <ReportPageSection title="פרויקט גמר" className="flex-5">
            <div className='w-full flex-1 h-full flex flex-col gap-4'>
                <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                        <SectionSubtitle>פרויקט הגמר</SectionSubtitle>
                        <SectionText className="font-bold text-lg">{finalProject?.project_title || "ללא כותרת"}</SectionText>
                        {finalProject?.master_name && (
                            <SectionText className="text-muted-foreground">בליווי {finalProject?.master_name}</SectionText>
                        )}
                        <SectionText className="italic mt-2">{finalProject?.reflections_project || ""}</SectionText>
                    </div>
                    <div className="flex items-center justify-center">
                        <RadarChart data={radarData} size={250} />
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-2">
                    <SectionSubtitle>החקר</SectionSubtitle>
                    <SectionText className="italic">{finalProject?.reflections_research || ""}</SectionText>
                </div>

                <div className="flex-1 flex flex-col gap-2 bg-[#f9fafb] p-3 rounded">
                    <SectionSubtitle>צעדים הבאים</SectionSubtitle>
                    <SectionText className="italic text-muted-foreground">{finalProject?.next_steps || ""}</SectionText>
                </div>
            </div>
        </ReportPageSection>
    )
}

function PersonalGoals({ student }) {
    const personalGoals = student.special;

    const defaultRadarData = [
        { subject: 'תכנון', value: 0 },
        { subject: 'למידה', value: 0 },
        { subject: 'ביצוע', value: 0 },
        { subject: 'רכישת מקצוע', value: 0 },
        { subject: 'הצגה', value: 0 }
    ];

    return (
        <ReportPageSection title="מטרות אישיות" className="flex-1">
            <div className='w-full flex-1 h-full flex flex-col gap-4 justify-between pb-8'>
                {(personalGoals?.initialGoals?.some(g => g) || personalGoals?.updatedGoals?.some(g => g)) && (
                    <div className="flex gap-6">
                        {personalGoals?.initialGoals?.some(g => g) && (
                            <div className="flex-1">
                                <SectionSubtitle>מטרות מתחילת השנה</SectionSubtitle>
                                <ol className='list-decimal list-inside space-y-1' contentEditable suppressContentEditableWarning>
                                    {personalGoals.initialGoals.filter(g => g).map((goal, index) => (
                                        <li key={index}>{goal}</li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {personalGoals?.updatedGoals?.some(g => g) && (
                            <div className="flex-1">
                                <SectionSubtitle>מטרות מעודכנות</SectionSubtitle>
                                <ol className='list-decimal list-inside space-y-1' contentEditable suppressContentEditableWarning>
                                    {personalGoals.updatedGoals.filter(g => g).map((goal, index) => (
                                        <li key={index}>{goal}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                )}

                {personalGoals?.mode === 'questions' && personalGoals?.answer && (
                    <div className="pt-2 border-t border-gray-200">
                        <SectionSubtitle>דברים שעשיתי</SectionSubtitle>
                        <SectionText className="italic">{personalGoals.answer}</SectionText>
                    </div>
                )}

                {personalGoals?.mode === 'radar' && (
                    <div className="pt-2 border-t border-gray-200">
                        <div className="flex gap-8">
                            {personalGoals?.summary && (
                                <div className="flex-1 flex flex-col">
                                    <SectionSubtitle>פרויקט גמר</SectionSubtitle>
                                    <SectionText className="text-muted-foreground">בליווי ערן</SectionText>
                                    <SectionText className="italic">{personalGoals.summary}</SectionText>
                                </div>
                            )}

                            <div className="flex items-center justify-center">
                                <RadarChart data={personalGoals?.radarData || defaultRadarData} size={250} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ReportPageSection>
    )
}
