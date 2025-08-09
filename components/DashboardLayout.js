import { tw } from "@/utils/tw"

export const DashboardLayout = tw`flex flex-col`;
export const DashboardPanel = tw`flex pr-4 pt-4 z-2 gap-4`;
export const DashboardPanelButton = tw`text-xs text-stone-500 hover:bg-stone-600 rounded-full
    px-4 py-2 cursor-pointer transition-colors duration-200
    ${props => props.$active ? 'bg-stone-500 text-white font-semibold' : ''}
`;
export const DashboardMain = tw`flex-1 p-4 overflow-y-auto z-1`;
export const DashboardTitle = tw`text-2xl font-bold text-stone-800`;
export const DashboardSubtitle = tw`text-sm text-stone-500`;