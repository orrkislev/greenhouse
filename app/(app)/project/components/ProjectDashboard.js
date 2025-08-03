import { projectActions, useProject } from "@/utils/store/useProject";
import ProjectTasks from "./Project Tasks/ProjectTasks";
import ProjectGoals from "./ProjectGoals";
import ProjectMaster from "./ProjectMaster";
import { ChevronLeft, Pencil } from "lucide-react";
import { useState } from "react";



export default function ProjectDashboard() {
    const project = useProject((state) => state.project);

    return (
        <div className="min-h-screen p-4" dir="rtl">
            <div className="max-w-7xl mx-auto flex gap-1 h-screen">
                <div className="flex-[2] gap-1 flex flex-col">
                    <div className="flex gap-1">
                        <ProjectName />
                        <ProjectMaster />
                    </div>

                    <ProjectGoals />
                    <ProjectTasks />
                </div>

                <div className="flex-1 flex gap-1 flex-col">
                    <div className="p-4 h-64 flex items-center justify-center border border-gray-300">
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
                    <div className="flex flex-col gap-1">
                        <div className="p-3 flex items-center justify-between border border-gray-300">
                            <span className="text-sm text-gray-700">נושא מחקר רלוונטי 1</span>
                            <span className="text-gray-400">
                                <ChevronLeft className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="p-3 flex items-center justify-between border border-gray-300">
                            <span className="text-sm text-gray-700">נושא מחקר רלוונטי 2</span>
                            <span className="text-gray-400">
                                <ChevronLeft className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="p-3 flex items-center justify-between border border-gray-300">
                            <span className="text-sm text-gray-700">נושא מחקר רלוונטי 3</span>
                            <span className="text-gray-400">
                                <ChevronLeft className="w-4 h-4" />
                            </span>
                        </div>
                    </div>

                    {/* Close project button */}
                    <button className="px-4 py-2 border border-red-800 text-red-600 hover:bg-red-800 hover:text-white transition-colors" onClick={() => projectActions.closeProject()}>
                        סגירת הפרויקט
                    </button>
                </div>

            </div>
        </div>
    );
}


function ProjectName() {
    const project = useProject((state) => state.project);
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="flex-[2] p-4 border border-gray-300 group relative h-full">
            {isEditing ? (
                <input type="text" 
                    defaultValue={project.name}
                    className="w-full h-full"
                    autoFocus
                    onBlur={(e) => {
                        projectActions.updateProject({ ...project, name: e.target.value });
                        setIsEditing(false);
                    }} />
            ) : (
                <>
                    <h3 className="text-center text-gray-700 font-medium">{project.name}</h3>
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-50 hover:opacity-100 hover:bg-gray-200 rounded-full transition-opacity duration-200 p-1 cursor-pointer" onClick={() => setIsEditing(true)}>
                        <Pencil className="w-4 h-4" />
                    </div>
                </>
            )}
        </div>
    );
}