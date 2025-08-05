import MainProject from "./MainProject";
import MainMessages from "./MainMessages";
import MainGreetings from "./MainGreetings";
import MainSchedule from "./MainSchedule";
import MainNews from "./MainNews";

export default function MainPage() {
    return (
        <div className="p-4 flex flex-col gap-4">
            <MainGreetings />
            <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                    <MainMessages />
                    <MainNews />
                </div>
                <div className="flex gap-1">
                    <MainProject />
                    <MainSchedule />
                </div>
            </div>
        </div>
    )
}