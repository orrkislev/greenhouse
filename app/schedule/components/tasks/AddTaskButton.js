import { tw } from "@/utils/tw";
import { useUserSchedule } from "../../utils/useUserSchedule";
import { useWeek } from "../../utils/useWeek";

const AddTaskButtonDiv = tw`flex items-center justify-center text-gray-800 text-sm
        pointer-events-auto cursor-pointer 
        transition-all bg-[#FADFC199] hover:bg-[#FADFC1]
        text-transparent hover:text-gray-800
        z-5
`;

export default function AddTaskButton({ col, row }) {
    const addTask = useUserSchedule(state => state.addTask);
    const week = useWeek(state => state.week);

    const handleClick = () => {
        const date = week[col - 1];
        addTask({
            start: date,
            end: date,
            title: "משימה חדשה",
            description: "",
            type: "task",
        });
    }

    return (
        <AddTaskButtonDiv className={`col-${col} row-start-${row} row-end-5`}
            onClick={handleClick}
        >
            +
        </AddTaskButtonDiv>
    );
}
