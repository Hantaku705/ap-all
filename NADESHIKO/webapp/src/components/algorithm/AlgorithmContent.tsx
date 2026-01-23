'use client';

import { useState } from 'react';
import { algorithmData } from '@/data/algorithm-data';
import AlgorithmSection from './AlgorithmSection';

export default function AlgorithmContent() {
  const [allOpen, setAllOpen] = useState(false);
  const [key, setKey] = useState(0);

  const toggleAll = () => {
    setAllOpen(!allOpen);
    setKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">TikTok Algorithm Guide</h2>
          <p className="text-gray-600 mt-1">TikTokアルゴリズムの仕組みと攻略法</p>
        </div>
        <button
          onClick={toggleAll}
          className="px-4 py-2 text-sm font-medium text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors whitespace-nowrap"
        >
          {allOpen ? 'すべて閉じる' : 'すべて開く'}
        </button>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-medium text-gray-800 mb-3">目次</h3>
        <div className="flex flex-wrap gap-2">
          {algorithmData.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <span>{section.icon}</span>
              <span className="text-gray-700">{section.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {algorithmData.map((section) => (
          <div key={`${section.id}-${key}`} id={section.id}>
            <AlgorithmSection section={section} defaultOpen={allOpen} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-4">
        <p>Source: algorithm/algorithm.md</p>
      </div>
    </div>
  );
}
