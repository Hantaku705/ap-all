"use client";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "deals", label: "Deals", icon: "📝" },
  { id: "performance", label: "Performance", icon: "🏆" },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
