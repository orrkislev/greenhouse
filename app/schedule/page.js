'use client';

import WithAuth from '@/components/WithAuth';
import Schedule from './components/Schedule';

export default function Home() {

  return (
    <WithAuth>
        <Schedule/>
    </WithAuth>
  );
}
