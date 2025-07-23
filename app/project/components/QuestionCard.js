import { useEffect, useState } from "react";
import { tw } from "@/utils/tw";
import { Pencil } from "lucide-react";

const Card = tw.div`
    flex-1 bg-white rounded-2xl shadow-sm p-4 flex flex-col space-y-2 transition-all duration-200
`;
const CardHeader = tw.span`
    font-semibold text-gray-700 text-sm flex items-center gap-2
`;
const CardDescription = tw.div`
    text-xs text-gray-500 mb-2
`;
const CardInput = tw.textarea`
    w-full h-20 text-sm bg-transparent border border-gray-200 rounded-lg outline-none resize-none focus:ring-2 focus:ring-lime-300 p-2
`;
const SaveButton = tw.button`
    mt-2 bg-lime-500 hover:bg-lime-600 text-white rounded-full px-6 py-2 text-sm font-bold self-end transition-colors
`;
const EditButton = tw.button`
    ml-auto text-gray-400 hover:text-lime-500 transition-colors p-1
`;
const CollapsedAnswer = tw.div`
    text-xs text-gray-700 whitespace-pre-line
`;
const Placeholder = tw.span`
    text-gray-300
`;

export default function QuestionCard({ question, value, onSave }) {
    const [editing, setEditing] = useState(!value);
    const [inputValue, setInputValue] = useState(value || "");
    const [hovered, setHovered] = useState(false);

    useEffect(()=>{
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

    const handleEdit = () => {
        setEditing(true);
    };

    return (
        <Card
            className={editing ? '' : 'opacity-80 hover:opacity-100'}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <CardHeader>
                {question.icon && <span className="text-xl">{question.icon}</span>}
                {question.title}
                {!editing && hovered && (
                    <EditButton
                        onClick={handleEdit}
                        aria-label="ערוך"
                    >
                        <Pencil size={16} />
                    </EditButton>
                )}
            </CardHeader>
            {editing ? (
                <>
                    <CardDescription>{question.description}</CardDescription>
                    <CardInput
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder={question.placeholder}
                        dir="rtl"
                    />
                    <SaveButton onClick={handleSave}>שמור</SaveButton>
                </>
            ) : (
                <CollapsedAnswer>{value || <Placeholder>לא מולא</Placeholder>}</CollapsedAnswer>
            )}
        </Card>
    );
}