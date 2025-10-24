import { useState } from "react"
import Button from "@/components/Button"
import { Plus } from "lucide-react"
import Step from "./components/Step"
import TaskModal from "@/components/TaskModal"
import { EnglishPathID, studyActions, studyUtils } from "@/utils/store/useStudy"

export default function Steps({ path }) {
    const [openNewStepModal, setOpenNewStepModal] = useState(false)
    const isEnglish = path.id === EnglishPathID

    const NewStepButton = (
        <Button className="border-none bg-emerald-500 hover:bg-emerald-600 text-white px-16 absolute bottom-0 right-1/2 translate-x-1/2"
            onClick={() => setOpenNewStepModal(true)}>
            {isEnglish ? 'New Learning Step' : 'שלב נוסף'}
            <Plus className="w-4 h-4 ml-2" />
        </Button>
    )

    return (
        <div key={path.id} className="flex gap-4 rtl">
            <div className="relative flex-1">
                <div className="flex pb-16">
                    <div className="flex-1 flex flex-col gap-8">
                        {path.steps.filter((_, index) => index % 2 == 0).map((step) => (
                            <Step key={step.id} path={path} step={step} side="right" />
                        ))}
                    </div>
                    <StepsMiddleLine path={path} />
                    <div className="flex-1 flex flex-col gap-8 pt-8">
                        {path.steps.filter((_, index) => index % 2 == 1).map((step) => (
                            <Step key={step.id} path={path} step={step} side="left" />
                        ))}
                    </div>
                </div>
                {NewStepButton}
            </div>
            <TaskModal isOpen={openNewStepModal} onClose={() => setOpenNewStepModal(false)} context={studyUtils.getContext(path.id)} />
        </div>
    )
}

function StepsMiddleLine() {
    return (
        <div className="w-16 flex justify-center relative">
            <div className="w-px h-full border-dashed border-r border-sky-600" />
            <div className="absolute left-1/2 -translate-x-1/2 w-px h-32 bg-linear-to-b from-stone-100 to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-32 bg-linear-to-t from-stone-100 to-transparent" />
        </div>
    )
}