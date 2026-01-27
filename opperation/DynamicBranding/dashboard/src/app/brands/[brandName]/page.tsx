import { notFound } from "next/navigation";
import { Metadata } from "next";
import { BrandDetailClient } from "./BrandDetailClient";

const VALID_BRANDS = [
  "ほんだし",
  "クックドゥ",
  "味の素",
  "丸鶏がらスープ",
  "香味ペースト",
  "コンソメ",
  "ピュアセレクト",
  "アジシオ",
];

interface PageProps {
  params: Promise<{ brandName: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brandName } = await params;
  const decodedBrand = decodeURIComponent(brandName);

  if (!VALID_BRANDS.includes(decodedBrand)) {
    return { title: "ブランドが見つかりません" };
  }

  return {
    title: `${decodedBrand} - ブランド詳細 | DynamicBranding`,
    description: `${decodedBrand}のSNS分析・Google Trends・CEP分析の詳細レポート`,
  };
}

export async function generateStaticParams() {
  return VALID_BRANDS.map((brand) => ({
    brandName: brand,
  }));
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { brandName } = await params;
  const decodedBrand = decodeURIComponent(brandName);

  if (!VALID_BRANDS.includes(decodedBrand)) {
    notFound();
  }

  return <BrandDetailClient brandName={decodedBrand} />;
}
