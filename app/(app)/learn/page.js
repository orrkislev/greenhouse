'use client'

import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardMain, DashboardTitle } from "@/components/DashboardLayout"
import { studyActions, useStudy, useStudyPaths } from "@/utils/store/useStudy"
import StudyMain from "./components/StudyMain"
import StudyPath from "./components/StudyPath"
import { tw } from "@/utils/tw"
import ContextBar, { PageMain } from "@/components/ContextBar"
import { examplePaths } from "./components/example study paths"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import StudyContext from "./components/StudyContext"

const PathButtonSpan = tw.span`
    ${({ $active }) => $active ? '' : 'line-through'}
`

export default function LearnPage() {
    const searchParams = useSearchParams()
    const paths = useStudyPaths()

    const id = searchParams.get('id')
    const selectedPath = paths.find(path => path.id === id)

    const newPath = () => {
        const selectedPath = examplePaths[Math.floor(Math.random() * examplePaths.length)]
        studyActions.addPath(selectedPath)
    }

    return (
        <>
        <PageMain>
            <DashboardLayout>
                <DashboardTitle>מסלולי למידה שלי</DashboardTitle>
                {selectedPath && (
                    <DashboardPanel>
                    <Link href='/learn'>
                        <DashboardPanelButton $active={!id}>ראשי</DashboardPanelButton>
                    </Link>
                    {paths.map(path => (
                        <Link href={`/learn?id=${path.id}`} key={path.id}>
                            <DashboardPanelButton $active={id === path.id}>
                                <PathButtonSpan $active={path.active}>{path.name}</PathButtonSpan>
                            </DashboardPanelButton>
                        </Link>
                    ))}
                    <DashboardPanelButton onClick={newPath} className="bg-emerald-500 text-white">
                        +
                        </DashboardPanelButton>
                    </DashboardPanel>
                )}
                <DashboardMain>
                    {selectedPath ? <StudyPath path={selectedPath} /> : <StudyMain />}
                </DashboardMain>
            </DashboardLayout>
        </PageMain>
        <ContextBar>
            <StudyContext />
        </ContextBar>
        </>
    )
}