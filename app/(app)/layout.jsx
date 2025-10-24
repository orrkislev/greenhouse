'use client'

import SideBar from "@/components/SideBar";
import WithAuth from "@/components/WithAuth";
import SwitchBackPanel from "./staff/components/SwitchBackPanel";
import { useUser } from "@/utils/store/useUser";
import JournalHandle from "./(journal)/JournalHandle";

export default function RootLayout({ children }) {
	const originalUser = useUser(state => state.originalUser);
	return (
		<WithAuth>
			<div className="flex h-screen overflow-y-hidden overscroll-none ">
				<SideBar />
				<div className={`relative flex-1 flex justify-between justify-center ${originalUser ? 'pb-16' : 'pb-8'}`}>
					{children}
					<JournalHandle />
					<SwitchBackPanel />
				</div>
			</div>
		</WithAuth>
	);
}
