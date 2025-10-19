'use client'

import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import MainNews from "./MainNews";
import { useState } from "react";
import PINInput from "@/components/ui/PIN";
import { userActions, useUser } from "@/utils/store/useUser";
import { AvatarEdit } from "@/components/Avatar";
import Button from "@/components/Button";

export default function MainContext() {
    return (
        <div className="flex flex-col justify-between p-2 h-full">
            <MainNews />
            <div className="flex flex-col gap-3">
                <AvatarEdit />
                <ChangePasswordButton />
            </div>
        </div>
    )
}

export function ChangePasswordButton() {
    const [hover, setHover] = useState(false);
    const [open, setOpen] = useState(false);
    const [newPin, setNewPin] = useState("");
    const [pin, setPin] = useState("");
    const [state, setState] = useState("new");
    const [error, setError] = useState(false);

    const onClick = async () => {
        if (state === "new") {
            setNewPin(pin);
            setPin("");
            setState("confirm1");
        } else if (state === "confirm1") {
            if (newPin === pin) {
                setState("confirm2");
                setPin("");
            } else {
                setError(true);
                setTimeout(() => {
                    setError(false);
                }, 200);
            }
        } else if (state === "confirm2") {
            if (newPin === pin) {
                await userActions.changePin(newPin);
                setState("success");
            } else {
                setError(true);
                setTimeout(() => {
                    setError(false);
                }, 200);
            }
        }
    }

    const onClose = () => {
        setOpen(!open);
        setState("new");
        setPin("");
        setNewPin("");
    }

    return (
        <div className={`flex flex-col justify-center items-center w-full rounded-lg p-4 ${open ? 'border border-red-300' : ''}`}>
            <Button data-role="edit" className="flex gap-2 cursor-pointer border text-red-800 border-red-800 p-2 hover:bg-red-200 transition-all duration-300 text-xs group"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={onClose}>
                <div className="group-hover:-rotate-20 transition-all duration-300">
                    {hover ? <LockKeyholeOpen className="w-4 h-4" /> : <LockKeyhole className="w-4 h-4" />}
                </div>
                <div className="group-hover:text-red-800 group-hover:pr-1 transition-all duration-300">
                    {open ? "סגירה" : "שינוי סיסמה"}
                </div>
            </Button>
            {open && (
                <div className="flex flex-col gap-2 p-2 justify-center items-center w-full">
                    {state != 'success' && (
                        <>
                            <PINInput onChange={e => setPin(e.target.value)} value={pin} withLabel={false} />
                            <div className="text-xs text-stone-500">
                                {state === "new" && "הזן סיסמה חדשה"}
                                {state === "confirm1" && "אימות סיסמה חדשה"}
                                {state === "confirm2" && "אימות סיסמה חדשה שוב"}
                                {state === "success" && "סיסמה שונתה"}
                                {state === "error" && "שגיאה"}
                            </div>
                        </>
                    )}
                    <div className={`relative w-full border border-red-800 hover:border-red-900 transition-all overflow-hidden cursor-pointer bg-red-800/60 text-white flex items-center justify-center p-2 rounded-md ${error ? "shake" : ""}`} onClick={onClick}>
                        <div className="absolute left-0 top-0 h-full bg-red-800 transition-all duration-300 z-0"
                            style={{
                                width: `${state === "new" ? 0 : state === "confirm1" ? 33 : state === "confirm2" ? 66 : state === "success" ? 100 : 0}%`
                            }} />
                        <div className="z-10 text-center text-xs">
                            {state === "new" && "שמור"}
                            {state === "confirm1" && "אישור"}
                            {state === "confirm2" && "אישור"}
                            {state === "success" && "כל הכבוד"}
                            {state === "error" && "שגיאה"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}