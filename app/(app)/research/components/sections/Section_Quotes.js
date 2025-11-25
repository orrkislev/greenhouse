import Box2 from "@/components/Box2";
import { IconButton } from "@/components/Button";
import { researchActions, useResearchData } from "@/utils/store/useResearch";
import { Quote, Plus, Trash2 } from "lucide-react";
import TextInput from "./TextInput";

export default function Section_quotes() {
    const research = useResearchData(state => state.research)

    if (!research) return null;

    const quotes = research?.sections?.quotes || [];

    const updateQuote = (index, value) => {
        const newQuotes = [...quotes];
        newQuotes[index] = value;
        researchActions.updateSections({ quotes: newQuotes });
    }

    const removeQuote = (index) => {
        const newQuotes = [...quotes];
        newQuotes.splice(index, 1);
        researchActions.updateSections({ quotes: newQuotes });
    }

    const addQuote = () => {
        const newQuotes = [...quotes, ''];
        researchActions.updateSections({ quotes: newQuotes });
    }

    return (
        <Box2 label="ציטוטים" LabelIcon={Quote} className="row-span-3">
            <div className="flex flex-col justify-between h-full mb-8 overflow-y-auto">
                {quotes.map((quote, index) => (
                    <div key={index} className="pb-2 flex gap-2 justify-between group/quote transition-all h-[fit-content] border-b border-border items-center">
                        <Quote className="w-4 h-4 self-start" />
                        <TextInput onChange={(value) => updateQuote(index, value)} value={quote} className="text-sm italic w-full outline-none transition-all duration-200 cursor-text leading-tight" />
                        <Quote className="w-4 h-4 rotate-180 self-end" />
                        <IconButton icon={Trash2} onClick={() => removeQuote(index)} className="p-2 hover:bg-muted rounded-full opacity-0 group-hover/quote:opacity-100 transition-opacity" />
                    </div>
                ))}
                <div className="group/new-quote p-2 cursor-pointer" onClick={addQuote}>
                    <Plus className="w-4 h-4 group-hover/new-quote:rotate-90 group-hover/new-quote:text-emerald-600 group-hover/new-quote:scale-110 group-hover/new-quote:bg-emerald-100 rounded-full transition-transform duration-200" />
                </div>
            </div>
        </Box2>
    )
}