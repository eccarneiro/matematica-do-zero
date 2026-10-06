import { Trail } from '@/components/trail/Trail';
import { Welcome } from '@/components/trail/Welcome';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[560px]">
      <Welcome />
      <Trail />
    </div>
  );
}
