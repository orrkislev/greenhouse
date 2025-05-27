import { useUserSchedule } from "@/utils/store/scheduleDataStore";
import { tw } from "@/utils/tw";

const Container = tw`flex flex-col gap-2`;
const TaskDiv = tw`bg-[#309898] rounded-full shadow mx-2
        flex items-center justify-start
        text-gray-800 text-white text-sm px-8 
        pointer-events-auto cursor-pointer hover:bg-[#2A7B7B] transition-colors
        ${props => props.isSelected ? 'bg-[#226666] font-bold' : ''}`;

export default function TasksSideBar() {
  const tasks = useUserSchedule(state => state.tasks);
  const selected = useUserSchedule(state => state.selected);
  const setSelected = useUserSchedule(state => state.setSelected);

  return (
    <Container>
      {tasks.map((task, idx) => (
        <TaskDiv
          key={idx}
          onClick={() => setSelected(task.id)}
          isSelected={selectedTask === task.id}
        >
          {task.title}
        </TaskDiv>
      ))}
    </Container>
  );
}
