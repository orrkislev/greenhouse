import { tw } from "@/utils/tw";

const EventDiv = tw`
    bg-[#EF98A1] py-2 px-4 text-foreground
    flex flex-col justify-center text-sm
    pointer-events-auto cursor-pointer transition-colors duration-200
    z-5 hover:bg-[#E77885] stripes outline-2 outline-white
`;

export function ReadOnlyEvent({ event }) {

    return (
        <EventDiv style={event.gridStyle}>
            <div className="font-medium truncate">{event.title}</div>
        </EventDiv>
    );
}