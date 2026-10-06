import type { Metadata } from 'next';
import { Profile } from '@/components/profile/Profile';

export const metadata: Metadata = { title: 'Perfil' };

export default function ProfilePage() {
  return (
    <div>
      <h1 className="mb-6 text-[clamp(2rem,4vw,2.6rem)]">Perfil</h1>
      <Profile />
    </div>
  );
}
