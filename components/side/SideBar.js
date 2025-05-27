import SignInFormSideBar from './SignInFormSideBar';
import TasksSideBar from './TasksSideBar';
import EventsSideBar from './EventsSideBar';
import { tw } from '@/utils/tw';
import { useUser } from '@/utils/store/user';

const SideBarDiv = tw`flex flex-col items-center justify-start h-full p-4 
    border-l-1 border-black/30 gap-8
`;
const Divider = tw`w-full h-px bg-black/30`;

export default function SideBar() {
    const user = useUser((state) => state.user);
    return (
        <SideBarDiv>
            {!user ? (
                <SignInFormSideBar />
            ) : (
                <>
                    <TasksSideBar />
                    <Divider />
                    <EventsSideBar />
                </>
            )}
        </SideBarDiv>
    );
}