import { useRef } from "react"

export default function TextInput({ value, onChange, className }) {
    const txt = useRef(value);
    return (
        <div contentEditable={true} suppressContentEditableWarning onInput={(e) => onChange(e.target.innerText)} className={`${className} transition-all duration-200 cursor-text leading-tight`}>
            {txt.current}
        </div>
    )
}