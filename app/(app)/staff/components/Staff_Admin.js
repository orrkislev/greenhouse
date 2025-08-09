import Box2 from "@/components/Box2";
import { adminActions, useAdmin } from "@/utils/store/useAdmin";
import { Puzzle } from "lucide-react";
import { useEffect } from "react";

export default function Staff_Admin() {
    const message = useAdmin(state => state.message);

    useEffect(()=>{
        adminActions.loadMessage();
    },[])

    return (
        <div className="flex flex-col gap-4">
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">כל החניכים בתיכון</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Puzzle className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-4 ">
                <Box2 label="הודעה בית ספרית" className="flex-1">
                    <textarea defaultValue={message} onBlur={(e) => adminActions.updateMessage(e.target.value)} className="w-full h-full" />
                </Box2>
                <div className='flex-1'>
                </div>
            </div>
        </div>
    )
}