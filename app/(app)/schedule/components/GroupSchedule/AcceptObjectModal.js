import { Button } from "@/components/ui/button";
import { useUser } from "@/utils/useUser";
import { groupsActions } from "@/utils/useGroups";

export default function AcceptObjectModal({ groupId, obj, onClose }) {
    const userId = useUser(state => state.user.id);

    const handleAccept = async () => {
        groupsActions.joinGroupEntry(groupId, obj.id, userId)
        onClose()
    };

    return (
        <Button onClick={handleAccept}>
            כן
        </Button>
    );
}