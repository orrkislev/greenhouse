import { tw } from "@/utils/tw"

export const DashboardLayout = tw`flex flex-col mt-4`;
export const DashboardPanel = tw`flex pr-4 pt-4 z-2 gap-4`;
export const DashboardPanelButton = tw`text-xs text-gray-500 hover:bg-gray-600 rounded-full
    px-4 py-2 cursor-pointer transition-colors duration-200
    ${props => props.$active ? 'bg-gray-500 text-white font-semibold' : ''}
`;
export const DashboardMain = tw`flex-1 p-4 overflow-y-auto z-1`;