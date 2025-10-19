import Button from "@/components/Button"
import SmartText from "@/components/SmartText"
import WithLabel from "@/components/WithLabel"
import { studyActions } from "@/utils/store/useStudy"
import { Plus, Trash2 } from "lucide-react"

export default function StudyPath_Sources({ path }) {

    return (
        <WithLabel label="מקורות מידע">
            <div className="flex gap-4 flex-wrap">
                <Button data-role="new" icon={Plus} onClick={() => studyActions.addSource(path.id, 'מקור מידע')} className='group/new-source'>
                    <Plus className="w-4 h-4 group-hover/new-source:rotate-90 transition-transform duration-200" />
                    מקור מידע חדש 
                </Button>
                {path.sources && path.sources.map((source,sourceIndex) => (
                    <div key={sourceIndex} className="flex items-center bg-white border border-stone-300 rounded-md p-2 group/source ">
                        <SmartText text={source}
                            onEdit={(text) => studyActions.updateSource(path.id, sourceIndex, text)}
                            withIcon={false}
                            className="text-sm text-stone-500"
                        />
                        <Trash2 className="mr-2 h-4 cursor-pointer text-stone-500 w-0 group-hover/source:w-4 opacity-0 group-hover/source:opacity-100 hover:bg-stone-300/50 transition-all rounded-full" onClick={() => studyActions.deleteSource(path.id, sourceIndex)} />
                    </div>
                ))}
            </div>
        </WithLabel>
    )
}