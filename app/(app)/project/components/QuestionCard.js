import { useEffect, useState } from "react";
import { tw } from "@/utils/tw";
import Box2 from "@/components/Box2";
import { Cat } from "lucide-react";

const CardInput = tw.textarea`
    w-full h-20 text-sm bg-transparent border border-stone-200 rounded-lg outline-none resize-none focus:ring-2 focus:ring-lime-300 p-2
`;

export default function QuestionCard({ question, value, onSave }) {
    const [editing, setEditing] = useState(!value);
    const [inputValue, setInputValue] = useState(value || "");

    useEffect(() => {
        if (value) {
            setInputValue(value);
            setEditing(false);
        } else {
            setInputValue("");
            setEditing(true);
        }
    }, [value]);

    const handleSave = () => {
        if (inputValue.trim()) {
            onSave(inputValue);
            setEditing(false);
        }
    };

    return (
        <Box2 className={editing ? 'flex-1' : 'flex-1 opacity-80 hover:opacity-100'} label={question.title} LabelIcon={Cat}>
            <div className="text-sm text-stone-500 mb-2">{question.description}</div>
            <CardInput
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onBlur={handleSave}
                placeholder={question.placeholder}
                dir="rtl"
            />
        </Box2>
    );
}