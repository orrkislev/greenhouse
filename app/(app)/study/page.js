'use client'

import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardMain, DashboardTitle } from "@/components/DashboardLayout"
import { studyActions, useStudyPaths } from "@/utils/store/useStudy"
import StudyMain from "./components/StudyMain"
import StudyPath from "./components/StudyPath"
import { tw } from "@/utils/tw"
import ContextBar, { PageMain } from "@/components/ContextBar"
import { newPathData } from "./components/example study paths"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import StudyContext from "./components/StudyContext"

export default function LearnPage() {
    const searchParams = useSearchParams()
    const paths = useStudyPaths()

    const id = searchParams.get('id')
    const selectedPath = paths.find(path => path.id === id)

    return (
        <>
        <PageMain>
            <DashboardLayout>
                <DashboardTitle>מסלולי למידה שלי</DashboardTitle>
                {selectedPath && (
                    <DashboardPanel>
                    <Link href='/study'>
                        <DashboardPanelButton $active={!id}>ראשי</DashboardPanelButton>
                    </Link>
                    {paths.map(path => (
                        <Link href={`/study?id=${path.id}`} key={path.id}>
                            <DashboardPanelButton $active={id === path.id}>
                                {path.title}
                            </DashboardPanelButton>
                        </Link>
                    ))}
                    <DashboardPanelButton onClick={studyActions.addPath} className="bg-emerald-500 text-white">
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