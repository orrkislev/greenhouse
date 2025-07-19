'use client';

import WithAuth from '@/components/WithAuth';
import Schedule from '@/app/schedule/components/Schedule';

export default function Home() {

  return (
    <WithAuth>
        <Schedule/>
    </WithAuth>
  );
}
