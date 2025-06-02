'use client'

import { useState } from "react";
import WithAuth from "@/components/auth/SignIn";
import { useUser } from "@/utils/store/user";
import ProjectIntentions from "./components/ProjectIntentions";
import ProjectOverview from "./components/ProjectOverview";
import { motion, AnimatePresence } from "motion/react"
import useProjectDataManager from "@/utils/useProjectDataManager";
import { useProject } from "@/utils/store/projectStore";
import { Page } from "../page";
import TopBar from "@/components/TopBar";

export default function ProjectPage() {
    useProjectDataManager()

    return <WithAuth>
        <TopBar />
        <ProjectPageActual />
    </WithAuth>;
}

function ProjectPageActual() {
    const project = useProject((state) => state.project);
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