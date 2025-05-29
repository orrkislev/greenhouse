'use client';

import Schedule from '@/components/schedule/Schedule';
import SideBar from '@/components/side/SideBar';
import TopBar from '@/components/TopBar';
import { tw } from '@/utils/tw';
import useUserDataManager from '@/utils/useUserDataManager';

const Page = tw`rtl bg-linear-to-tl from-yellow-100/50 via-amber-200/50 to-orange-300/50`;
const PageContainer = tw`min-h-screen pt-16 px-32 
  flex items-start justify-center gap-8`;
const SideContainer = tw`flex-[1] relative`;
const MainContainer = tw`flex-[4] relative`;

export default function Home() {
  const userDataManager = useUserDataManager();

  return (
    <Page>
      <TopBar />

      <PageContainer>
        {/* <SideContainer className="flex flex-col items-center justify-start">
          <SideBar />
        </SideContainer> */}
        <MainContainer>
          <Schedule />
        </MainContainer>
      </PageContainer>
    </Page>
  );
}
