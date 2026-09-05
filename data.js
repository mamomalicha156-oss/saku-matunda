/**
 * data.js
 * -----------------------------------------------------------------------
 * All the "database" this demo has: category list, product catalog,
 * registered users and placed orders. Everything here lives in memory,
 * so a page refresh resets the store back to its starting state.
 *
 * In a production build this file would disappear entirely — products,
 * users and orders would come from a real backend + database instead,
 * exactly as the original project brief calls for.
 * -----------------------------------------------------------------------
 */

// The aisles customers can filter by. `icon` is just an emoji used
// everywhere we need a quick visual for the category.
const CATEGORIES = [
  { id: 'fruits',     name: 'Fruits',        icon: '🍎' },
  { id: 'veg',        name: 'Vegetables',    icon: '🥦' },
  { id: 'dairy',      name: 'Dairy & Eggs',  icon: '🥛' },
  { id: 'bakery',     name: 'Bakery',        icon: '🍞' },
  { id: 'pantry',     name: 'Pantry',        icon: '🍯' },
  { id: 'beverages',  name: 'Beverages',     icon: '🧃' },
  { id: 'snacks',     name: 'Snacks',        icon: '🥜' },
  { id: 'household',  name: 'Household',     icon: '🧻' },
];

// Simple auto-incrementing id generator for products added through the
// admin panel, continuing on from the seed data below.
let nextProductId = 1;
function makeProduct(fields) {
  return Object.assign({ id: nextProductId++ }, fields);
}

