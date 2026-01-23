'use client';

import { AccountViewRanking, ManagerViewRanking } from '@/lib/view-calculations';
import { formatNumber } from '@/lib/formatters';

interface AccountRankingProps {
  accountRanking: AccountViewRanking[];
  managerRanking: ManagerViewRanking[];
}

export default function AccountRanking({
  accountRanking,
  managerRanking,
}: AccountRankingProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">&#9650;</span>;
      case 'down':
        return <span className="text-red-500">&#9660;</span>;
      default:
        return <span className="text-gray-400">&#9644;</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* アカウント別ランキング */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">アカウント別 TOP10</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 w-8">#</th>
                <th className="pb-2">アカウント</th>
                <th className="pb-2 text-right">総再生数</th>
                <th className="pb-2 text-right">平均</th>
                <th className="pb-2 text-right">投稿</th>
                <th className="pb-2 text-center">トレンド</th>
              </tr>
            </thead>
            <tbody>
              {accountRanking.map((account, index) => (
                <tr key={account.accountName} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-bold text-gray-500">{index + 1}</td>
                  <td className="py-2 truncate max-w-32" title={account.accountName}>
                    {account.accountName}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {formatNumber(account.totalViews)}
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {formatNumber(Math.round(account.avgViews))}
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {account.postCount}
                  </td>
                  <td className="py-2 text-center">
                    {getTrendIcon(account.trend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 担当者別ランキング */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">担当者別 TOP10</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 w-8">#</th>
                <th className="pb-2">担当者</th>
                <th className="pb-2 text-right">総再生数</th>
                <th className="pb-2 text-right">平均</th>
                <th className="pb-2 text-right">投稿</th>
                <th className="pb-2 text-right">アカウント</th>
              </tr>
            </thead>
            <tbody>
              {managerRanking.map((manager, index) => (
                <tr key={manager.manager} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-bold text-gray-500">{index + 1}</td>
                  <td className="py-2">{manager.manager}</td>
                  <td className="py-2 text-right font-semibold">
                    {formatNumber(manager.totalViews)}
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {formatNumber(Math.round(manager.avgViews))}
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {manager.postCount}
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {manager.accountCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
