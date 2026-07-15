import type { Metadata } from "next";

import DepositView from "@/modules/deposit/DepositView";

export const metadata: Metadata = {
  title: "Deposit",
  description: "Deposit supported assets into your Particle Universal Account.",
};

export default function DepositPage() {
  return <DepositView />;
}

