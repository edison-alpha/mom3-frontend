export type ProfileStat = {
  label: string;
  value: string;
  sub: string;
};

export type ProfileUsername = { username: string; owner_address: string; address: string | null; addresses: Record<string, string> };

export type ProfileActionRow = {
  icon: string;
  label: string;
  value: string;
  href: string;
};

export type ProfileIdentityRow = {
  icon: string;
  label: string;
  value: string;
};

export type UniversalAccountRow = {
  icon: string;
  label: string;
  description: string;
  address: string;
};
