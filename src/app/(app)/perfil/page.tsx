import type { Metadata } from 'next';
import { Profile } from '@/components/profile/Profile';

export const metadata: Metadata = { title: 'Perfil' };

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-[620px]">
      <h1 className="mb-6 text-[2rem]">Perfil</h1>
      <Profile />
    </div>
  );
}
