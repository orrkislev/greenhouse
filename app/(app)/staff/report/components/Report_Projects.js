import RadarChart from "@/components/RadarChart";
import { ReportPageSection, SectionSubtitle, SectionText, SectionTitle } from "./Layout";

export default function Report_Projects({ student, group }) {

    if (group.description === '1' || group.description === '2') {
        return <Regular student={student} />;
    }
    if (group.description === '3') {
        return <Final student={student} />;
    }
    if (group.description === '4') {
        return <PersonalGoals student={student} />;
    }

    return null;
}

function TermSection({ project, research, term }) {
    if (!project && !research) return null;

    const data = [
        { subject: 'הגדרת יעדים', value: project?.['הגדרת יעדים']?.overview || 50 },
        { subject: 'הצגה ותיעוד', value: project?.['תכנון']?.overview || 50 },
        { subject: 'למידה וביצוע', value: project?.['למידה וביצוע']?.overview || 50 },
        { subject: 'תכנון', value: project?.['הצגה ותיעוד']?.overview || 50 },
    ];

    return (
        <div className='flex-1 flex flex-col'>
            <div className="flex gap-2 flex-1">
                <div className="flex-1 flex flex-col">
                    <SectionSubtitle>פרויקט ה{project?.term || term}</SectionSubtitle>
                    <SectionText className="font-bold">{project?.title}</SectionText>
                    {project?.master?.first_name && (
                        <SectionText className="text-muted-foreground">בליווי {project?.master?.first_name}</SectionText>
                    )}
                    <SectionText className="italic mt-1">{project?.summary}</SectionText>

                    <SectionSubtitle className="mt-2">חקר ה{term}</SectionSubtitle>
                    <SectionText className="font-bold">{research?.title}</SectionText>
                    <SectionText className="italic">{research?.summary}</SectionText>
                </div>
                <div className="flex items-start justify-start p-8">
                    <RadarChart data={data} size={120} />
                </div>
            </div>
        </div>
    );
}

function Regular({ student }) {
    const autumnProject = student.student?.autumn_project;
    const autumnResearch = student.student?.autumn_research;
    const winterProject = student.student?.winter_project;
    const winterResearch = student.student?.winter_research;

    return (
        <ReportPageSection title="פרויקטים" className="flex-1">
            <div className='w-full flex-1 h-full flex flex-col gap-4'>
                <TermSection project={autumnProject} research={autumnResearch} term="סתיו" />
                <TermSection project={winterProject} research={winterResearch} term="חורף" />
            </div>
        </ReportPageSection>
    )
}

function Final({ student }) {
    const finalProject = student.student?.special;

    const radarData = finalProject?.radar || [
        { subject: 'הצבת יעדים', value: 50 },
        { subject: 'תכנון', value: 50 },
        { subject: 'למידה', value: 50 },
        { subject: 'ביצוע', value: 50 },
        { subject: 'הצגה', value: 50 },
    ];

    return (
        <ReportPageSection title="פרויקט גמר" className="flex-1">
            <div className='w-full flex-1 h-full flex flex-col gap-4'>
                <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                        <SectionSubtitle>פרויקט הגמר</SectionSubtitle>
                        <SectionText className="font-bold text-lg">{finalProject?.title || "ללא כותרת"}</SectionText>
                        {finalProject?.master?.first_name && (
                            <SectionText className="text-muted-foreground">בליווי {finalProject?.master?.first_name}</SectionText>
                        )}
                        <SectionText className="italic mt-2">{finalProject?.reflections_project || ""}</SectionText>
                    </div>
                    <div className="flex items-center justify-center">
                        <RadarChart data={radarData} size={150} />
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-2">
                    <SectionSubtitle>החקר</SectionSubtitle>
                    <SectionText className="italic">{finalProject?.reflections_project || ""}</SectionText>
                </div>

                <div className="flex-1 flex flex-col gap-2 bg-gray-50 p-3 rounded">
                    <SectionSubtitle>צעדים הבאים</SectionSubtitle>
                    <SectionText className="italic text-muted-foreground">{finalProject?.next_steps || ""}</SectionText>
                </div>
            </div>
        </ReportPageSection>
    )
}

function PersonalGoals({ student }) {
    const personalGoals = student.student?.special;

    const defaultRadarData = [
        { subject: 'תכנון', value: 50 },
        { subject: 'למידה', value: 50 },
        { subject: 'ביצוע', value: 50 },
        { subject: 'רכישת מקצוע', value: 50 },
        { subject: 'הצגה', value: 50 }
    ];

    return (
        <ReportPageSection title="מטרות אישיות" className="flex-1">
            <div className='w-full flex-1 h-full flex flex-col gap-4'>
                {/* Goals Section - Side by Side */}
                {(personalGoals?.initialGoals?.some(g => g) || personalGoals?.updatedGoals?.some(g => g)) && (
                    <div className="flex gap-6">
                        {/* Initial Goals */}
                        {personalGoals?.initialGoals?.some(g => g) && (
                            <div className="flex-1">
                                <SectionSubtitle>מטרות מתחילת השנה</SectionSubtitle>
                                <ol className='list-decimal list-inside space-y-1'>
                                    {personalGoals.initialGoals.filter(g => g).map((goal, index) => (
                                        <li key={index}><SectionText className="inline">{goal}</SectionText></li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* Updated Goals */}
                        {personalGoals?.updatedGoals?.some(g => g) && (
                            <div className="flex-1">
                                <SectionSubtitle>מטרות מעודכנות</SectionSubtitle>
                                <ol className='list-decimal list-inside space-y-1'>
                                    {personalGoals.updatedGoals.filter(g => g).map((goal, index) => (
                                        <li key={index}><SectionText className="inline">{goal}</SectionText></li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                )}

                {/* Question/Answer Section (mode === 'questions') */}
                {personalGoals?.mode === 'questions' && personalGoals?.answer && (
                    <div className="pt-2 border-t border-gray-200">
                        <SectionSubtitle>דברים שעשיתי</SectionSubtitle>
                        <SectionText className="italic">{personalGoals.answer}</SectionText>
                    </div>
                )}

                {/* Radar Chart Section (mode === 'radar') */}
                {personalGoals?.mode === 'radar' && (
                    <div className="pt-2 border-t border-gray-200">
                        <div className="flex gap-4">
                            <div className="flex items-center justify-center">
                                <RadarChart data={personalGoals?.radarData || defaultRadarData} size={150} />
                            </div>
                            {personalGoals?.summary && (
                                <div className="flex-1 flex items-center">
                                    <SectionText className="italic">{personalGoals.summary}</SectionText>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ReportPageSection>
    )
}