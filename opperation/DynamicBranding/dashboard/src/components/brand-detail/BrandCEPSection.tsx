"use client";

import { CEPDiscovery } from "@/components/charts/CEPDiscovery";

interface BrandCEPSectionProps {
  brandName: string;
}

export function BrandCEPSection({ brandName }: BrandCEPSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">CEP発見</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {brandName}が強いCEP（王道）と、意外にエンゲージメントが高いCEPを発見
      </p>
      {/* 王道CEP / 意外なCEP 発見 */}
      <CEPDiscovery brandName={brandName} />
    </section>
  );
}
