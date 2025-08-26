export interface SanctuaryRegion {
  key: 'north' | 'south';
  name: string;
  // Tiles that define the sanctuary territory (own any to claim it)
  tileIds: number[];
  points: number; // points awarded if owned
}

export class Sanctuaries {
  // Registry of sanctuary regions (north/south)
  static readonly REGIONS: SanctuaryRegion[] = [
    {
      key: 'north',
      name: 'Northern Sanctuary',
      tileIds: [1],
      points: 1500,
    },
    {
      key: 'south',
      name: 'Southern Sanctuary',
      tileIds: [41],
      points: 1500,
    },
  ];

  static getPointsForColor(
    tileColors: { [id: number]: string },
    color: string
  ): number {
    return Sanctuaries.REGIONS.reduce((sum, s) => {
      const owned = s.tileIds.some((id) => tileColors[id] === color);
      return sum + (owned ? s.points : 0);
    }, 0);
  }

  static list(): SanctuaryRegion[] {
    return [...Sanctuaries.REGIONS];
  }
}

// Back-compat helper
export const SANCTUARY_REGIONS = Sanctuaries.REGIONS;
export function getSanctuaryPointsForColor(
  tileColors: { [id: number]: string },
  color: string
) {
  return Sanctuaries.getPointsForColor(tileColors, color);
}
