import { researchActions, useResearchData } from "@/utils/store/useResearch";
import Box2 from "@/components/Box2";
import { FileText } from "lucide-react";

export default function Section_summary() {
    const research = useResearchData(state => state.research)

    const updateSummary = (value) => {
        researchActions.updateSections({ summary: value });
    }

    return (
        <Box2 label="תקציר קצר" LabelIcon={FileText} className="row-span-3">
            <div className="flex flex-col justify-between h-full mb-8 overflow-y-auto"> 
                <div contentEditable={true} suppressContentEditableWarning onBlur={(e) => updateSummary(e.target.innerText)} className="w-full h-full text-sm bg-white p-2 border rounded-md">
                    {research?.sections?.summary || ''}
                </div>
            </div>
        </Box2>

    )
}