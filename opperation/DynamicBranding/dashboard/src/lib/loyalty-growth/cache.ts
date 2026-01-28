/**
 * Loyalty Growth Cache Operations
 *
 * キャッシュの取得・保存・検証
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { LoyaltyGrowthOutput, LoyaltyGrowthResponse } from "./types";

// Lazy initialization of Supabase client
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are required"
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

// ============================================
// Cache Types
// ============================================

interface CacheRow {
  id: number;
  corp_id: number;
  data: LoyaltyGrowthOutput;
  llm_model: string;
  input_hash: string;
  generated_at: string;
  expires_at: string;
}

// ============================================
// Cache Operations
// ============================================

/**
 * Get cached loyalty growth data if valid
 */
export async function getCachedLoyaltyGrowth(
  corpId: number,
  currentInputHash: string
): Promise<LoyaltyGrowthResponse | null> {
  try {
    const { data, error } = await getSupabase()
      .from("loyalty_growth_cache")
      .select("*")
      .eq("corp_id", corpId)
      .single();

    if (error || !data) {
      return null;
    }

    const cacheRow = data as CacheRow;

    // Check if expired
    const expiresAt = new Date(cacheRow.expires_at);
    if (expiresAt < new Date()) {
      console.log(`Cache expired for corp_id=${corpId}`);
      return null;
    }

    // Check if input data changed
    if (cacheRow.input_hash !== currentInputHash) {
      console.log(`Cache invalidated due to input change for corp_id=${corpId}`);
      return null;
    }

    // Return cached data
    return {
      ...cacheRow.data,
      generatedAt: cacheRow.generated_at,
      cached: true,
      inputHash: cacheRow.input_hash,
    };
  } catch (error) {
    console.error("Error fetching cache:", error);
    return null;
  }
}

/**
 * Save loyalty growth data to cache
 */
export async function saveLoyaltyGrowthCache(
  corpId: number,
  output: LoyaltyGrowthOutput,
  llmModel: string,
  inputHash: string
): Promise<boolean> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const { error } = await getSupabase()
      .from("loyalty_growth_cache")
      .upsert(
        {
          corp_id: corpId,
          data: output,
          llm_model: llmModel,
          input_hash: inputHash,
          generated_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        } as never,
        {
          onConflict: "corp_id",
        }
      );

    if (error) {
      console.error("Error saving cache:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving cache:", error);
    return false;
  }
}

/**
 * Invalidate cache for a corporation
 */
export async function invalidateCache(corpId: number): Promise<boolean> {
  try {
    const { error } = await getSupabase()
      .from("loyalty_growth_cache")
      .delete()
      .eq("corp_id", corpId);

    if (error) {
      console.error("Error invalidating cache:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error invalidating cache:", error);
    return false;
  }
}

/**
 * Check if cache exists and is valid (without returning data)
 */
export async function isCacheValid(
  corpId: number,
  currentInputHash: string
): Promise<boolean> {
  try {
    const { data, error } = await getSupabase()
      .from("loyalty_growth_cache")
      .select("expires_at, input_hash")
      .eq("corp_id", corpId)
      .single();

    if (error || !data) {
      return false;
    }

    const { expires_at, input_hash } = data;

    // Check expiration
    if (new Date(expires_at) < new Date()) {
      return false;
    }

    // Check input hash
    if (input_hash !== currentInputHash) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get cache metadata (for debugging/monitoring)
 */
export async function getCacheMetadata(corpId: number): Promise<{
  exists: boolean;
  generatedAt?: string;
  expiresAt?: string;
  llmModel?: string;
  inputHash?: string;
  isExpired?: boolean;
} | null> {
  try {
    const { data, error } = await getSupabase()
      .from("loyalty_growth_cache")
      .select("generated_at, expires_at, llm_model, input_hash")
      .eq("corp_id", corpId)
      .single();

    if (error || !data) {
      return { exists: false };
    }

    return {
      exists: true,
      generatedAt: data.generated_at,
      expiresAt: data.expires_at,
      llmModel: data.llm_model,
      inputHash: data.input_hash,
      isExpired: new Date(data.expires_at) < new Date(),
    };
  } catch {
    return null;
  }
}
