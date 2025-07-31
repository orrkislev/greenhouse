import { adminActions, useAdmin } from "@/utils/useAdmin";
import { useState } from "react";

export default function AdminDashboard() {
    const message = useAdmin(state => state.message);
    const [editing, setEditing] = useState(false);

    const updateMessage = (text) => {
        adminActions.updateMessage(text);
        setEditing(false);
    }

    return (
        <div className="flex flex-col gap-2 group">
            <div className="text-2xl font-bold">הודעה לתלמידים</div>
            <div className="text-sm text-gray-500">
                {editing ? 
                    <input type="text" 
                        defaultValue={message}
                        onBlur={e => updateMessage(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                updateMessage(e.target.value);
                            }
                        }} /> 
                : 
                    <div className="cursor-pointer p-2 border border-gray-200 rounded-md" onClick={() => setEditing(true)}>{message}</div>}
            </div>
        </div>
    )
}