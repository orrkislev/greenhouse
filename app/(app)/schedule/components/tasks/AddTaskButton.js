import { tw } from "@/utils/tw";
import { tasksActions} from "@/utils/useTasks";
import { TASK_FORMATS, TASK_STATUSES, TASK_TYPES } from "@/utils/constants/constants";

const AddTaskButtonDiv = tw`flex items-center justify-center text-gray-800 text-sm
        pointer-events-auto cursor-pointer 
        transition-all bg-[#FADFC199] hover:bg-[#FADFC1]
        text-transparent hover:text-gray-800
        flex-1
        z-5
`;

export default function AddTaskButton({ date }) {

    const handleClick = () => {
        tasksActions.createTask({
            date: date,
            title: "משימה חדשה",
            description: "",
            type: TASK_TYPES.STUDENT_CREATED,
            status: TASK_STATUSES.ACTIVE,
            format: TASK_FORMATS.DATE_BASED,
        });
    }

    return (
        <AddTaskButtonDiv onClick={handleClick}>
            +
        </AddTaskButtonDiv>
    );
}
