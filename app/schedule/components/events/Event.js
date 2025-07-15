'use client';

import { EditableEvent } from "./EditableEvent";
import { ReadOnlyEvent } from "./ReadOnlyEvent";

export function Event({ event, edittable, onStartDrag, onEndDrag, onStartResize, onEndResize, onSelect }) {
    if (edittable) {
        return (
            <EditableEvent
                event={event}
                onStartDrag={onStartDrag}
                onEndDrag={onEndDrag}
                onStartResize={onStartResize}
                onEndResize={onEndResize}
                onSelect={onSelect}
            />
        );
    }

    return (
        <ReadOnlyEvent
            event={event}
            onSelect={onSelect}
        />
    );
}