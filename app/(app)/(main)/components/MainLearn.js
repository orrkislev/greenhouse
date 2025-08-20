import Box2 from "@/components/Box2";
import { studyActions, useStudy } from "@/utils/store/useStudy";
import { useEffect } from "react";

export default function MainLearn() {
    const paths = useStudy((state) => state.paths);

    useEffect(() => {
        studyActions.loadPaths();
    }, [])

    return (
        <Box2 label="למידה" className="flex-1">
            <div className="flex flex-col gap-8">
                {paths.map((path) => (
                    <div key={path.id}>
                        <h1>{path.name}</h1>
                        <div className="flex flex-col gap-4">
                            {path.subjects.map((subject) => (
                                <div key={subject.id} className="mr-2">
                                    <div className="text-sm flex flex-col gap-1">
                                        <div className='flex-1 text-stone-400 text-xs'>{subject.name}</div>
                                        <div className='flex-3 text-stone-800 text-sm pr-4'>{subject.steps.find(step => !step.finished) ? subject.steps.find(step => !step.finished).source : ''}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Box2>
    )
}