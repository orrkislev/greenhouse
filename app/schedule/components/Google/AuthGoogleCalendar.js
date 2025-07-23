import { Button } from "@/components/ui/button";
import { getAuthUrl, getRefreshToken } from "@/utils/GoogleCalendarActions";
import { useUser } from "@/utils/useUser";
import { useRouter, useSearchParams } from "next/navigation";
import { ScheduleSection } from "../Layout";

export default function AuthGoogleCalendar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get('code');

    if (!router) return

    if (code) {
        (async () => {
            const origin = router.basePath || window.location.origin;
            const token = await getRefreshToken(origin, code);
            if (token) {
                useUser.getState().updateUserDoc({
                    googleRefreshToken: token
                })
                router.push('/');
            }
        })();
    }

    const clickAuth = async () => {
        const origin = router.basePath || window.location.origin;
        const url = await getAuthUrl(origin);
        router.push(url);
    }


    return (
        <ScheduleSection name="גוגל" edittable={false} withLabel={true}>
            <div />
            <div />
            <div className='col-span-2'>
                {!code ? (
                    <div className="bg-[#4285F4] hover:bg-[#357ae8] cursor-pointer text-center text-white transition-colors" onClick={clickAuth}>Authorize Google Calendar</div>
                ) : (
                    <div>Processing...</div>
                )}
            </div>
            <div />
            <div />
        </ScheduleSection>
    );
}
