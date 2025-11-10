import { tw } from "@/utils/tw"

export const DashboardLayout = tw`flex flex-col w-full`;
export const DashboardPanel = tw`flex pr-2 md:pr-4 pt-2 md:pt-4 z-2 gap-2 md:gap-4 overflow-x-auto`;
export const DashboardPanelButton = tw`text-xs text-stone-500 hover:bg-stone-600 rounded-full
    px-3 md:px-4 py-2 cursor-pointer transition-colors duration-200 whitespace-nowrap flex-shrink-0
    ${props => props.$active ? 'bg-stone-500 text-white font-semibold' : ''}
`;
export const DashboardMain = tw`flex-1 p-2 md:p-4 overflow-y-auto z-1`;
export const DashboardTitle = tw`text-xl md:text-2xl font-bold text-stone-800`;
export const DashboardSubtitle = tw`text-xs md:text-sm text-stone-500`;