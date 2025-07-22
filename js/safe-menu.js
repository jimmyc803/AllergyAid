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
      <div class="no-items">
        <i class="fas fa-exclamation-circle"></i>
        <p>No menu data found. Please go back and select allergens first.</p>
      </div>
    `;
    return;
  }

  // Display restaurant name
  restaurantName.textContent = `${menuData.restaurant} - Safe Menu`;

  // Render menu items with collapsible categories
  function renderMenu(items) {
    menuContainer.innerHTML = '';

    if (!items || items.length === 0) {
      menuContainer.innerHTML = `
        <div class="no-items">
          <i class="fas fa-utensils-slash"></i>
          <p>No safe menu items found for your allergen selection.</p>
        </div>
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
      section.className = 'menu-category';

      const header = document.createElement('div');
      header.className = 'category-header';
      header.innerHTML = `
        <h3>${category}</h3>
        <span class="toggle-icon">+</span>
      `;

      const content = document.createElement('div');
      content.className = 'category-content';

      items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item';

        const nameElement = document.createElement('h4');
        nameElement.className = 'item-name';
        nameElement.textContent = item.name;
        
        itemElement.appendChild(nameElement);
        content.appendChild(itemElement);
      });

      // Toggle functionality
      header.addEventListener('click', () => {
        const isExpanded = content.classList.toggle('expanded');
        const icon = header.querySelector('.toggle-icon');
        icon.textContent = isExpanded ? '−' : '+';
      });

      section.appendChild(header);
      section.appendChild(content);
      menuContainer.appendChild(section);
    });
  }

  backBtn.addEventListener('click', () => {
    window.history.back();
  });

  renderMenu(menuData.items);
});