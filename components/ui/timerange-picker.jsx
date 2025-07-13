// TimeRangePicker.jsx
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function pad2(n) {
  return n.toString().padStart(2, "0");
}

function isValidHour(val) {
  const n = Number(val);
  return /^\d{2}$/.test(val) && n >= 0 && n <= 23;
}

function isValidMinute(val) {
  const n = Number(val);
  return /^\d{2}$/.test(val) && n >= 0 && n <= 59;
}

function timeToMinutes(h, m) {
  return Number(h) * 60 + Number(m);
}

export default function TimeRangePicker({ value, onChange }) {
  const [startHour, setStartHour] = useState(value?.start?.split(':')[0] || "09");
  const [startMinute, setStartMinute] = useState(value?.start?.split(':')[1] || "00");
  const [endHour, setEndHour] = useState(value?.end?.split(':')[0] || "10");
  const [endMinute, setEndMinute] = useState(value?.end?.split(':')[1] || "00");
  const [error, setError] = useState("");

  useEffect(() => {
    if (value && value.start && value.end) {
      const { start, end } = value;
      setStartHour(start.split(':')[0]);
      setStartMinute(start.split(':')[1]);
      setEndHour(end.split(':')[0]);
      setEndMinute(end.split(':')[1]);
    }
  }, [value]);

  function validateAndNotify() {
    setError("");
    if (
      !isValidHour(startHour) ||
      !isValidHour(endHour) ||
      !isValidMinute(startMinute) ||
      !isValidMinute(endMinute)
    ) {
      setError("הזן שעות תקינות (00-23) ודקות (00-59).");
      return;
    }
    const start = timeToMinutes(startHour, startMinute);
    const end = timeToMinutes(endHour, endMinute);
    if (end <= start) {
      setError("שעת הסיום חייבת להיות אחרי שעת ההתחלה.");
      return;
    }
    setError("");
    if (onChange) {
      onChange({
        start: `${pad2(startHour)}:${pad2(startMinute)}`,
        end: `${pad2(endHour)}:${pad2(endMinute)}`,
      });
    }
  }

  function handleInput(setter, validator) {
    return (e) => {
      let val = e.target.value.replace(/\D/g, ""); // Only digits
      if (val.length > 2) val = val.slice(0, 2);
      setter(val);
    };
  }

  return (
    <div className="flex flex-col gap-4 max-w-xs">
      <div className="flex items-center gap-2 ltr">
        <Label htmlFor="startHour" className="sr-only">Start Hour</Label>
        <Input
          id="startHour"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={2}
          className="w-12 text-center"
          value={startHour}
          onChange={handleInput(setStartHour, isValidHour)}
          onBlur={validateAndNotify}
          autoComplete="off"
        />
        <span>:</span>
        <Label htmlFor="startMinute" className="sr-only">Start Minute</Label>
        <Input
          id="startMinute"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={2}
          className="w-12 text-center"
          value={startMinute}
          onChange={handleInput(setStartMinute, isValidMinute)}
          onBlur={validateAndNotify}
          autoComplete="off"
        />
        <span className="mx-2">-</span>
        <Label htmlFor="endHour" className="sr-only">End Hour</Label>
        <Input
          id="endHour"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={2}
          className="w-12 text-center"
          value={endHour}
          onChange={handleInput(setEndHour, isValidHour)}
          onBlur={validateAndNotify}
          autoComplete="off"
        />
        <span>:</span>
        <Label htmlFor="endMinute" className="sr-only">End Minute</Label>
        <Input
          id="endMinute"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={2}
          className="w-12 text-center"
          value={endMinute}
          onChange={handleInput(setEndMinute, isValidMinute)}
          onBlur={validateAndNotify}
          autoComplete="off"
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}
