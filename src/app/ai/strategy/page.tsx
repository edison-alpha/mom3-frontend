import type { Metadata } from "next";

import AiStrategyView from "@/modules/ai/AiStrategyView";

export const metadata: Metadata = {
  title: "AI Yield Strategy | mom3",
  description: "Automated yield strategies across Aave, Morpho, and Aerodrome.",
};

type StrategyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AiStrategyPage({ searchParams }: StrategyPageProps) {
  const params = await searchParams;
  const chainId = Number(first(params.chainId));

  return (
    <AiStrategyView
      selection={{
        protocol: first(params.protocol),
        chainId: Number.isFinite(chainId) && chainId > 0 ? chainId : undefined,
        pool: first(params.pool),
        poolId: first(params.poolId),
      }}
    />
  );
}
