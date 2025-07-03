import { db } from "@/utils/firebase/firebase";
import { useUserSchedule } from "@/utils/store/scheduleDataStore";
import { useUser } from "@/utils/store/user";
import { tw } from "@/utils/tw";
import { formatDate } from "@/utils/utils";
import { addDoc, collection } from "firebase/firestore";

const Container = tw`flex flex-col gap-2`;
const TaskDiv = tw`bg-[#309898] rounded-full shadow mx-2
        flex items-center justify-start
        text-gray-800 text-white text-sm px-8 
        pointer-events-auto cursor-pointer hover:bg-[#2A7B7B] transition-colors
        ${props => props.$isSelected ? 'bg-[#226666] font-bold' : ''}`;
const NewTaskDiv = tw`bg-[#309898] rounded-full shadow mx-2
        flex items-center justify-center
        text-gray-800 text-white text-sm px-8 
        pointer-events-auto cursor-pointer hover:bg-[#2A7B7B] transition-colors`;


export default function TasksSideBar() {
  const user = useUser(state => state.user);
  const tasks = useUserSchedule(state => state.tasks);
  const selected = useUserSchedule(state => state.selected);
  const setSelected = useUserSchedule(state => state.setSelected);

  const createNewTask = () => {
    const tasksCollection = collection(db, "users", user.id, "tasks");
    const today = formatDate(new Date());
    const newTask = {
      title: "New Task",
      description: "",
      completed: false,
      start: today,
      end: today,
    };
    addDoc(tasksCollection, newTask)
      .then(docRef => {
        setSelected(docRef.id);
      })
      .catch(error => {
        console.error("Error adding new task: ", error);
      });
  }

  return (
    <Container>
      <NewTaskDiv onClick={createNewTask}>
        New Task
      </NewTaskDiv>

      {tasks.map((task, idx) => (
        <TaskDiv
          key={idx}
          onClick={() => setSelected(task.id)}
          $isSelected={selected === task.id ? "true" : "false"}
        >
          {task.title}
        </TaskDiv>
      ))}
    </Container>
  );
}