// The starting catalog. Feel free to add, remove or edit entries here —
// everything downstream (grid, search, admin table) just reads this array.
let products = [
  makeProduct({ name: 'Honeycrisp Apples', category: 'fruits', icon: '🍎', price: 3.49, unit: 'per lb', stock: 120,
    desc: "Crisp, sweet-tart apples grown in the highland orchards we've worked with since Saku Grocery opened. Great for snacking or baking.", imageQuery: 'apple,fruit' }),
  makeProduct({ name: 'Ripe Bananas', category: 'fruits', icon: '🍌', price: 0.59, unit: 'per lb', stock: 200,
    desc: 'Naturally ripened bananas, picked at the peak of sweetness. A pantry staple for smoothies and lunchboxes.', imageQuery: 'banana,fruit' }),
  makeProduct({ name: 'Avocados', category: 'fruits', icon: '🥑', price: 1.79, unit: 'each', stock: 8,
    desc: 'Buttery, ready-to-eat avocados. Perfect for toast, guacamole, or slicing into a salad.', imageQuery: 'avocado,fruit' }),
  makeProduct({ name: 'Seedless Watermelon', category: 'fruits', icon: '🍉', price: 6.99, unit: 'each', stock: 0,
    desc: 'A whole seedless watermelon, hand-picked for sweetness and juiciness.', imageQuery: 'watermelon,fruit' }),
  makeProduct({ name: 'Blueberries', category: 'fruits', icon: '🫐', price: 4.29, unit: '6 oz pack', stock: 45,
    desc: 'Plump, antioxidant-rich blueberries, sourced from small regional farms.', imageQuery: 'blueberries,fruit' }),

  makeProduct({ name: 'Broccoli Crowns', category: 'veg', icon: '🥦', price: 2.29, unit: 'each', stock: 60,
    desc: 'Fresh broccoli crowns, firm and deep green — great steamed, roasted, or stir-fried.', imageQuery: 'broccoli,vegetable' }),
  makeProduct({ name: 'Vine Tomatoes', category: 'veg', icon: '🍅', price: 2.99, unit: 'per lb', stock: 5,
    desc: 'Juicy tomatoes still on the vine, picked ripe for maximum flavor.', imageQuery: 'tomato,vegetable' }),
  makeProduct({ name: 'Baby Carrots', category: 'veg', icon: '🥕', price: 1.99, unit: '1 lb bag', stock: 90,
    desc: 'Sweet, crunchy baby carrots — ready to snack on or toss into a roasting pan.', imageQuery: 'carrots,vegetable' }),
  makeProduct({ name: 'Yellow Onions', category: 'veg', icon: '🧅', price: 1.29, unit: 'per lb', stock: 150,
    desc: 'All-purpose yellow onions, the backbone of almost every savory dish.', imageQuery: 'onion,vegetable' }),
  makeProduct({ name: 'Bell Pepper Trio', category: 'veg', icon: '🫑', price: 3.49, unit: '3-pack', stock: 0,
    desc: 'One red, one yellow, one green pepper — crisp and sweet, great raw or roasted.', imageQuery: 'bellpepper,vegetable' }),

  makeProduct({ name: 'Whole Milk', category: 'dairy', icon: '🥛', price: 3.19, unit: 'half gallon', stock: 70,
    desc: 'Creamy whole milk from grass-fed herds, pasteurized and bottled locally.', imageQuery: 'milk,bottle' }),
  makeProduct({ name: 'Free-Range Eggs', category: 'dairy', icon: '🥚', price: 4.49, unit: 'dozen', stock: 6,
    desc: 'A dozen large free-range eggs with rich, golden yolks.', imageQuery: 'eggs,carton' }),
  makeProduct({ name: 'Sharp Cheddar', category: 'dairy', icon: '🧀', price: 5.79, unit: '8 oz block', stock: 38,
    desc: 'Aged sharp cheddar with a bold, tangy bite. Great for slicing or grating.', imageQuery: 'cheddar,cheese' }),
  makeProduct({ name: 'Greek Yogurt', category: 'dairy', icon: '🥣', price: 4.99, unit: '32 oz tub', stock: 0,
    desc: 'Thick, protein-rich Greek yogurt, unsweetened and tangy.', imageQuery: 'yogurt,food' }),

  makeProduct({ name: 'Sourdough Loaf', category: 'bakery', icon: '🍞', price: 5.49, unit: 'each', stock: 22,
    desc: 'Naturally leavened sourdough with a crackling crust, baked fresh each morning.', imageQuery: 'sourdough,bread' }),
  makeProduct({ name: 'Butter Croissants', category: 'bakery', icon: '🥐', price: 4.29, unit: '4-pack', stock: 15,
    desc: 'Flaky, all-butter croissants baked in small batches.', imageQuery: 'croissant,bakery' }),
  makeProduct({ name: 'Cinnamon Bagels', category: 'bakery', icon: '🥯', price: 3.79, unit: '6-pack', stock: 0,
    desc: 'Chewy bagels swirled with cinnamon, best toasted with a little butter.', imageQuery: 'bagel,bakery' }),

  makeProduct({ name: 'Extra Virgin Olive Oil', category: 'pantry', icon: '🫙', price: 9.99, unit: '500ml', stock: 34,
    desc: 'Cold-pressed extra virgin olive oil with a peppery, grassy finish.', imageQuery: 'oliveoil,bottle' }),
  makeProduct({ name: 'Wildflower Honey', category: 'pantry', icon: '🍯', price: 7.49, unit: '12 oz jar', stock: 40,
    desc: 'Raw wildflower honey harvested from small regional apiaries.', imageQuery: 'honey,jar' }),
  makeProduct({ name: 'Penne Pasta', category: 'pantry', icon: '🍝', price: 1.89, unit: '16 oz box', stock: 110,
    desc: 'Durum wheat penne with a good bite, holds sauce beautifully.', imageQuery: 'pasta,food' }),
  makeProduct({ name: 'Basmati Rice', category: 'pantry', icon: '🍚', price: 6.49, unit: '2 lb bag', stock: 4,
    desc: 'Long-grain basmati rice with a fragrant, nutty aroma.', imageQuery: 'rice,food' }),

  makeProduct({ name: 'Cold Brew Coffee', category: 'beverages', icon: '🧋', price: 4.59, unit: '32 oz', stock: 26,
    desc: 'Smooth, low-acid cold brew concentrate, ready to pour over ice.', imageQuery: 'coldbrew,coffee' }),
  makeProduct({ name: 'Orange Juice', category: 'beverages', icon: '🧃', price: 4.99, unit: '59 oz', stock: 0,
    desc: 'Not-from-concentrate orange juice, pressed fresh weekly.', imageQuery: 'orangejuice,drink' }),
  makeProduct({ name: 'Sparkling Water 12-pack', category: 'beverages', icon: '🥤', price: 6.99, unit: '12 cans', stock: 55,
    desc: 'Crisp, unsweetened sparkling water in a chilled 12-can pack.', imageQuery: 'sparklingwater,drink' }),

  makeProduct({ name: 'Roasted Almonds', category: 'snacks', icon: '🥜', price: 6.29, unit: '10 oz bag', stock: 48,
    desc: 'Lightly salted, dry-roasted almonds — a protein-packed snack.', imageQuery: 'almonds,nuts' }),
  makeProduct({ name: 'Kettle Chips', category: 'snacks', icon: '🥔', price: 3.29, unit: '8 oz bag', stock: 0,
    desc: 'Thick-cut, extra-crunchy kettle chips with sea salt.', imageQuery: 'potatochips,snack' }),
  makeProduct({ name: 'Dark Chocolate Bar', category: 'snacks', icon: '🍫', price: 3.99, unit: '3.5 oz', stock: 70,
    desc: '70% single-origin dark chocolate with a clean, slightly fruity snap.', imageQuery: 'chocolate,bar' }),

  makeProduct({ name: 'Paper Towels', category: 'household', icon: '🧻', price: 8.49, unit: '6 rolls', stock: 30,
    desc: 'Extra-absorbent, quick-tearing paper towels for everyday spills.', imageQuery: 'papertowels,household' }),
  makeProduct({ name: 'Dish Soap', category: 'household', icon: '🧴', price: 3.19, unit: '16 oz', stock: 64,
    desc: 'A plant-based dish soap that cuts grease without harsh fumes.', imageQuery: 'dishsoap,bottle' }),
  makeProduct({ name: 'Trash Bags', category: 'household', icon: '🗑️', price: 7.29, unit: '30-count', stock: 0,
    desc: 'Tear-resistant kitchen trash bags with a drawstring close.', imageQuery: 'trashbags,household' }),
];

