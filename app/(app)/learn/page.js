'use client'

import { useEffect, useState } from "react"
import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardMain, DashboardTitle } from "@/components/DashboardLayout"
import { studyActions, useStudy } from "@/utils/store/useStudy"
import StudyMain from "./components/StudyMain"
import StudyPath, { newSubjectData } from "./components/StudyPath"
import { tw } from "@/utils/tw"
import { PageMain } from "@/components/ContextBar"
import { examplePaths } from "./components/example study paths"

const PathButtonSpan = tw.span`
    ${({ $active }) => $active ? '' : 'line-through'}
`

export default function LearnPage() {
    const paths = useStudy(state => state.paths)
    const [view, setView] = useState('dashboard');

    useEffect(() => {
        studyActions.loadPaths()
    }, [])

    useEffect(() => {
        if (paths.length > 0) setView(paths[paths.length - 1].id)
    }, [paths.length])

    const selectedPath = paths.find(path => path.id === view)

    const newPath = () => {
        const selectedPath = examplePaths[Math.floor(Math.random() * examplePaths.length)]
        studyActions.addPath(selectedPath)
    }

    return (
        <PageMain>
            <DashboardLayout>
                <DashboardTitle>מסלולי למידה שלי</DashboardTitle>
                <DashboardPanel>
                    <DashboardPanelButton onClick={() => setView('dashboard')} $active={view === 'dashboard'}>ראשי</DashboardPanelButton>
                    {paths.map(path => (
                        <DashboardPanelButton key={path.id} onClick={() => setView(path.id)} $active={view === path.id}>
                            <PathButtonSpan $active={path.active}>{path.name}</PathButtonSpan>
                        </DashboardPanelButton>
                    ))}
                    <DashboardPanelButton onClick={newPath} className="bg-emerald-500 text-white">
                        +
                    </DashboardPanelButton>
                </DashboardPanel>
                <DashboardMain>
                    {view === 'dashboard' && <StudyMain />}
                    {selectedPath && <StudyPath path={selectedPath} />}
                </DashboardMain>
            </DashboardLayout>
        </PageMain>
    )
}