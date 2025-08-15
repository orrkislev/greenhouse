import { adminActions, useAdmin } from "@/utils/store/useAdmin";
import { useEffect } from "react";
import MessageEditor from "./MessageEditor";
import Box2 from "@/components/Box2";

export default function Staff_Admin() {
    const message = useAdmin(state => state.message);

    useEffect(() => {
        adminActions.loadMessage();
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">כל החניכים בתיכון</h3>
                </div>
            </div>
            <div className="flex gap-4">
                <MessageEditor onSave={(value) => adminActions.updateMessage(value)} initialValue={message} />
                <Box2 label="עוד משהו" className="flex-1">
                </Box2>
            </div>
        </div>
    )
}