// Brand copy (guidelines 08 Voice & tone). Product, price and order data never live here: they come from the API.
export const brand = {
  name: 'Kesar Mahal', tagline: 'Treasures from Kashmir', endorsement: 'A Spoonup house',
  welcomeLine: 'The valley’s harvest, in your pocket.', storefront: 'kesarmahal'
};
// Display-level shelves. Backend category -> shelf; unknown categories fall into CATCH_ALL so a new admin category never adds a filter.
export const SHELVES = ['Dry Fruits & Berries', 'Kesar', 'Honey', 'Kahwa', 'Pantry', 'Wellness'] as const;
export const CATCH_ALL = 'Pantry';
export const SHELF_OF: Record<string, string> = {
  'Dry Fruits': 'Dry Fruits & Berries', 'Kashmiri Dry Fruits': 'Dry Fruits & Berries', 'Dried Berries': 'Dry Fruits & Berries',
  Kesar: 'Kesar', Saffron: 'Kesar', Honey: 'Honey', Kahwa: 'Kahwa',
  Spices: 'Pantry', Seeds: 'Pantry', Oils: 'Pantry', Food: 'Pantry', 'Healthy Breakfast': 'Pantry', Beauty: 'Wellness', Health: 'Wellness'
};
// Category coding (guidelines 05): kesar = saffron, dry fruits = gold, kahwa/pantry = pine, gifting = crocus.
export const SHELF_COLOR: Record<string, string> = { Kesar: '#C2431B', Kahwa: '#3D5240', Pantry: '#3D5240', Gifting: '#8A5E9C' };
// Gift-box fee products are real catalogue products the owner creates in the Spoonup admin, matched by exact name.
export const BOXES = [
  { key: 'Shikara', n: 3, product: 'Gift Box - Shikara' },
  { key: 'Chinar', n: 4, product: 'Gift Box - Chinar' },
  { key: 'Mahal', n: 6, product: 'Gift Box - Mahal' }
];
export const BOX_COLOURS = [{ name: 'Maroon', hex: '#6B1426' }, { name: 'Ivory', hex: '#F5F1EA' }];
export const NOTE_MAX = 120;
export const MAX_QTY = 50;
export const MAX_LINES = 50;
// Brand promises (guidelines 01: Of the Valley, Graded by Hand, Made to Give) shown on every product page.
export const PROMISES = [
  { icon: 'valley', label: 'Of the valley' }, { icon: 'graded', label: 'Graded by hand' },
  { icon: 'sealed', label: 'Hand-sealed' }, { icon: 'delivery', label: 'India-wide' }
] as const;
export const JOURNEY = ['Placed', 'Packed', 'Shipped', 'At your door'];
