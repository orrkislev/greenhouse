import RadarChart from "@/components/RadarChart";
import { ReportPageSection, SectionSubtitle, SectionText, SectionTitle } from "./Layout";

export default function Report_Projects({ student }) {

    if (student.year === '1' || student.year === '2') {
        return <Regular student={student} />;
    }
    if (student.year === '3') {
        return <Final student={student} />;
    }
    if (student.year === '4') {
        return <PersonalGoals student={student} />;
    }

    return null;
}

function TermSection({ project, research, term, student }) {
    if (!project && !research) return null;

    const data = [
        { subject: 'הגדרת יעדים', value: project?.['הגדרת יעדים']?.overview || 50 },
        { subject: 'הצגה ותיעוד', value: project?.['תכנון']?.overview || 50 },
        { subject: 'למידה וביצוע', value: project?.['למידה וביצוע']?.overview || 50 },
        { subject: 'תכנון', value: project?.['הצגה ותיעוד']?.overview || 50 },
    ];

    const smaller = student.year == 1;

    return (
        <div className='flex-1 flex flex-col'>
            <div className="flex gap-2 flex-1">
                <div className="flex-1 flex flex-col">
                    <SectionTitle className='underline'>{term}</SectionTitle>
                    <SectionSubtitle>פרויקט ה{project?.term || term} - <span className='text-2xl'>{project?.title}</span></SectionSubtitle>
                    {project?.master?.first_name && (
                        <SectionText smaller className="text-muted-foreground -mt-2">בליווי {project?.master?.first_name}</SectionText>
                    )}
                    <SectionText smaller className="italic mt-1">{project?.summary}</SectionText>

                    <SectionSubtitle className="mt-4">חקר ה{term} - {research?.title}</SectionSubtitle>
                    <SectionText smaller className="italic">{research?.summary}</SectionText>
                </div>
                <div className="flex items-start justify-start p-8">
                    <RadarChart data={data} size={200} />
                </div>
            </div>
        </div>
    );
}

function Regular({ student }) {
    const autumnProject = student.autumn_project;
    const autumnResearch = student.autumn_research;
    const winterProject = student.winter_project;
    const winterResearch = student.winter_research;

    return (
        <ReportPageSection title="פרויקטים" className="flex-1">
            <div className='w-full flex-1 h-full flex flex-col gap-4'>
                <TermSection project={autumnProject} research={autumnResearch} term="סתיו" student={student}/>
                <TermSection project={winterProject} research={winterResearch} term="חורף" student={student}/>
            </div>
        </ReportPageSection>
    )
}

function Final({ student }) {
    const finalProject = student.special;

    const radarData = finalProject?.radar || [
        { subject: 'הצבת יעדים', value: 50 },
        { subject: 'תכנון', value: 50 },
        { subject: 'למידה', value: 50 },
        { subject: 'ביצוע', value: 50 },
        { subject: 'הצגה', value: 50 },
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
                        <RadarChart data={radarData} size={150} />
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
        { subject: 'תכנון', value: 50 },
        { subject: 'למידה', value: 50 },
        { subject: 'ביצוע', value: 50 },
        { subject: 'רכישת מקצוע', value: 50 },
        { subject: 'הצגה', value: 50 }
    ];

    return (
        <ReportPageSection title="מטרות אישיות" className="flex-1">
            <div className='w-full flex-1 h-full flex flex-col gap-4 justify-between pb-8'>
                {/* Goals Section - Side by Side */}
                {(personalGoals?.initialGoals?.some(g => g) || personalGoals?.updatedGoals?.some(g => g)) && (
                    <div className="flex gap-6">
                        {/* Initial Goals */}
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

                        {/* Updated Goals */}
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