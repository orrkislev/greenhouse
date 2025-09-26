import { useState } from "react";

export default function TimeRange({ onUpdate, defaultValue }) {
  const [timeA, setTimeA] = useState(defaultValue.start || "10:00");
  const [timeB, setTimeB] = useState(defaultValue.end || "11:00");

  const start = timeA < timeB ? timeA : timeB;
  const end = timeA < timeB ? timeB : timeA;
  if (start != defaultValue.start || end != defaultValue.end) {
    onUpdate({ start, end });
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <input
        type="time"
        defaultValue={timeA}
        onBlur={(e) => setTimeA(e.target.value)}
        className="rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
      />
      <input
        type="time"
        defaultValue={timeB}
        onBlur={(e) => setTimeB(e.target.value)}
        className="rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
      />
    </div>
  );
}