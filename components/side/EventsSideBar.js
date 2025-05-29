import { useUserSchedule } from "@/utils/store/scheduleDataStore";
import { tw } from "@/utils/tw";

const Container = tw`flex flex-col gap-2`;
const EventDiv = tw`bg-[#E8CB4A] rounded-full shadow mx-2
        flex items-center justify-start
        text-gray-800 text-white text-sm px-8 
        pointer-events-auto cursor-pointer hover:bg-[#D7B33A] transition-colors
        ${props => props.isselected ? 'bg-[#C69F2A] font-bold' : ''}
`;




export default function EventsSideBar() {
  const events = useUserSchedule(state => state.events);
  const selected = useUserSchedule(state => state.selected);
  const setSelected = useUserSchedule(state => state.setSelecte);

  return (
    <Container>
      {events.map((event, idx) => (
        <EventDiv key={idx}
          onClick={() => setSelected(event.id)}
          isselected={selected === event.id ? "true" : "false"}
        >
          {event.title}
        </EventDiv>
      ))}
    </Container>
  );
}
