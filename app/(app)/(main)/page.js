'use client'

import MainGreetings from "./components/MainGreetings"
import MainMessages from "./components/MainMessages"
import MainNews from "./components/MainNews"
import MainProject from "./components/MainProject"
import MainSchedule from "./components/MainSchedule"
import MainGroups from "./components/MainGroups"
import MainLearn from "./components/MainLearn"
import ContextBar, { PageMain } from "@/components/ContextBar"
import MainContext from "./components/MainContext"
import { AuthGoogleListener } from "../schedule/components/Google/AuthGoogleCalendar"

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
                        <MainLearn />
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