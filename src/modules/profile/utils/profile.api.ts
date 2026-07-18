import type { UserProfile } from "../types/profile.types";

export async function getUserProfile(ownerAddress: string) {
  const response = await fetch(`/api/profile/${encodeURIComponent(ownerAddress)}`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Unable to load profile.");
  return payload.profile as UserProfile | null;
}

export async function uploadProfileAvatar(input: { ownerAddress: string; data: string; contentType: string; fileName: string }) {
  const response = await fetch("/api/profile/avatar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ owner_address: input.ownerAddress, data: input.data, content_type: input.contentType, file_name: input.fileName }) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Unable to upload profile photo.");
  return payload.profile as UserProfile;
}
