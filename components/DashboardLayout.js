import { tw } from "@/utils/tw"

export const DashboardLayout = tw`flex flex-col w-full overflow-y-hidden overflow-x-auto`;
export const DashboardPanel = tw`flex pr-2 bg-pastel-5/40 border-b border-pastel-6/50 md:pr-4 py-1 z-2 gap-2 md:gap-4 overflow-x-auto`;
export const DashboardPanelButton = tw`relative text-xs text-stone-500 hover:bg-white hover:text-black rounded-full 
    px-3 md:px-4 py-2 cursor-pointer transition-colors duration-200 whitespace-nowrap flex-shrink-0
    ${props => props.$active ? 'bg-white text-black font-semibold border border-pastel-6/50' : ''}
`;
export const DashboardMain = tw`flex-1 overflow-y-auto z-1 pb-24`;
export const DashboardTitle = tw`text-xl md:text-2xl font-bold text-stone-800`;
export const DashboardSubtitle = tw`text-xs md:text-sm text-stone-500`;