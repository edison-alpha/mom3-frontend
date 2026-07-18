import type { Metadata } from "next";

import DepositView from "@/modules/deposit/DepositView";

export const metadata: Metadata = {
  title: "Deposit",
  description: "Add supported assets to your wallet.",
};

export default function DepositPage() {
  return <DepositView />;
}
