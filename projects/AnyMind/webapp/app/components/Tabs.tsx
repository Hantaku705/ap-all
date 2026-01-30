'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Overview', href: '/' },
  { name: 'Annual Summary', href: '/annual' },
  { name: 'P/L Summary', href: '/pl' },
  { name: 'Business Units', href: '/units' },
  { name: 'Budget Progress', href: '/budget' },
  { name: 'Report', href: '/report' },
  { name: 'スライド', href: '/slides' },
];

export default function Tabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
