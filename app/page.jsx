'use client';

import Main from '@/components/schedule/Main';
// import { AuthPage } from '../components/auth/AuthPage';
import { useUser } from '../utils/store/user';

export default function Home() {
  // const { user, loading } = useUser();

  return <Main />

  // if (!user) {
  //   return <AuthPage />;
  // }
}
