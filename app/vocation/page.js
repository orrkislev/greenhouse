'use client';

import WithAuth from '@/components/WithAuth';
import Vocation from './components/Vocation';

export default function Home() {

  return (
    <WithAuth>
        <Vocation/>
    </WithAuth>
  );
}