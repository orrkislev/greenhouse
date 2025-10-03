'use client'

import MainGreetings from "./components/MainGreetings"
import MainMessages from "./components/MainMessages"
import MainProject from "./components/MainProject"
import MainSchedule from "./components/MainSchedule"
import MainGroups from "./components/MainGroups"
import ContextBar, { PageMain } from "@/components/ContextBar"
import MainContext from "./components/MainContext"
import { AuthGoogleListener } from "../schedule/components/Google/AuthGoogleCalendar"
import MainStudy from "./components/MainStudy"

export default function MainPage() {

    return (
        <>
            <PageMain>

                <div className="p-4 flex flex-col gap-3">
                    <MainGreetings />
                    <MainMessages />
                    <MainGroups />
                    <div className="flex gap-3">
                        <MainProject />
                        <MainSchedule />
                        <MainStudy />
                    </div>
                </div>
            </PageMain>
            <ContextBar name="">
                <MainContext />
            </ContextBar>

            <AuthGoogleListener />
        </>
    )
}