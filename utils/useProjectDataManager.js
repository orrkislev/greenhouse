import { useEffect, useRef } from "react";
import { useUser } from "./store/user";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { useProject } from "./store/projectStore";
import { initProject } from "./firebase/firebase_data";

export default function useProjectDataManager() {
    const user = useUser((state) => state.user);
    const project = useProject((state) => state.project);
    const setProject = useProject((state) => state.setProject);
    const setView = useProject((state) => state.setView);
    
    const isInitializing = useRef(false);
    const loadedProjectRef = useRef(null);

    // Effect 1: Load project data when user changes
    useEffect(() => {
        if (!user || !user.id) {
            return;
        }

        if (!user.currentProject) {
            if (!isInitializing.current) {
                isInitializing.current = true;
                initProject().then(() => {
                    isInitializing.current = false;
                });
            }
            return;
        }

        const projectDocRef = doc(db, 'users', user.id, 'projects', user.currentProject);
        getDoc(projectDocRef).then(projectDoc => {
            if (projectDoc.exists()) {
                const projectData = { id: projectDoc.id, ...projectDoc.data() };
                // Only set project if it's different from what we last loaded
                if (JSON.stringify(loadedProjectRef.current) !== JSON.stringify(projectData)) {
                    loadedProjectRef.current = projectData;
                    setProject(projectData);
                    if (projectData.status !== 'intentions') {
                        setView('overview');
                    }
                }
            }
        });

    }, [user, setProject, setView]);

    // Effect 2: Save project data when it changes in the store
    useEffect(() => {
        // Don't save if there's no project or user, or if project has no data yet
        if (!project || !user || !user.currentProject || Object.keys(project).length <= 1) {
            return;
        }

        // Do not save the initial project data that was just loaded
        if (JSON.stringify(loadedProjectRef.current) === JSON.stringify(project)) {
            return;
        }

        const timeoutId = setTimeout(() => {
            const projectDocRef = doc(db, 'users', user.id, 'projects', user.currentProject);
            updateDoc(projectDocRef, project)
                .catch((error) => {
                    console.error("Error updating project: ", error);
                });
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [project, user]);

    return null;
}