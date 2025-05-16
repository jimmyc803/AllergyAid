// Test restaurant menu data
const menuItems = [
  { name: "Grilled Chicken Salad", allergens: ["None"], description: "Fresh greens with grilled chicken." },
  { name: "Peanut Butter Sandwich", allergens: ["Peanut"], description: "Classic peanut butter on whole wheat." },
  { name: "Cheese Pizza", allergens: ["Dairy", "Gluten"], description: "Mozzarella cheese on a thin crust." },
  { name: "Vegan Burger", allergens: ["Gluten"], description: "Plant-based patty with lettuce and tomato." },
  { name: "Fruit Salad", allergens: ["None"], description: "Mixed fresh fruits." },
  { name: "Dairy-Free Smoothie", allergens: ["None"], description: "Made with almond milk and fruits." },
  { name: "Vegetarian Pasta", allergens: ["Gluten", "Dairy"], description: "Pasta with tomato sauce and cheese." }
];

// Helper to get query parameters as an object
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const restrictions = params.getAll('restrictions');
  return restrictions.map(r => r.toLowerCase());
}

// Check if item is allowed given restrictions
function isAllowed(item, restrictions) {
  // If user selected 'None', allow everything
  if (restrictions.includes('none')) return true;

  // Check each allergen/restriction of the item
  for (const allergen of item.allergens) {
    if (restrictions.includes(allergen.toLowerCase())) {
      return false;
    }
  }
  return true;
}

// Render menu items to the page
function renderMenu(filteredItems) {
  const section = document.getElementById('results-section');
  section.innerHTML = '';

  if (filteredItems.length === 0) {
    section.innerHTML = '<p>No menu items match your restrictions.</p>';
    return;
  }

  filteredItems.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('menu-item');

    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p><strong>Allergens:</strong> ${item.allergens.join(', ')}</p>
    `;

    section.appendChild(div);
  });
}

// Main function to run on page load
function main() {
  const restrictions = getQueryParams();
  const filtered = menuItems.filter(item => isAllowed(item, restrictions));
  renderMenu(filtered);
}

window.onload = main;
