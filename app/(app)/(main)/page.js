'use client'

import MainMessages from "./components/MainMessages"
import MainProject from "./components/MainProject"
import MainSchedule from "./components/MainSchedule"
import MainGroups from "./components/MainGroups"
import { BGGrads, PageMain } from "@/components/ContextBar"
import { AuthGoogleListener } from "../schedule/components/Google/AuthGoogleCalendar"
import MainStudy from "./components/MainStudy"
import MainResearch from "./components/MainResearch"
import MainVocation from "./components/MainVocation"
import MainNews from "./components/MainNews"

export default function MainPage() {

    return (
        <div className="inset-0 absolute overflow-hidden">
            <BGGrads />
            <PageMain className="flex mx-16">
                <div className="grid grid-cols-5 gap-4">
                    <MainSchedule />
                    <MainMessages />
                    <MainNews />
                    <MainGroups />
                    <MainProject />
                    <MainStudy />
                    <MainResearch />
                    <MainVocation />
                </div>
            </PageMain>
            {/* <ContextBar name="">
                <MainContext />
            </ContextBar> */}

            {/* <AuthGoogleListener /> */}
        </div>
    )
}