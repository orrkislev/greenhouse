'use client'

import WithAuth from "@/components/WithAuth";
import ProjectIntentions from "./components/ProjectIntentions";
import ProjectOverview from "./components/ProjectOverview";
import { motion, AnimatePresence } from "motion/react"
import useProjectDataManager from "@/app/project/utils/useProjectDataManager";
import { useProject } from "@/app/project/utils/projectStore";

export default function ProjectPage() {
    useProjectDataManager()

    return <WithAuth>
        <ProjectPageActual />
    </WithAuth>;
}

function ProjectPageActual() {
    const view = useProject((state) => state.view);

    let viewComponent = null;
    if (view === 'intentions') {
        viewComponent = <ProjectIntentions />;
    } else if (view === 'overview') {
        viewComponent = <ProjectOverview />;
    }

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <AnimatePresence>
                <motion.div
                    key={view}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    style={{ position: 'absolute', width: '100%' }}
                >
                    {viewComponent}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}