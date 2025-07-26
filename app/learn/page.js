'use client';

import WithAuth from '@/components/WithAuth';
import Learn from './components/Learn';

export default function Home() {

  return (
    <WithAuth>
        <Learn/>
    </WithAuth>
  );
}
