import Box2 from "@/components/Box2";
import { Briefcase } from "lucide-react";
import { useVocation, useVocationData, vocationActions } from "@/utils/store/useVocation";
import Link from "next/link";
import Button from "@/components/Button";
import { useEffect } from "react";
import { format } from "date-fns";
import { daysOfWeek } from "@/utils/store/useTime";

export default function MainVocation() {
    const jobs = useVocation();
    const checkins = useVocationData(s => s.checkins);
    const job = jobs.find(j => j.is_active) ?? null;

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayDayIndex = new Date().getDay();
    const isTodayWorkDay = job?.days_of_week?.includes(todayDayIndex) ?? false;
    const todayCheckin = checkins.find(c => c.checkin_date === today);

    useEffect(() => {
        if (job?.id) vocationActions.loadCheckins();
    }, [job?.id]);

    return (
        <Box2 label="תעסוקה" LabelIcon={Briefcase} className="min-h-[100px] col-span-2">
            {job ? (
                <div className="flex flex-col gap-2">
                    <div className="text-sm">
                        <span className="font-bold">{job.place_of_work}</span>
                        {job.position && <span className="text-stone-400 mr-1 text-xs">· {job.position}</span>}
                    </div>
                    {isTodayWorkDay && !todayCheckin && (
                        <Link href="/vocation">
                            <button className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg py-1.5 transition-colors">
                                אני בעבודה היום ›
                            </button>
                        </Link>
                    )}
                    {isTodayWorkDay && todayCheckin && (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                            ✓ נרשמת היום{todayCheckin.hours ? ` · ${todayCheckin.hours}ש׳` : ''}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-stone-400 text-center text-sm">
                    אין לי תעסוקה פעילה
                </div>
            )}
            <Link href="/vocation" className="absolute bottom-2 left-2">
                <Button>
                    <Briefcase className="w-4 h-4" />
                    תעסוקה
                </Button>
            </Link>
        </Box2>
    )
}