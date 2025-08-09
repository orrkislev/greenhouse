import Box2 from "@/components/Box2";
import { studyActions, useStudy } from "@/utils/store/useStudy";
import { useEffect } from "react";

export default function MainLearn() {
    const paths = useStudy((state) => state.paths);

    useEffect(() => {
        studyActions.loadPaths();
    }, [])

    return (
        <Box2 label="למידה">
            <div className="flex flex-col gap-2">
                {paths.map((path) => (
                    <div key={path.id}>
                        <h1>{path.name}</h1>
                        {path.subjects.map((subject) => (
                            <div key={subject.id} className="mr-2">
                                <div className="text-sm flex gap-1">
                                    <div className='flex-1'>{subject.name}{' - '}</div>
                                    <div className='flex-3'>{subject.steps.find(step => !step.finished) ? subject.steps.find(step => !step.finished).text : ''}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </Box2>
    )
}