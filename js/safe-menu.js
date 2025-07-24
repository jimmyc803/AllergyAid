window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  
  const menuContainer = document.getElementById('menuContainer');
  const restaurantName = document.getElementById('restaurantName');
  const backBtn = document.getElementById('backBtn');

  // Add search elements
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'menuItemSearch';
  searchInput.placeholder = 'Search menu items...';
  searchInput.className = 'search-input';

  const searchButton = document.createElement('button');
  searchButton.id = 'searchMenuItemBtn';
  searchButton.textContent = 'Search';
  searchButton.className = 'search-button';

  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(searchButton);

  // Insert search bar after header
  const header = document.querySelector('header');
  header.insertAdjacentElement('afterend', searchContainer);

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
        itemElement.dataset.itemName = item.name.toLowerCase();

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

  // Search functionality
  function searchMenuItems() {
    const searchTerm = document.getElementById('menuItemSearch').value.toLowerCase();
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
      const itemName = item.dataset.itemName;
      if (itemName.includes(searchTerm)) {
        item.style.display = 'block';
        // Show parent category if match found
        item.closest('.menu-category').style.display = 'block';
        item.closest('.category-content').classList.add('expanded');
        item.closest('.menu-category').querySelector('.toggle-icon').textContent = '−';
      } else {
        item.style.display = 'none';
      }
    });

    // Hide empty categories
    document.querySelectorAll('.menu-category').forEach(category => {
      const visibleItems = category.querySelectorAll('.menu-item[style="display: block;"]').length;
      if (visibleItems === 0) {
        category.style.display = 'none';
      }
    });
  }

  // Event listeners
  searchButton.addEventListener('click', searchMenuItems);
  searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      searchMenuItems();
    }
  });

  backBtn.addEventListener('click', () => {
    window.history.back();
  });

  renderMenu(menuData.items);
});