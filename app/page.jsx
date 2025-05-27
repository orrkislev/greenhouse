'use client';

import Schedule from '@/components/schedule/Schedule';
import SideBar from '@/components/side/SideBar';
import { tw } from '@/utils/tw';
import useUserDataManager from '@/utils/useUserDataManager';

const Screen = tw`min-h-screen rtl pt-16 px-32 
  flex items-start justify-center gap-8
  bg-linear-to-tl from-green-100/50 via-teal-100/50 to-cyan-100/50
`;
const SideContainer = tw`flex-[1] relative`;
const MainContainer = tw`flex-[4] relative`;

export default function Home() {
  const userDataManager = useUserDataManager();

  return (
    <Screen>
      <SideContainer className="flex flex-col items-center justify-start">
        <SideBar />
      </SideContainer>
      <MainContainer>
        <Schedule />
      </MainContainer>
    </Screen>
  );
}
