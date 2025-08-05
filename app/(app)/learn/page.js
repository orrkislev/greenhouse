'use client'

import { useEffect, useState } from "react"
import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardMain } from "@/components/DashboardLayout"
import { studyActions, useStudy } from "@/utils/store/useStudy"
import StudyMain from "./components/StudyMain"
import StudyPath, { newSubjectData } from "./components/StudyPath"
import { tw } from "@/utils/tw"

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
    }, [paths])

    const selectedPath = paths.find(path => path.id === view)

    const newPath = () => {
        studyActions.addPath({
            name: "תחום חדש",
            description: "מה המטרה שלך בתחום הזה?",
            subjects: [newSubjectData()],
            active: true,
        })
    }

    return (
        <DashboardLayout>
            <DashboardPanel>
                <DashboardPanelButton onClick={() => setView('dashboard')} $active={view === 'dashboard'}>ראשי</DashboardPanelButton>
                {paths
                    .sort((a, b) => a.active ? -1 : 1)
                    .map(path => (
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
    )
}