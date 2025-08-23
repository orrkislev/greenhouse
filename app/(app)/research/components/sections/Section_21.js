import { researchActions } from "@/utils/store/useResearch";

export default function Section_21({ section }) {

    const updateQuestion = (index, value) => {
        const questions = section.content.questions || Array.from({ length: 21 }, () => "");
        questions[index] = value;
        researchActions.updateSection(section.id, { questions });
    }

    const questions = section.content.questions || Array.from({ length: 21 }, () => "");

    return (
        <div className="grid grid-cols-3 gap-2">
            {questions.map((question, index) => (
                <div key={index} className="border rounded-md bg-white">
                    <input type="text" className="w-full text-sm" defaultValue={question} onBlur={(e) => {
                        updateQuestion(index, e.target.value);
                    }} />
                </div>
            ))}
        </div>
    )
}