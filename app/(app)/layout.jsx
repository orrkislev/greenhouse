'use client'

import SideBar from "@/components/SideBar";
import WithAuth from "@/components/WithAuth";
import SwitchBackPanel from "./staff/components/SwitchBackPanel";
import { useUser } from "@/utils/store/useUser";
import JournalHandle from "./(journal)/JournalHandle";
import { BGGrads } from "@/components/ContextBar";
import Hannukah from "@/components/Hannukah";

export default function RootLayout({ children }) {
	const originalUser = useUser(state => state.originalUser);
	return (
		<WithAuth>
			<BGGrads />
			{/* Desktop: flex row with sidebar, Mobile: flex col with top bar */}
			<div className="flex flex-col md:flex-row h-screen overflow-hidden">
				<SideBar />
				<div className={`bg-gradient-to-l from-white to-10% to-transparent relative flex-1 flex flex-col md:flex-row justify-between md:justify-center overflow-y-auto md:overflow-y-hidden`}>
					{children}
					<JournalHandle />
					<SwitchBackPanel />
				</div>
			</div>
			<Hannukah />
		</WithAuth>
	);
}
