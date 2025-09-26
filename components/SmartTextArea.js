import { useEffect, useRef } from "react";

export default function SmartTextArea(props) {
    const ref = useRef();

    useEffect(() => {
        const textarea = ref.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }, [props.value]);

    return (
        <textarea
            ref={ref}
            rows={1}
            className={`bg-transparent text-stone-800 rounded px-1 w-full outline-none pointer-events-auto focus:bg-white/50 resize-none text-sm`}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: '0', ...props.style }}
            onChange={props.onChange || (() => { })}
            {...props}
        />
    );
}