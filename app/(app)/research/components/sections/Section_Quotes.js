import SmartText from "@/components/SmartText";
import { researchActions } from "@/utils/store/useResearch";
import { Quote } from "lucide-react";

export default function Section_quotes({ section }) {

    const quotes = section.content.quotes || Array(2).fill("ציטוט");

    const updateQuote = (index, value) => {
        const quotes = section.content.quotes || Array(2).fill("ציטוט");
        quotes[index] = value;
        researchActions.updateSection(section.id, { quotes });
    }

    return (
            <div className="grid grid-cols-2 gap-2">
                {quotes.map((quote, index) => (
                    <div key={index} className="rounded-md bg-white border">
                        <div className="text-sm italic flex items-center justify-between p-1">
                            <Quote className="w-4 h-4 inline-block mr-2" />
                            <SmartText text={quote} onEdit={(value) => updateQuote(index, value)} />
                            <Quote className="w-4 h-4 inline-block ml-2 rotate-180" />
                        </div>
                    </div>
                ))}
            </div>
    )
}