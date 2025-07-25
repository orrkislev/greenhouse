'use client';

import WithAuth from '@/components/WithAuth';
import MainPage from './main/Main';

export default function Home() {

  return (
    <WithAuth>
        <MainPage/>
    </WithAuth>
  );
}
