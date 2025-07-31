import { useState } from "react";

export const Cell = ({ children, className = '' }) => (
    <td className={`py-1 px-4 border-b border-blue-gray-50 ${className}`}>
        <div className="flex items-center">
            <div className="block antialiased font-sans leading-normal text-blue-gray-900 font-normal w-full text-center">
                {children}
            </div>
        </div>
    </td>
)

export function Edittable({ value, onChange = () => { }, onFinish = () => { } }) {
    const [editing, setEditing] = useState(false);
    const onUpdate = (e) => {
        onChange(e.target.value);
    }
    const onBlur = (e) => {
        setEditing(false);
        onFinish(e.target.value);
    }
    if (editing) {
        return (
            <input type="text" defaultValue={value} onChange={onUpdate} onBlur={onBlur} autoFocus />
        );
    } else {
        return <div className="cursor-pointer" onClick={() => setEditing(true)}>{value ? value : '-'}</div>;
    }
}

export function Checkbox({ value, onChange }) {
    const onUpdate = (e) => {
        onChange(e.target.checked);
    }
    return <input type="checkbox" checked={value} onChange={onUpdate} />;
}

export function TableHeader({ headers }) {
    return (
        <thead>
            <tr>
                {headers.map(header => (
                    <th key={header.key} className={`cursor-pointer border-b border-blue-gray-100 bg-blue-gray-50/50 px-4 py-2 transition-colors hover:bg-blue-gray-50`}>
                        <p className="antialiased font-sans text-blue-gray-900 flex items-center gap-2 font-normal leading-none opacity-70">
                            {header.sortable && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path>
                                </svg>
                            )}
                            {header.label}
                        </p>
                    </th>
                ))}
            </tr>
        </thead>
    )
}