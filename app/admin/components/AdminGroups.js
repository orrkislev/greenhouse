import EditableList from "@/components/ui/EditableList";
import { db } from "@/utils/firebase/firebase";
import { addDoc, collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function AdminGroups() {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const groupsCollection = collection(db, "groups");

        (async () => {
            let allGroups = await getDocs(groupsCollection);
            allGroups = allGroups.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroups(allGroups);
        })();

        const unsubscribe = onSnapshot(groupsCollection, (snapshot) => {
            const updatedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroups(updatedGroups);
        });
        return () => unsubscribe();
    }, []);

    const createGroup = async (groupName) => {
        const groupsCollection = collection(db, "groups");
        await addDoc(groupsCollection, {
            name: groupName,
        });
    }


    return (
        <div className="p-4 rounded-lg bg-white shadow-md">
            <h2 className="text-xl font-bold">Groups</h2>
            <EditableList
                items={groups.map(group => group.name)}
                onChange={async (updatedGroups) => {
                    console.log("Updated groups:", updatedGroups);
                    setGroups(updatedGroups.map(name => ({ name })));
                }}
                onCreate={createGroup}
            />
        </div>
    );
}