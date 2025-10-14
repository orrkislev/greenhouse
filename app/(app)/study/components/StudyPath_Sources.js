import SmartText from "@/components/SmartText"
import WithLabel from "@/components/WithLabel"
import { studyActions } from "@/utils/store/useStudy"
import { Trash2 } from "lucide-react"

export default function StudyPath_Sources({ path }) {

    return (
        <WithLabel label="מקורות מידע">
            <div className="flex gap-4 flex-wrap">
                <SmartText
                    text={"מקור מידע חדש"}
                    onEdit={(text) => studyActions.addSource(path.id, text)}
                    className="text-sm text-stone-500 bg-emerald-100 border border-emerald-300 rounded-md p-2"
                    withIcon={false}
                />
                {path.sources && path.sources.map((source,sourceIndex) => (
                    <div key={sourceIndex} className="flex gap-2 items-center bg-white border border-stone-300 rounded-md p-2 group/source">
                        <SmartText text={source}
                            onEdit={(text) => studyActions.updateSource(path.id, sourceIndex, text)}
                            withIcon={false}
                            className="text-sm text-stone-500"
                        />
                        <Trash2 className="w-4 h-4 cursor-pointer text-stone-500 opacity-0 group-hover/source:opacity-100 hover:bg-stone-300/50 transition-colors rounded-full" onClick={() => studyActions.deleteSource(path.id, sourceIndex)} />
                    </div>
                ))}
            </div>
        </WithLabel>
    )
}