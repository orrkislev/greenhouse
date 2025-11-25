import Box2 from "@/components/Box2";
import { useEffect, useRef, useState } from "react";
import { AArrowDown, AArrowUp, Bold, Italic, MessageCircle, Strikethrough, Underline } from "lucide-react";
import { tw } from "@/utils/tw";
import ReactQuill from 'react-quill-new';


const QuillToolbar = tw.div`flex gap-1 justify-end`
const QuillToolbarButton = tw.button`p-1 rounded-full hover:bg-muted cursor-pointer`

export default function MessageEditor({ onSave, initialValue }) {
    const [value, setValue] = useState(initialValue || '');
    const quillRef = useRef(null);

    useEffect(() => {
        setValue(initialValue || '');
    }, [initialValue]);

    const applyFormat = (format, value = true) => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            quill.format(format, value);
        }
    };

    return (
        <Box2 label="הודעה" className="flex-1" LabelIcon={MessageCircle}>
            <div className="flex flex-col">
                <QuillToolbar>
                    <QuillToolbarButton onClick={() => applyFormat('strike')}><Strikethrough className="w-4 h-4" /></QuillToolbarButton>
                    <QuillToolbarButton onClick={() => applyFormat('bold')}><Bold className="w-4 h-4" /></QuillToolbarButton>
                    <QuillToolbarButton onClick={() => applyFormat('italic')}><Italic className="w-4 h-4" /></QuillToolbarButton>
                    <QuillToolbarButton onClick={() => applyFormat('underline')}><Underline className="w-4 h-4" /></QuillToolbarButton>
                    <QuillToolbarButton onClick={() => applyFormat('size', 'large')}><AArrowUp className="w-4 h-4" /></QuillToolbarButton>
                    <QuillToolbarButton onClick={() => applyFormat('size', 'small')}><AArrowDown className="w-4 h-4" /></QuillToolbarButton>
                </QuillToolbar>
                <ReactQuill
                    ref={quillRef}
                    value={value}
                    onChange={setValue}
                    onBlur={() => onSave(value)}
                    modules={{ toolbar: false }}
                    placeholder="כתוב הודעה..."
                />
            </div>
        </Box2>
    );
}