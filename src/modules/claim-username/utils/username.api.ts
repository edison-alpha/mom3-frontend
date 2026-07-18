import type { ClaimUsernameInput, UsernameIdentity } from "../types/claim-username.types";

async function readPayload(response: Response) {
  return response.json().catch(() => ({})) as Promise<{ error?: string; identity?: UsernameIdentity | null }>;
}

export async function claimUsername(input: ClaimUsernameInput) {
  const response = await fetch("/api/usernames", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: input.username,
      owner_address: input.ownerAddress,
      chain_id: input.chainId,
      address: input.address,
    }),
    cache: "no-store",
  });
  const payload = await readPayload(response);
  if (!response.ok) throw new Error(payload.error || "Unable to claim username.");
  return payload.identity as UsernameIdentity;
}

export async function resolveUsername(username: string, chainId: number) {
  const response = await fetch(`/api/usernames/${encodeURIComponent(username)}?chain_id=${chainId}`, { cache: "no-store" });
  const payload = await readPayload(response);
  if (!response.ok) throw new Error(payload.error || "Username was not found on this chain.");
  const identity = payload.identity as UsernameIdentity;
  try {
    const profileResponse = await fetch(`/api/profile/${encodeURIComponent(identity.owner_address)}`, { cache: "no-store" });
    const profilePayload = await profileResponse.json().catch(() => ({}));
    identity.avatar_url = profilePayload.profile?.avatar_url || null;
  } catch { identity.avatar_url = null; }
  return identity;
}

export async function getMyUsername(ownerAddress: string) {
  const response = await fetch(`/api/usernames/owner/${encodeURIComponent(ownerAddress)}`, { cache: "no-store" });
  const payload = await readPayload(response);
  if (!response.ok) throw new Error(payload.error || "Unable to load username.");
  return payload.identity as UsernameIdentity | null;
}
