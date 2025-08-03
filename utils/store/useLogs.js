import { create } from "zustand";
import { useUser } from "@/utils/store/useUser";
import { db } from "@/utils//firebase/firebase";
import { useTime } from "@/utils/store/useTime";
import { useTasks } from "@/utils/store/useTasks";
import { useRef } from "react";
import { arrayUnion, doc, setDoc } from "firebase/firestore";

export const useLogs = create((set, get) => ({
    logs: [],
    addLog: async (log) => {
        const userId = useUser.getState().user?.id;
        if (!userId) return;
        const newLog = { ...log, timestamp: new Date().toISOString() };
        const today = useTime.getState().today;
        const docRef = doc(db, 'users', userId, 'logs', today);
        await setDoc(docRef, { logs: arrayUnion(newLog) }, { merge: true });
        set((state) => ({ logs: [...state.logs, newLog] }));

        if (log.task) useTasks.getState().onLogTask(log.task, log);
        if (log.record) useTasks.getState().onLogRecord(log.record, log);
    },
    clearLogs: () => set({ logs: [] }),
}));

export const logsActions = Object.fromEntries(
    Object.entries(useLogs.getState()).filter(([key, value]) => typeof value === 'function')
);







export const useLogSender = (log) => {
    const logSent = useRef(false);
    const sendLog = () => {
        if (logSent.current) return;
        logSent.current = true;
        logsActions.addLog(log);
    }
    return sendLog;
}