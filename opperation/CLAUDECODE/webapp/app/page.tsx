'use client';

import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { JourneyTab } from './components/tabs/JourneyTab';
import { ExploreTab } from './components/tabs/ExploreTab';
import { PracticeTab } from './components/tabs/PracticeTab';
import { CustomizeTab } from './components/tabs/CustomizeTab';
import { ReferenceTab } from './components/tabs/ReferenceTab';
import { levelGoals, type LevelType } from './data/onboarding-data';

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<LevelType>('beginner');
  const [activeTab, setActiveTab] = useState('journey');
  const [checkedItems, setCheckedItems] = useLocalStorage<Record<string, boolean>>(
    'cc-onboarding-checks',
    {},
  );

  const handleToggleCheck = (level: LevelType, idx: number) => {
    const key = `${level}-${idx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const levelComplete = Object.fromEntries(
    levelGoals.map((g) => [
      g.level,
      g.missions.every((_, i) => checkedItems[`${g.level}-${i}`]),
    ]),
  ) as Record<LevelType, boolean>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        levelComplete={levelComplete}
      />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {activeTab === 'journey' && (
          <JourneyTab
            selectedLevel={selectedLevel}
            checkedItems={checkedItems}
            onToggleCheck={handleToggleCheck}
          />
        )}
        {activeTab === 'explore' && <ExploreTab selectedLevel={selectedLevel} />}
        {activeTab === 'practice' && <PracticeTab selectedLevel={selectedLevel} />}
        {activeTab === 'customize' && <CustomizeTab selectedLevel={selectedLevel} />}
        {activeTab === 'reference' && <ReferenceTab selectedLevel={selectedLevel} />}
      </main>

      <Footer />
    </div>
  );
}
