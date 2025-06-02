import { useEffect, useRef } from "react";
import { useUser } from "./store/user";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { useProject } from "./store/projectStore";
import { initProject } from "./firebase/firebase_data";

export default function useProjectDataManager() {
    const user = useUser((state) => state.user);
    const setUser = useUser((state) => state.setUser);

    const project = useProject((state) => state.project);
    const setProject = useProject((state) => state.setProject);
    const lastProject = useRef(true);

    useEffect(() => {
        if (!user) return;

        if (!user.currentProject){
            initProject().then((newProjectId) => setUser({currentProject: newProjectId }))
        }

        (async () => {
            console.log("Loading project data for user:", user.id, "project:", user.currentProject);
            const projectDoc = doc(db, 'users', user.id, 'projects', user.currentProject);
            const loadedProject = await getDoc(projectDoc);
            const projectData = {id: loadedProject.id, ...loadedProject.data()};
            lastProject.current = projectData
            console.log("Loaded project data:", projectData);
            setProject(projectData);
        })();
    }, [user])

    useEffect(() => {
        if (!user) return;
        if (!user.currentProject) return;

        const updateProject = async () => {
            const projectDocRef = doc(db, 'users', user.id, 'projects', user.currentProject);
            updateDoc(projectDocRef, project)
                .catch((error) => {
                    console.error("Error updating project: ", error);
                });
            lastProject.current = project
        };

        const timeout = setTimeout(() => {
            if (lastProject.current && JSON.stringify(lastProject.current) !== JSON.stringify(project)) 
                updateProject();
        }, 2000); // Delay to avoid too frequent updates

        return () => clearTimeout(timeout)

    }, [project, user]);

    return null
}