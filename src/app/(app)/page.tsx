import { LevelHero, Mastery, NextStop, Passport } from '@/components/dashboard/Dashboard';
import { Itinerary } from '@/components/trail/Itinerary';
import { Welcome } from '@/components/trail/Welcome';

export default function HomePage() {
  return (
    <div className="grid gap-8 md:gap-10">
      <Welcome />
      <LevelHero />
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="mb-8 xl:hidden"><NextStop /></div>
          <Itinerary />
        </div>
        <aside className="hidden content-start gap-5 xl:sticky xl:top-8 xl:grid">
          <NextStop />
          <Passport />
          <Mastery />
        </aside>
        <div className="grid gap-5 sm:grid-cols-2 xl:hidden">
          <Passport />
          <Mastery />
        </div>
      </div>
    </div>
  );
}
