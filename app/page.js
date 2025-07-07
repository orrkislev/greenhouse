'use client';

import WithAuth from '@/components/auth/SignIn';
import Schedule from '@/components/schedule/Schedule';
import useUserDataManager from '@/utils/useUserDataManager';

export default function Home() {
  useUserDataManager();

  return (
    <WithAuth>
        <Schedule edittable={true}/>
    </WithAuth>
  );
}
