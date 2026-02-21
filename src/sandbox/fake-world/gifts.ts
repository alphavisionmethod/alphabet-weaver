import type { SeededRNG } from '../utils/seeded-rng';

export interface GiftOption {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryDays: number;
  memorySource: string;
  category: string;
}

export function generateGiftOptions(rng: SeededRNG): GiftOption[] {
  const gifts: GiftOption[] = [
    {
      id: 'gift_1',
      name: 'Personalized Star Map',
      description: 'A framed star map showing the night sky on your wedding date, printed on archival paper.',
      price: 89 + rng.int(0, 20),
      deliveryDays: 5 + rng.int(0, 3),
      memorySource: 'Calendar event: Wedding Anniversary (extracted date)',
      category: 'Sentimental',
    },
    {
      id: 'gift_2',
      name: 'Weekend Spa Package',
      description: 'Couples spa day at a luxury resort with massage, facial, and champagne lunch.',
      price: 250 + rng.int(0, 50),
      deliveryDays: 1,
      memorySource: 'Partner preference notes: "loves spa days"',
      category: 'Experience',
    },
    {
      id: 'gift_3',
      name: 'Custom Photo Book',
      description: 'A 40-page hardcover photo book curated from your shared photo library highlights.',
      price: 65 + rng.int(0, 15),
      deliveryDays: 7 + rng.int(0, 3),
      memorySource: 'Shared photo library: top 50 moments by engagement',
      category: 'Keepsake',
    },
  ];
  return gifts;
}
