import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatCompact } from "@/lib/format";

type Brand = {
  name: string;
  followers: number;
  bandColor: string;
  avatarColor?: string;
};

const DEFAULT_AVATAR = "#0A0A0A";

const HEADING_ID = "loved-brands-title";

const BRANDS: readonly Brand[] = [
  {
    name: "Aave",
    followers: 1200,
    bandColor: "#FFD6E0",
  },
  {
    name: "Morpho",
    followers: 980,
    bandColor: "#D6F5DC",
  },
  {
    name: "Ethena",
    followers: 2400,
    bandColor: "#FFE3C2",
  },
  {
    name: "Base",
    followers: 1700,
    bandColor: "#CFE0FF",
    avatarColor: "#3B33BD",
  },
  {
    name: "Pendle",
    followers: 3100,
    bandColor: "#FFF5C2",
  },
];

function BrandCard({ brand }: { brand: Brand }) {
  const initial = brand.name.charAt(0).toUpperCase();
  const followersLabel = `${formatCompact(brand.followers)} markets`;

  return (
    <Card
      role="article"
      aria-label={`${brand.name}, ${followersLabel}`}
      className="overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.18)]"
    >
      <div
        className="relative h-24"
        style={{ backgroundColor: brand.bandColor }}
      >
        <Avatar
          aria-hidden="true"
          className="absolute -bottom-7 left-1/2 h-14 w-14 -translate-x-1/2 ring-4 ring-white"
        >
          <AvatarFallback
            className="rounded-full text-base font-bold uppercase text-white"
            style={{ backgroundColor: brand.avatarColor ?? DEFAULT_AVATAR }}
          >
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="px-4 pb-5 pt-10 text-center">
        <h3 className="text-sm font-semibold text-ink">{brand.name}</h3>
        <p className="mt-1 text-xs text-text-muted">{followersLabel}</p>
      </div>
    </Card>
  );
}

export default function LovedBrands() {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="bg-white px-5 pt-16 pb-16 md:px-10 md:pt-24 md:pb-24"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-text-muted">
          Trusted markets
        </p>
        <h2
          id={HEADING_ID}
          className="font-display mt-4 text-center text-4xl font-bold uppercase leading-[0.95] tracking-tight text-ink md:text-6xl lg:text-7xl"
        >
          <span className="block">Markets mom3</span>
          <span className="block">can monitor</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-center text-sm text-text-muted md:text-base">
          Review lending and yield opportunities with clear risk context.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 md:mt-14 md:grid-cols-5">
          {BRANDS.map((brand) => (
            <BrandCard key={brand.name} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
