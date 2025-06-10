'use client';

import WithAuth from '@/components/auth/SignIn';
import Schedule from '@/components/schedule/Schedule';
import TopBar from '@/components/TopBar';
import { tw } from '@/utils/tw';
import useUserDataManager from '@/utils/useUserDataManager';

const PageContainer = tw`flex items-center justify-start h-screen rtl flex-col gap-4 p-4`;
const MainContainer = tw`w-[80vw] flex-1 gap-4 flex-col`;

export default function Home() {
  useUserDataManager();

  return (
    <WithAuth>
        <TopBar />

        <PageContainer>
          <MainContainer>
            <Schedule edittable={true}/>
          </MainContainer>
        </PageContainer>
    </WithAuth>
  );
}
