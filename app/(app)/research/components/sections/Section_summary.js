
import { researchActions } from "@/utils/store/useResearch";

export default function Section_summary({ section }) {
    return (
        <textarea className="w-full h-full text-sm bg-white p-2 border rounded-md" value={section.content.summary} onChange={(e) => {
            researchActions.updateSection(section.id, { summary: e.target.value });
        }} />
    )
}