// One seeded admin account so the admin console is reachable out of the
// box. Anyone who signs up through the storefront gets added here too,
// as a regular (non-admin) customer.
let users = [
  { name: 'Admin', email: 'admin@sakugrocery.com', password: 'admin123', isAdmin: true },
];

// Staff on the operations side — the people who pack orders, deliver
// them, and run the till. Separate from `users` (which is customer /
// admin login accounts) since staff here don't need their own login.
let nextStaffId = 1;
function makeStaff(fields) {
  return Object.assign({ id: nextStaffId++ }, fields);
}

const STAFF_ROLES = ['Store Manager', 'Cashier', 'Packer', 'Delivery Rider', 'Customer Support'];

let staff = [
  makeStaff({ name: 'Grace Kanana', role: 'Store Manager', email: 'grace@sakugrocery.test', phone: '0712 345 001', status: 'Active' }),
  makeStaff({ name: 'Brian Mutuma', role: 'Cashier', email: 'brian@sakugrocery.test', phone: '0712 345 002', status: 'Active' }),
  makeStaff({ name: 'Faith Kaimenyi', role: 'Packer', email: 'faith@sakugrocery.test', phone: '0712 345 003', status: 'Active' }),
  makeStaff({ name: 'Kevin Mwenda', role: 'Delivery Rider', email: 'kevin@sakugrocery.test', phone: '0712 345 004', status: 'On leave' }),
];

// Orders placed at checkout. Newest first (see placeOrder in
// render-checkout.js, which unshifts onto this array).
let nextOrderId = 1001;
let orders = [];
