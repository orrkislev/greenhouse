import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { useUser } from "@/utils/store/user";
import { db } from "@/utils/firebase/firebase";
import { updateUserData } from "@/utils/firebase/firebase_data";

export default function AddGroupButton({ groups }) {
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);
    const [selectedGroupToAssign, setSelectedGroupToAssign] = useState("");
    const [otherGroups, setOtherGroups] = useState([])
    const user = useUser(state => state.user);

    useEffect(() => {
        if (!showGroupDropdown) return
        if (otherGroups.length > 0) return
        const allGroupsDoc = doc(db, 'utils', 'groups');
        getDoc(allGroupsDoc).then(docSnap => {
            if (docSnap.exists()) {
                const allGroups = docSnap.data() || {};
                const allGroupNames = Object.keys(allGroups);
                const myGroups = Object.keys(groups || {});
                const filteredGroups = allGroupNames.filter(name => !myGroups.includes(name));
                setOtherGroups(filteredGroups);
            } else {
                console.error("No groups data found");
            }
        });
    }, [showGroupDropdown])


    const handleAssign = () => {
        if (!selectedGroupToAssign) return;
        updateUserData({ groups: [...(user.groups || []), selectedGroupToAssign] });
    };

    return (
        <div className="flex items-center gap-3">
            <Button
                onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                className="flex items-center gap-2"
                variant={showGroupDropdown ? "outline" : "default"}
            >
                <Plus className="w-4 h-4" />
                הוסף קבוצה
            </Button>
            {showGroupDropdown && otherGroups.length > 0 && (
                <div className="flex gap-2 items-center">
                    <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedGroupToAssign}
                        onChange={e => setSelectedGroupToAssign(e.target.value)}
                        dir="rtl"
                    >
                        <option value="">בחר קבוצה</option>
                        {otherGroups.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <Button
                        size="sm"
                        onClick={handleAssign}
                        disabled={!selectedGroupToAssign}
                    >
                        הוסף
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setShowGroupDropdown(false);
                            setSelectedGroupToAssign("");
                        }}
                    >
                        ביטול
                    </Button>
                </div>
            )}
        </div>
    );
}
