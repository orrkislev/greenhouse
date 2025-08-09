'use client'

import MainGreetings from "./components/MainGreetings"
import MainMessages from "./components/MainMessages"
import MainNews from "./components/MainNews"
import MainProject from "./components/MainProject"
import MainSchedule from "./components/MainSchedule"
import MainGroups from "./components/MainGroups"
import MainLearn from "./components/MainLearn"

export default function MainPage() {
    return (
        <div className="p-4 flex flex-col gap-4">
            <MainGreetings />
            <div className="flex gap-3">
                <div className="flex flex-col gap-3">
                    <MainMessages />
                    <MainGroups />
                    <div className="flex gap-3">
                        <MainProject />
                        <MainSchedule />
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <MainNews />
                    <MainLearn />
                </div>
            </div>
        </div>
    )
}