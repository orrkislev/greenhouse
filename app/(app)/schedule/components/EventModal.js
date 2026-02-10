import Button from "@/components/Button";
import { eventsActions } from "@/utils/store/useEvents";
import { useAdmin, adminActions } from "@/utils/store/useAdmin";
import { format } from "date-fns";
import { Save, Trash2, Plus, X } from "lucide-react";
import { useState, useRef } from "react";

export function EventEditModal({ event, close, _date, _time }) {
    const isNew = !event;
    const allMembers = useAdmin(state => state.allMembers);
    const dateInputRef = useRef(null);

    const isRecurring = event?.day_of_the_week != null;

    // State for event fields
    const [title, setTitle] = useState(event?.title || event?.summary || '');
    const [date, setDate] = useState(_date || (event?.date ? new Date(event.date) : new Date()));
    const [repeatWeekly, setRepeatWeekly] = useState(isNew ? false : isRecurring);
    const [dayOfWeek, setDayOfWeek] = useState(event?.day_of_the_week ?? (date.getDay() + 1));
    const [startTime, setStartTime] = useState(event?.start || _time || '08:30');
    const [participants, setParticipants] = useState(event?.participants || []);
    const [showParticipantList, setShowParticipantList] = useState(false);

    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    // Load members data only when needed

    const handleSave = async () => {
        try {
            const endTime = new Date()
            endTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]) + 30);
            const eventData = {
                title: title || 'אירוע',
                start: startTime,
                end: `${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`,
                participants: participants.map(p => p.id),
                day_of_the_week: repeatWeekly ? dayOfWeek : null,
                date: !repeatWeekly ? format(date, 'yyyy-MM-dd') : null,
            };
            if (!isNew) eventData.id = event.id;

            if (isNew) {
                await eventsActions.addEvent(eventData);
            } else {
                await eventsActions.saveEvent(eventData);
            }
            close();
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const handleDelete = async () => {
        if (!event) return;
        try {
            await eventsActions.deleteEvent(event);
            close();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleAddParticipant = (member) => {
        if (!participants.find(p => p.id === member.id)) {
            setParticipants([...participants, member]);
        }
        setShowParticipantList(false);
    };

    const handleRemoveParticipant = (participantId) => {
        setParticipants(participants.filter(p => p.id !== participantId));
    };

    // Filter out already added participants
    const availableMembers = allMembers
        .filter(member => !participants.find(p => p.id === member.id))
        .sort((a, b) => (a.first_name || '').localeCompare(b.first_name || ''));

    return (
        <div className="flex flex-col gap-4 min-w-[400px]">
            <div className="font-bold text-lg mb-2">{isNew ? 'יצירת אירוע חדש' : 'עריכת אירוע'}</div>

            {/* Event Title */}
            <div className="flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="תיאור האירוע"
                    className="border border-gray-300 rounded p-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* Date/Day Selection with repeating checkbox */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    {!repeatWeekly ? (
                        <div
                            className="relative flex-1 cursor-pointer"
                            onClick={() => {
                                if (dateInputRef.current) {
                                    dateInputRef.current.focus();
                                    if (typeof dateInputRef.current.showPicker === "function") {
                                        dateInputRef.current.showPicker();
                                    }
                                }
                            }}
                        >
                            <input
                                id="hebrew-date"
                                type="date"
                                ref={dateInputRef}
                                className="w-full border border-gray-300 rounded p-2 opacity-0 absolute inset-0 cursor-pointer"
                                value={date.toISOString().split('T')[0]}
                                onChange={(e) => {
                                    setDate(new Date(e.target.value));
                                    setDayOfWeek(new Date(e.target.value).getDay() + 1);
                                }}
                            />
                            <div className="border border-gray-300 rounded p-2 bg-white">
                                {formatHebrewDate(date)}
                            </div>
                        </div>
                ) : (
                <select
                    className="flex-1 border border-gray-300 rounded p-2"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                >
                    {days.map((day, index) => (
                        <option key={index} value={index + 1}>יום {day}</option>
                    ))}
                </select>
                    )}
                <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                    <input
                        type="checkbox"
                        checked={repeatWeekly}
                        onChange={(e) => setRepeatWeekly(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="text-sm">חוזר שבועית</span>
                </label>
            </div>
        </div>

            {/* Time Selection */ }
    <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">שעה:</label>
        <input
            type="time"
            className="border border-gray-300 rounded p-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
        />
    </div>

    {/* Participants */ }
    <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">משתתפים:</label>

        {/* Display current participants */}
        <div className="flex flex-wrap gap-2 mb-2">
            {participants.map((participant) => (
                <div key={participant.id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <span>{participant.first_name} {participant.last_name}</span>
                    <button
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className="hover:bg-green-200 rounded-full p-0.5"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ))}
        </div>

        {/* Add participant button */}
        <div className="relative">
            <button
                onClick={() => {
                    if (!showParticipantList) {
                        adminActions.loadData();
                    }
                    setShowParticipantList(!showParticipantList);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
                <Plus className="h-4 w-4" />
                הוספת משתתפים
            </button>

            {/* Participant selection dropdown */}
            {showParticipantList && (
                <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded shadow-lg z-10">
                    {availableMembers.length > 0 ? (
                        availableMembers.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => handleAddParticipant(member)}
                                className="w-full text-right px-4 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                            >
                                {member.first_name} {member.last_name}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-gray-400 text-sm">
                            אין משתתפים זמינים
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>

    {/* Action Buttons */ }
    <div className="flex justify-between gap-2">
        <div>
            {!isNew && (
                <Button onClick={handleDelete} variant="danger">
                    <Trash2 className="ml-2 h-4 w-4" /> מחיקה
                </Button>
            )}
        </div>
        <div className="flex gap-2">
            <Button onClick={close} variant="secondary">
                ביטול
            </Button>
            <Button onClick={handleSave}>
                שמירה <Save className="ml-2 h-4 w-4" />
            </Button>
        </div>
    </div>
        </div >
    )
}

export function EventDetailModal({ event, close }) {
    const isRecurring = event?.day_of_the_week != null;
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    const dateLabel = isRecurring
        ? `יום ${days[(event.day_of_the_week || 1) - 1]} (חוזר שבועית)`
        : event?.date ? formatHebrewDate(new Date(event.date)) : '';

    const timeLabel = event?.start && event?.end
        ? `${event.start} - ${event.end}`
        : event?.start || '';

    return (
        <div className="flex flex-col gap-4 min-w-[400px]">
            <div className="font-bold text-lg mb-2">פרטי אירוע</div>

            <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold">תיאור</div>
                <div className="border border-gray-300 rounded p-2 bg-white">
                    {event?.summary || event?.title || 'אירוע'}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold">תאריך</div>
                <div className="border border-gray-300 rounded p-2 bg-white">
                    {dateLabel}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold">שעה</div>
                <div className="border border-gray-300 rounded p-2 bg-white">
                    {timeLabel}
                </div>
            </div>

            {event?.participants && event.participants.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="text-sm font-semibold">משתתפים</div>
                    <div className="flex flex-wrap gap-2">
                        {event.participants.map((participant) => (
                            <div key={participant.id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                {participant.first_name} {participant.last_name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <Button onClick={close} variant="secondary">סגירה</Button>
            </div>
        </div>
    );
}

// Helper function to format date in Hebrew
function formatHebrewDate(date) {
    const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const months = ['בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני', 'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'];

    const dayOfWeek = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `יום ${dayOfWeek} ${day} ${month} ${year}`;
}

