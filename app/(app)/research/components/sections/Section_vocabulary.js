import Box2 from "@/components/Box2";
import Button, { IconButton } from "@/components/Button";
import { researchActions, useResearchData } from "@/utils/store/useResearch";
import { Library, Plus, Trash2 } from "lucide-react";
import TextInput from "./TextInput";

export default function Section_vocabulary() {
    const research = useResearchData(state => state.research)
    const vocabulary = research?.sections?.vocabulary || [];

    const addWord = () => {
        const newVocabulary = [...vocabulary, ''];
        researchActions.updateSections({ vocabulary: newVocabulary });
    }

    const updateWord = (index, word) => {
        if (word.trim() === '') return removeWord(index)
        const newVocabulary = [...vocabulary];
        newVocabulary[index] = word;
        researchActions.updateSections({ vocabulary: newVocabulary });
    }

    const removeWord = (index) => {
        const newVocabulary = [...vocabulary];
        newVocabulary.splice(index, 1);
        researchActions.updateSections({ vocabulary: newVocabulary });
    }

    return (
        <Box2 label="מושגים חשובים" LabelIcon={Library} className="row-span-3">
            <div className="flex gap-2 flex-wrap">
                {vocabulary.map((word, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 bg-accent px-2 py-1 rounded-full text-xs hover:bg-accent transition-colors">
                        <TextInput onChange={(value) => updateWord(index, value)} value={word} className="w-full outline-none min-w-2" />
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-4">
                <div className="group/new-vocabulary p-2 cursor-pointer" onClick={addWord}>
                    <Plus className="w-4 h-4 group-hover/new-vocabulary:rotate-90 group-hover/new-vocabulary:text-emerald-600 group-hover/new-vocabulary:scale-110 group-hover/new-vocabulary:bg-emerald-100 rounded-full transition-transform duration-200" />
                </div>
            </div>
        </Box2>
    )
}