'use client';

import WithAuth from '@/components/auth/SignIn';
import Schedule from '@/app/schedule/components/Schedule';

export default function Home() {

  return (
    <WithAuth>
        <Schedule edittable={true}/>
    </WithAuth>
  );
}
