import { tw } from "@/utils/tw";

const Block = tw`z-5 w-full h-full grid`
const Event = tw`bg-blue-500 border-y-[2px] border-white border-l-[2px] last:border-l-0 z-5`;

export function ScheduleBlock({ block }) {
    return block.events.map((event, index) => (
        <Event key={index} style={event.gridStyle}>
            {event.title}
        </Event>
    ));

    // console.log(block)
    // return (
    //     <Block style={block.gridStyle} className={` grid-rows-${block.events.length} grid-rows-${block.duration}`}>
    //         {block.events.map((event, index) => (
    //             <Event key={index} style={event.gridStyle}>
    //                 {event.title}
    //             </Event>
    //         ))}
    //     </Block>
    // );
}