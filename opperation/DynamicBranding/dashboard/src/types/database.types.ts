// Supabase 自動生成型定義（手動定義版）
// 本番では `npx supabase gen types typescript` で自動生成

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: number;
          name: string;
          name_en: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          name_en?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          name_en?: string | null;
          color?: string | null;
          created_at?: string;
        };
      };
      weekly_trends: {
        Row: {
          id: number;
          week_start: string;
          brand_id: number | null;
          score: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          week_start: string;
          brand_id?: number | null;
          score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          week_start?: string;
          brand_id?: number | null;
          score?: number | null;
          created_at?: string;
        };
      };
      correlations: {
        Row: {
          id: number;
          brand_a_id: number | null;
          brand_b_id: number | null;
          coefficient: number | null;
          analysis_date: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          brand_a_id?: number | null;
          brand_b_id?: number | null;
          coefficient?: number | null;
          analysis_date?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          brand_a_id?: number | null;
          brand_b_id?: number | null;
          coefficient?: number | null;
          analysis_date?: string;
          created_at?: string;
        };
      };
      seasonality: {
        Row: {
          id: number;
          brand_id: number | null;
          month: number | null;
          avg_score: number | null;
          analysis_date: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          brand_id?: number | null;
          month?: number | null;
          avg_score?: number | null;
          analysis_date?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          brand_id?: number | null;
          month?: number | null;
          avg_score?: number | null;
          analysis_date?: string;
          created_at?: string;
        };
      };
      insights: {
        Row: {
          id: number;
          title: string;
          description: string;
          category: "correlation" | "seasonality" | "strategy" | "risk" | null;
          confidence: "A" | "B" | "C" | null;
          confidence_reason: string | null;
          related_brands: string[] | null;
          action_items: string[] | null;
          sort_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          description: string;
          category?: "correlation" | "seasonality" | "strategy" | "risk" | null;
          confidence?: "A" | "B" | "C" | null;
          confidence_reason?: string | null;
          related_brands?: string[] | null;
          action_items?: string[] | null;
          sort_order?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          category?: "correlation" | "seasonality" | "strategy" | "risk" | null;
          confidence?: "A" | "B" | "C" | null;
          confidence_reason?: string | null;
          related_brands?: string[] | null;
          action_items?: string[] | null;
          sort_order?: number | null;
          created_at?: string;
        };
      };
      sns_mentions: {
        Row: {
          id: number;
          brand_id: number | null;
          mention_count: number;
          share_percentage: number | null;
          analysis_date: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          brand_id?: number | null;
          mention_count: number;
          share_percentage?: number | null;
          analysis_date?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          brand_id?: number | null;
          mention_count?: number;
          share_percentage?: number | null;
          analysis_date?: string;
          created_at?: string;
        };
      };
      sns_cooccurrences: {
        Row: {
          id: number;
          brand_a_id: number | null;
          brand_b_id: number | null;
          cooccurrence_count: number;
          analysis_date: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          brand_a_id?: number | null;
          brand_b_id?: number | null;
          cooccurrence_count: number;
          analysis_date?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          brand_a_id?: number | null;
          brand_b_id?: number | null;
          cooccurrence_count?: number;
          analysis_date?: string;
          created_at?: string;
        };
      };
      sns_sentiments: {
        Row: {
          id: number;
          brand_id: number | null;
          positive_count: number;
          neutral_count: number;
          negative_count: number;
          negative_rate: number | null;
          analysis_date: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          brand_id?: number | null;
          positive_count?: number;
          neutral_count?: number;
          negative_count?: number;
          negative_rate?: number | null;
          analysis_date?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          brand_id?: number | null;
          positive_count?: number;
          neutral_count?: number;
          negative_count?: number;
          negative_rate?: number | null;
          analysis_date?: string;
          created_at?: string;
        };
      };
    };
  };
}

// 便利な型エイリアス
export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type WeeklyTrend = Database["public"]["Tables"]["weekly_trends"]["Row"];
export type Correlation = Database["public"]["Tables"]["correlations"]["Row"];
export type Seasonality = Database["public"]["Tables"]["seasonality"]["Row"];
export type Insight = Database["public"]["Tables"]["insights"]["Row"];
export type SnsMention = Database["public"]["Tables"]["sns_mentions"]["Row"];
export type SnsCooccurrence = Database["public"]["Tables"]["sns_cooccurrences"]["Row"];
export type SnsSentiment = Database["public"]["Tables"]["sns_sentiments"]["Row"];
