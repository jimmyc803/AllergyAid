window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  
  const menuContainer = document.getElementById('menuContainer');
  const restaurantName = document.getElementById('restaurantName');
  const backBtn = document.getElementById('backBtn');


  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'menuItemSearch';
  searchInput.placeholder = 'Search menu items...';
  searchInput.className = 'search-input';
  
 
  const header = document.querySelector('header');
  header.insertAdjacentElement('afterend', searchContainer);
  searchContainer.appendChild(searchInput);


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
        <p>No menu data found. Please go back and select allergens first.</p>
      </div>
    `;
    return;
  }


  restaurantName.textContent = `${menuData.restaurant} - Safe Menu`;


  function renderMenu(items, searchTerm = '') {
    menuContainer.innerHTML = '';

    if (!items || items.length === 0) {
      menuContainer.innerHTML = `
        <div class="no-items">
          <p>${searchTerm ? `No items match "${searchTerm}"` : 'No safe menu items found for your allergen selection.'}</p>
        </div>
      `;
      return;
    }

   
    const groupedItems = items.reduce((groups, item) => {
      const category = item.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
      return groups;
    }, {});

 
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
        const itemName = item.name.toLowerCase();
        if (!searchTerm || itemName.includes(searchTerm.toLowerCase())) {
          const itemElement = document.createElement('div');
          itemElement.className = 'menu-item';
          
          const nameElement = document.createElement('h4');
          nameElement.className = 'item-name';
          nameElement.textContent = item.name;
          
          itemElement.appendChild(nameElement);
          content.appendChild(itemElement);
        }
      });

     
      if (content.children.length > 0) {
     
        header.addEventListener('click', () => {
          const isExpanded = content.classList.toggle('expanded');
          const icon = header.querySelector('.toggle-icon');
          icon.textContent = isExpanded ? '−' : '+';
        });

        section.appendChild(header);
        section.appendChild(content);
        menuContainer.appendChild(section);
      }
    });

    if (menuContainer.children.length === 0 && searchTerm) {
      menuContainer.innerHTML = `
        <div class="no-items">
          <p>No items match "${searchTerm}"</p>
        </div>
      `;
    }
  }

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim();
    renderMenu(menuData.items, searchTerm);
  });

 
  backBtn.addEventListener('click', () => {
    window.history.back();
  });


  renderMenu(menuData.items);
});