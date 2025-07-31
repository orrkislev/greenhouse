import { ScheduleSection } from "../Layout";
import { useEffect, useState } from "react";
import { notesActions, useNotes } from "@/utils/useNotes";
import { useTime } from "@/utils/useTime";
import { tw } from "@/utils/tw";

const NoteDiv = tw`bg-[#e4d852] min-h-4
        flex items-center justify-center gap-2 text-gray-800 text-sm
        pointer-events-auto cursor-pointer        
        hover:bg-[#a08e2a] transition-all z-10 text-xs py-1
`;

export default function Notes() {
    const week = useTime(state => state.week);

    useEffect(() => {
        notesActions.loadUserNotesForWeek();
    }, [week]);

    return (
        <ScheduleSection name="הערות">
            {week.map((date, index) => (
                <DayNote key={index} day={date} />
            ))}
        </ScheduleSection>
    )
}

function DayNote({ day }) {
    const notes = useNotes(state => state.userNotes);
    const text = notes?.[day] || '';

    const [editing, setEditing] = useState(false);

    const saveNote = (note) => {
        notesActions.saveUserNote(note, day);
        setEditing(false);
    }

    return (
        <NoteDiv onClick={() => !editing && setEditing(true)}>
            {editing ? (
                <textarea
                    defaultValue={text}
                    autoFocus
                    onBlur={(e) => saveNote(e.target.value)}
                    className="w-full h-full bg-transparent text-sm p-1 resize-none border-none outline-none"
                />
            ) : (
                <div>{text}</div>
            )}
        </NoteDiv>
    )
}
