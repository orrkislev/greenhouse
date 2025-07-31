import MainProject from "./MainProject";
import MainMessages from "./MainMessages";
import MainGreetings from "./MainGreetings";
import MainSchedule from "./MainSchedule";

export default function MainPage() {
    return(
        <div className="p-4 flex flex-col gap-4 divide-y divide-gray-200">
            <MainGreetings />
            <MainMessages />
            <MainProject />
            <MainSchedule />
        </div>
    )
}