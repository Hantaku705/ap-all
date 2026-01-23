'use client';

import { useState } from 'react';
import type { AlgorithmSection as AlgorithmSectionType, AlgorithmContentItem } from '@/data/algorithm-data';

interface Props {
  section: AlgorithmSectionType;
  defaultOpen?: boolean;
}

function renderTable(data: { headers: string[]; rows: Record<string, string>[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            {data.headers.map((header, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {data.headers.map((header, j) => (
                <td key={j} className="px-3 py-2 border-b border-gray-200">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderContent(item: AlgorithmContentItem, index: number) {
  const key = `content-${index}`;

  switch (item.type) {
    case 'text':
      return (
        <div key={key} className="mb-4">
          {item.title && <h4 className="font-medium text-gray-800 mb-2">{item.title}</h4>}
          <p className="text-gray-700">{item.data as string}</p>
        </div>
      );

    case 'table':
      return (
        <div key={key} className="mb-4">
          {item.title && <h4 className="font-medium text-gray-800 mb-2">{item.title}</h4>}
          {renderTable(item.data as { headers: string[]; rows: Record<string, string>[] })}
        </div>
      );

    case 'code':
      return (
        <div key={key} className="mb-4">
          {item.title && <h4 className="font-medium text-gray-800 mb-2">{item.title}</h4>}
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
            {item.data as string}
          </pre>
        </div>
      );

    case 'quote':
      return (
        <div key={key} className="mb-4">
          {item.title && <h4 className="font-medium text-gray-800 mb-2">{item.title}</h4>}
          <blockquote className="border-l-4 border-pink-400 pl-4 py-2 bg-pink-50 rounded-r-lg">
            <p className="text-gray-700 whitespace-pre-line">{item.data as string}</p>
          </blockquote>
        </div>
      );

    case 'list':
      return (
        <div key={key} className="mb-4">
          {item.title && <h4 className="font-medium text-gray-800 mb-2">{item.title}</h4>}
          <ul className="list-disc list-inside space-y-1">
            {(item.data as string[]).map((text, i) => (
              <li key={i} className="text-gray-700">{text}</li>
            ))}
          </ul>
        </div>
      );

    default:
      return null;
  }
}

export default function AlgorithmSection({ section, defaultOpen = false }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-gray-500">{section.description}</p>
            )}
          </div>
        </div>
        <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
          {section.content.map((item, index) => renderContent(item, index))}
        </div>
      )}
    </div>
  );
}
