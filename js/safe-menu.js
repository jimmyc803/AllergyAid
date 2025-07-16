window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  
  const menuContainer = document.getElementById('menuContainer');
  const restaurantName = document.getElementById('restaurantName');
  const backBtn = document.getElementById('backBtn');

  // Load filtered data
  let menuData;
  try {
    const storedData = sessionStorage.getItem('filteredMenu');
    if (!storedData) throw new Error('No filtered menu found');
    menuData = JSON.parse(storedData);
  } catch (error) {
    console.error("Error:", error);
    restaurantName.textContent = "Menu Not Available";
    menuContainer.innerHTML = `
      <p class="error-message">
        No menu data found. Please go back and select allergens first.
      </p>
    `;
    return;
  }

  // Display restaurant name
  restaurantName.textContent = `${menuData.restaurant} - Safe Menu`;

  // Render menu items
  function renderMenu(items) {
    menuContainer.innerHTML = '';

    if (!items || items.length === 0) {
      menuContainer.innerHTML = `
        <p class="no-items">No safe menu items found for your allergen selection.</p>
      `;
      return;
    }

    // Group by category
    const groupedItems = items.reduce((groups, item) => {
      const category = item.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
      return groups;
    }, {});

    // Create category sections
    Object.entries(groupedItems).forEach(([category, items]) => {
      const section = document.createElement('div');
      section.className = 'menu-section';

      const header = document.createElement('h2');
      header.className = 'category-header';
      header.textContent = category;
      section.appendChild(header);

      items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item';

        const nameElement = document.createElement('h3');
        nameElement.className = 'item-name';
        nameElement.textContent = item.name;
        itemElement.appendChild(nameElement);

        if (item.description) {
          const descElement = document.createElement('p');
          descElement.className = 'item-desc';
          descElement.textContent = item.description;
          itemElement.appendChild(descElement);
        }

        section.appendChild(itemElement);
      });

      menuContainer.appendChild(section);
    });
  }

  // Back button functionality
  backBtn.addEventListener('click', () => {
    window.history.back();
  });

  // Initial render
  renderMenu(menuData.items);
});