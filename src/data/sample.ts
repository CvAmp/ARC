export interface Objective {
  id: string;
  name: string;
  position: [number, number];
}

export interface Zone {
  id: string;
  name: string;
  polygon: [number, number][];
}

export const objectives: Objective[] = [
  { id: 'obj1', name: 'Objective 1', position: [51.505, -0.09] },
  { id: 'obj2', name: 'Objective 2', position: [51.51, -0.1] },
  { id: 'obj3', name: 'Objective 3', position: [51.49, -0.08] },
];

export const zones: Zone[] = [
  {
    id: 'zone1',
    name: 'Zone 1',
    polygon: [
      [51.505, -0.09],
      [51.505, -0.1],
      [51.51, -0.1],
      [51.51, -0.09],
    ],
  },
  {
    id: 'zone2',
    name: 'Zone 2',
    polygon: [
      [51.5, -0.08],
      [51.5, -0.07],
      [51.49, -0.07],
      [51.49, -0.08],
    ],
  },
];
