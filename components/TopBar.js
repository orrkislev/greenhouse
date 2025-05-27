import { useUser } from "@/utils/store/user";
import { tw } from "@/utils/tw";

const TopBarDiv = tw`w-full z-50 flex items-center justify-between p-4 bg-white shadow-md`;

export default function TopBar() {
    const user = useUser((state) => state.user);
    const logout = useUser((state) => state.logout);

    return (
        <TopBarDiv>
            <div className="text-lg font-bold">Hi, {user ? user.displayName : ''}!</div>
            <div className="flex items-center gap-4">
                {user && (
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        onClick={logout}
                    >
                        Logout
                    </button>
                )}
            </div>
        </TopBarDiv>
    );
}