import { tw } from "@/utils/tw";

const ScheduleSectionDiv = tw`p-1 border-b border-x border-border bg-destructive relative bg-white`;
const ScheduleTitle = tw`text-xs text-foreground absolute top-0 right-0 translate-x-1/1 bg-white px-2 py-1 border-y border-r border-border`;
const ScheduleGrid = tw`grid grid-cols-6 w-full relative h-full grid-cols-[repeat(6,1fr)] gap-[2px]`;

export function ScheduleSection({ children, className = '', name, edittable = true, withLabel = true}) {
    const bgColor = !edittable ? 'opacity-70' : '';

    return (
        <ScheduleSectionDiv className={`${bgColor} ${withLabel ? '' : 'border-t'} ${className}`}>
            {withLabel && name && <ScheduleTitle className={bgColor}>{name}</ScheduleTitle>}
            <ScheduleGrid>
                {children}
            </ScheduleGrid>
        </ScheduleSectionDiv>
    );
}