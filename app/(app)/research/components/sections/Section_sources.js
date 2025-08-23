import SmartText from "@/components/SmartText";
import { researchActions } from "@/utils/store/useResearch";

export default function Section_sources({ section }) {

    const sources = section.content.sources || Array(4).fill("");

    const updateSource = (index, value) => {
        const sources = section.content.sources || Array(4).fill("");
        sources[index] = value;
        researchActions.updateSection(section.id, { sources });
    }

    return (
        <div className="grid grid-cols-4 gap-2">
            {sources.map((source, index) => (
                <div key={index} className="rounded-md bg-white border">
                    <SmartText text={source} onEdit={(value) => updateSource(index, value)} />
                </div>
            ))}
        </div>
    )
}