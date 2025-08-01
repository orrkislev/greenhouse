import { useProject } from "@/utils/useProject";
import ProjectTasks from "./Project Tasks/ProjectTasks";
import ProjectGoals from "./ProjectGoals";
import ProjectMaster from "./ProjectMaster";



export default function ProjectDashboard() {
    const project = useProject((state) => state.project);

    return (
        <div className="min-h-screen p-4" dir="rtl">
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 h-screen">
                {/* Main content area */}
                <div className="col-span-9 space-y-4">
                    {/* Top section with master data and project status */}
                    <div className="flex gap-6">
                        <div className="flex-3 bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="text-center text-gray-700 font-medium">מצב נוכחי של הפרויקט</h3>
                        </div>
                        <ProjectMaster />
                    </div>

                    {/* Action buttons row */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gray-200 rounded-lg p-4 text-center">
                            <span className="text-sm text-gray-700">משהו לוז</span>
                        </div>
                        <div className="bg-gray-200 rounded-lg p-4 text-center">
                            <span className="text-sm text-gray-700">פריצת דרך</span>
                        </div>
                        <div className="bg-gray-200 rounded-lg p-4 text-center">
                            <span className="text-sm text-gray-700">משימה</span>
                        </div>
                        <div className="bg-gray-200 rounded-lg p-4 text-center">
                            <span className="text-sm text-gray-700">עדכון</span>
                        </div>
                    </div>

                    <ProjectGoals />
                    <ProjectTasks />
                </div>

                <div className="col-span-3 space-y-4">
                    {/* Main description card */}
                    <div className="bg-white rounded-xl p-6 h-64 flex items-center justify-center shadow-sm border">
                        <div className="text-center text-gray-600">
                            <p className="text-sm leading-relaxed">
                                {project.questions.map((question, index) => (
                                    <span key={index} className="block mb-2">
                                        <strong>{question.title}</strong> - {question.value}
                                    </span>
                                ))}
                            </p>
                            <div className="mt-8 text-lg font-medium">
                                עריכה
                            </div>
                        </div>
                    </div>

                    {/* Research topics */}
                    <div className="space-y-2">
                        <div className="bg-gray-200 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-gray-700">נושא מחקר רלוונטי 1</span>
                            <span className="text-gray-400">▶</span>
                        </div>
                        <div className="bg-gray-200 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-gray-700">נושא מחקר רלוונטי 2</span>
                            <span className="text-gray-400">▶</span>
                        </div>
                        <div className="bg-gray-200 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-gray-700">נושא מחקר רלוונטי 3</span>
                            <span className="text-gray-400">▶</span>
                        </div>
                    </div>

                    {/* Close project button */}
                    <button className="bg-red-800 text-white px-4 py-2 rounded-md" onClick={() => projectActions.closeProject()}>
                        סגירת הפרויקט
                    </button>
                </div>

            </div>
        </div>
    );
}