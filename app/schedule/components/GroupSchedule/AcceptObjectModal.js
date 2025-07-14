import { Button } from "@/components/ui/button";
import { useUser } from "@/utils/useUser";
import { joinGroupEntry } from "../../utils/groupschedule actions";

export default function AcceptObjectModal({ groupName, obj, onClose }) {
    const userId = useUser(state => state.user.id);

    const handleAccept = async () => {
        joinGroupEntry(groupName, obj.id, userId)
        onClose()
    };

    return (
        <Button onClick={handleAccept}>
            כן
        </Button>
    );
}