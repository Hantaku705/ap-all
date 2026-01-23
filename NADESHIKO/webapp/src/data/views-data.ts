// 自動生成ファイル - 手動編集禁止
import viewsJson from './views-data.json';

export interface ViewRecord {
  id: string;
  postDate: string;
  month: string;
  accountName: string;
  prType: string;
  platform: string;
  manager: string;
  title: string;
  url: string;
  category: string;
  duration: number | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  likeRate: number | null;
  commentRate: number | null;
  shareRate: number | null;
  saveRate: number | null;
  avgWatchTime: number | null;
  retentionRate: number | null;
  retention1s: number | null;
  retention3s: number | null;
  retention6s: number | null;
  fullViewRate: number | null;
  newFollows: number | null;
  followRate: number | null;
  recommendRate: number | null;
}

export const viewsData: ViewRecord[] = viewsJson as ViewRecord[];
