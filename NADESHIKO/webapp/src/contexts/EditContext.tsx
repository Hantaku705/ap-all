"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Deal, MonthlyTarget } from "@/types/deal";
import { dealsData as initialDealsData } from "@/data/deals-data";
import { targetsData as initialTargetsData } from "@/data/targets-data";
import { v4 as uuidv4 } from "uuid";
import { calculateGrossProfit, calculatePaymentCost60 } from "@/lib/calculations";

interface EditContextType {
  // 編集モード
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  isDirty: boolean;
  isDev: boolean;
  isSaving: boolean;

  // データ
  deals: Deal[];
  targets: MonthlyTarget[];

  // 案件操作
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'grossProfit' | 'paymentCost60'>) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;

  // 目標操作
  updateTarget: (month: string, target: number) => void;

  // 保存
  saveChanges: () => Promise<boolean>;

  // フィルター
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

const STORAGE_KEY_DEALS = 'nadeshiko_deals';
const STORAGE_KEY_TARGETS = 'nadeshiko_targets';

export function EditProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setEditMode] = useState(false);
  const [isDirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deals, setDeals] = useState<Deal[]>(initialDealsData);
  const [targets, setTargets] = useState<MonthlyTarget[]>(initialTargetsData);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const isDev = process.env.NODE_ENV === "development";

  // LocalStorageから読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDeals = localStorage.getItem(STORAGE_KEY_DEALS);
      const storedTargets = localStorage.getItem(STORAGE_KEY_TARGETS);

      if (storedDeals) {
        try {
          setDeals(JSON.parse(storedDeals));
        } catch (e) {
          console.error('Failed to parse deals from localStorage', e);
        }
      }

      if (storedTargets) {
        try {
          setTargets(JSON.parse(storedTargets));
        } catch (e) {
          console.error('Failed to parse targets from localStorage', e);
        }
      }
    }
  }, []);

  // 案件追加
  const addDeal = useCallback((dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'grossProfit' | 'paymentCost60'>) => {
    const now = new Date().toISOString();
    const paymentCost60 = dealData.category === 'RCP' ? calculatePaymentCost60(dealData.cost) : 0;
    const grossProfit = calculateGrossProfit(dealData.sales, dealData.cost, dealData.category);

    const newDeal: Deal = {
      ...dealData,
      id: uuidv4(),
      paymentCost60,
      grossProfit,
      createdAt: now,
      updatedAt: now,
    };

    setDeals(prev => [...prev, newDeal]);
    setDirty(true);
  }, []);

  // 案件更新
  const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== id) return deal;

      const updated = { ...deal, ...updates, updatedAt: new Date().toISOString() };

      // カテゴリ、売上、費用が変更された場合は粗利を再計算
      if (updates.category !== undefined || updates.sales !== undefined || updates.cost !== undefined) {
        const category = updates.category ?? deal.category;
        const sales = updates.sales ?? deal.sales;
        const cost = updates.cost ?? deal.cost;
        updated.paymentCost60 = category === 'RCP' ? calculatePaymentCost60(cost) : 0;
        updated.grossProfit = calculateGrossProfit(sales, cost, category);
      }

      return updated;
    }));
    setDirty(true);
  }, []);

  // 案件削除
  const deleteDeal = useCallback((id: string) => {
    setDeals(prev => prev.filter(deal => deal.id !== id));
    setDirty(true);
  }, []);

  // 目標更新
  const updateTarget = useCallback((month: string, target: number) => {
    setTargets(prev => {
      const existing = prev.find(t => t.month === month);
      if (existing) {
        return prev.map(t => t.month === month ? { ...t, target } : t);
      }
      return [...prev, { month, target }];
    });
    setDirty(true);
  }, []);

  // 保存
  const saveChanges = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);

    try {
      // LocalStorageに保存
      localStorage.setItem(STORAGE_KEY_DEALS, JSON.stringify(deals));
      localStorage.setItem(STORAGE_KEY_TARGETS, JSON.stringify(targets));

      // 開発環境ではファイルにも保存
      if (isDev) {
        const response = await fetch('/api/data/deals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deals, targets }),
        });

        if (!response.ok) {
          console.error('Failed to save to file');
        }
      }

      setDirty(false);
      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [deals, targets, isDev]);

  return (
    <EditContext.Provider
      value={{
        isEditMode,
        setEditMode,
        isDirty,
        isDev,
        isSaving,
        deals,
        targets,
        addDeal,
        updateDeal,
        deleteDeal,
        updateTarget,
        saveChanges,
        selectedMonth,
        setSelectedMonth,
      }}
    >
      {children}
    </EditContext.Provider>
  );
}

export function useEdit() {
  const context = useContext(EditContext);
  if (context === undefined) {
    throw new Error("useEdit must be used within an EditProvider");
  }
  return context;
}
