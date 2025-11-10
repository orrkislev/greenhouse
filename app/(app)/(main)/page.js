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
import { supabase } from "@/utils/supabase/client"

export default function MainPage() {

    return (
        <div className="inset-0 absolute overflow-hidden">
            <BGGrads />
            <PageMain className="flex px-2 md:mx-16">
                <div className="flex flex-col md:grid md:grid-cols-5 gap-3 md:gap-4 w-full">
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