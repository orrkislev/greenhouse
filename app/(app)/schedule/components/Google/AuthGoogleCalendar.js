import Button from "@/components/Button";
import { getAuthUrl, getRefreshToken } from "@/utils/actions/google actions";
import { userActions, useUser } from "@/utils/store/useUser";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthGoogleCalendar() {
    const user = useUser(state => state.user);
    const router = useRouter();

    if (user.googleRefreshToken) return null;

    const clickAuth = async () => {
        localStorage.setItem('redirectUrl', window.location.pathname);
        const origin = window.location.origin;
        const url = await getAuthUrl(origin);
        router.push(url);
    }


    return (
        <Button onClick={clickAuth} className="justify-center">
            <Icon icon="devicon:google" className="w-4 h-4" />
            חיבור חשבון גוגל 
        </Button>
    );
}



export function AuthGoogleListener() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get('code');

    console.log('found google code!', code);

    if (code) {
        (async () => {
            const origin = window.location.origin;
            const token = await getRefreshToken(origin, code);
            if (token) {
                userActions.updateUserData({
                    googleRefreshToken: token
                })
                const redirectUrl = localStorage.getItem('redirectUrl') || '/';
                localStorage.removeItem('redirectUrl');
                if (router) router.push(redirectUrl);
            }
        })();
    }

    return null;
}