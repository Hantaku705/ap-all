'use client';

import { useState, useRef, useEffect } from 'react';

interface AccountSelectorProps {
  accounts: string[];
  selectedAccounts: string[];
  onSelectionChange: (accounts: string[]) => void;
  maxSelection?: number;
  mode: 'single' | 'multi';
}

export default function AccountSelector({
  accounts,
  selectedAccounts,
  onSelectionChange,
  maxSelection = 10,
  mode,
}: AccountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (account: string) => {
    if (mode === 'single') {
      onSelectionChange([account]);
      setIsOpen(false);
    } else {
      if (selectedAccounts.includes(account)) {
        onSelectionChange(selectedAccounts.filter(a => a !== account));
      } else if (selectedAccounts.length < maxSelection) {
        onSelectionChange([...selectedAccounts, account]);
      }
    }
  };

  const label = selectedAccounts.length === 0
    ? 'アカウントを選択'
    : selectedAccounts.length === 1
      ? selectedAccounts[0]
      : `${selectedAccounts.length}件選択中`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border rounded-lg px-3 py-2 text-sm bg-white min-w-[180px] text-left flex items-center justify-between gap-2"
      >
        <span className="truncate">{label}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {accounts.map((account) => (
            <label
              key={account}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type={mode === 'single' ? 'radio' : 'checkbox'}
                checked={selectedAccounts.includes(account)}
                onChange={() => handleToggle(account)}
                disabled={mode === 'multi' && !selectedAccounts.includes(account) && selectedAccounts.length >= maxSelection}
                className="rounded border-gray-300 text-blue-500"
              />
              <span className="text-sm truncate">{account}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
