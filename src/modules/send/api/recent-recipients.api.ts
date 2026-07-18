import type { Recipient } from "@/modules/send/types/send.types";

type BackendRecipient = Omit<Recipient, "color"> & {
  chain_id?: number;
  last_used_at?: string;
};

const colors = [
  "from-[#3B33BD] to-[#7E78EA]",
  "from-[#ccff00] to-[#3B33BD]",
  "from-[#2d2eff] to-[#5EA2FF]",
];

function toRecipient(row: BackendRecipient, index: number): Recipient {
  return {
    ...row,
    color: colors[index % colors.length],
    status: "Recent",
  };
}

export async function getRecentRecipients(ownerAddress: string): Promise<Recipient[]> {
  if (!ownerAddress) return [];
  const response = await fetch(
    `/api/recipients/recent?owner_address=${encodeURIComponent(ownerAddress)}`,
    { cache: "no-store" },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Recent recipients are unavailable.");
  return Array.isArray(payload.recipients)
    ? payload.recipients.map(toRecipient)
    : [];
}

export async function saveRecentRecipient(
  ownerAddress: string,
  recipient: Recipient,
  chainId = recipient.network === "Solana" ? 101 : 0,
) {
  if (!ownerAddress || !recipient.address) return null;
  const response = await fetch("/api/recipients/recent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner_address: ownerAddress,
      address: recipient.address,
      chain_id: chainId,
      handle: recipient.handle,
      name: recipient.name,
      network: recipient.network,
    }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = await response.json().catch(() => ({}));
  return payload.recipient ? toRecipient(payload.recipient, 0) : null;
}
