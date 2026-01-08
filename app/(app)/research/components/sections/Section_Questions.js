import Box2 from "@/components/Box2";
import Button, { IconButton } from "@/components/Button";
import SmartTextArea from "@/components/SmartTextArea";
import { researchActions, useResearchData } from "@/utils/store/useResearch";
import { BadgeHelp, Plus, Trash2 } from "lucide-react";
import TextInput from "./TextInput";

export default function Section_Questions({ section }) {
    const research = useResearchData(state => state.research)

    if (!research) return null;

    const questions = research?.sections?.questions || [];

    const addQuestion = () => {
        const newQuestions = [...questions, ''];
        researchActions.updateSections({ questions: newQuestions });
    }
    const updateQuestion = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index] = value;
        researchActions.updateSections({ questions: newQuestions });
    }
    const removeQuestion = (index) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        researchActions.updateSections({ questions: newQuestions });
    }

    return (
        <Box2 label="21 שאלות" LabelIcon={BadgeHelp} className="row-span-5 relative">
            <div className="flex flex-col justify-between gap-8">
                <div className="flex flex-col flex-1 overflow-y-auto">
                    {questions.map((question, index) => (
                        <div key={index} className="flex justify-between group/question border-b border-border items-center">
                            <TextInput onChange={(value) => updateQuestion(index, value)} value={question} className="w-full" />
                            <IconButton icon={Trash2} onClick={() => removeQuestion(index)} className="p-2 hover:bg-muted rounded-full opacity-0 group-hover/question:opacity-100 transition-opacity" />
                        </div>
                    ))}
                    <div className="group/new-question p-2 cursor-pointer" onClick={addQuestion}>
                        <Plus className="w-4 h-4 group-hover/new-question:rotate-90 group-hover/new-question:text-emerald-600 group-hover/new-question:scale-110 group-hover/new-question:bg-emerald-100 rounded-full transition-transform duration-200" />
                    </div>
                </div>
            </div>
        </Box2>
    )
}

