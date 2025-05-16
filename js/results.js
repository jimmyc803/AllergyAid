function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const restrictions = params.getAll('restrictions');
  return restrictions.map(r => r.toLowerCase());
}

function isAllowed(item, restrictions) {
  if (restrictions.includes('none')) return true;

  for (const allergen of item.allergens) {
    if (restrictions.includes(allergen.toLowerCase())) {
      return false;
    }
  }
  return true;
}

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

async function main() {
  const restrictions = getQueryParams();

  try {
    const response = await fetch('./data/menu.json'); // adjust path if needed
    const menuItems = await response.json();

    const filtered = menuItems.filter(item => isAllowed(item, restrictions));
    renderMenu(filtered);
  } catch (error) {
    document.getElementById('results-section').innerHTML = '<p>Error loading menu.</p>';
    console.error('Error fetching menu:', error);
  }
}

window.onload = main;
