'use client'

import SideBar from "@/components/SideBar";
import WithAuth from "@/components/WithAuth";
import SwitchBackPanel from "./staff/components/SwitchBackPanel";
import { useUser } from "@/utils/store/useUser";
import JournalHandle from "./(journal)/JournalHandle";
import { BGGrads } from "@/components/ContextBar";

export default function RootLayout({ children }) {
	const originalUser = useUser(state => state.originalUser);
	return (
		<WithAuth>
			<BGGrads />
			{/* Desktop: flex row with sidebar, Mobile: flex col with top bar */}
			<div className="flex flex-col md:flex-row h-screen overflow-hidden">
				<SideBar />
				<div className={`relative flex-1 flex flex-col md:flex-row justify-between md:justify-center overflow-y-auto md:overflow-y-hidden ${originalUser ? 'pb-24 md:pb-16' : 'pb-20 md:pb-8'}`}>
					{children}
					<JournalHandle />
					<SwitchBackPanel />
				</div>
			</div>
		</WithAuth>
	);
}
