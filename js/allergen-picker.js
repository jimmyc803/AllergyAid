window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantParam = urlParams.get('name');
  
  // Get DOM elements
  const logoImg = document.getElementById('restaurantLogo');
  const restaurantTitle = document.getElementById('restaurantName');
  const allergenForm = document.getElementById('allergenForm');
  const filterGroup = document.querySelector('.filter-group');
  const disclaimerContainer = document.getElementById('restaurantDisclaimer');

  // Validate restaurant parameter
  if (!restaurantParam) {
    restaurantTitle.textContent = "Restaurant Not Found";
    if (logoImg) logoImg.style.display = "none";
    filterGroup.innerHTML = '<p>Please select a restaurant from the home page.</p>';
    return;
  }

  // Set paths
  const menuUrl = `./data/${restaurantParam}.json`;
  const logoUrl = `./images/logos/${restaurantParam}.png`;

  // Set restaurant info
  if (logoImg) {
    logoImg.src = logoUrl;
    logoImg.alt = `${restaurantParam.replace(/-/g, ' ')} logo`;
    logoImg.onerror = () => {
      logoImg.style.display = "none";
    };
  }

  // Load restaurant data and setup form
  fetch(menuUrl)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(restaurantData => {
      // Set restaurant name
      restaurantTitle.textContent = `${restaurantData.name} Menu`;

      // Clear existing checkboxes
      filterGroup.innerHTML = '';

      // Determine which allergens to show
      const allergensToDisplay = restaurantData.customAllergens || [
        {id: 'milk', displayName: 'Milk'},
        {id: 'egg', displayName: 'Egg'},
        {id: 'soy', displayName: 'Soy'},
        {id: 'wheat', displayName: 'Wheat'},
        {id: 'sesame', displayName: 'Sesame'},
        {id: 'tree nuts', displayName: 'Tree Nuts'},
        {id: 'peanut', displayName: 'Peanut'},
        {id: 'fish', displayName: 'Fish'}
      ];

      // Create checkboxes
      allergensToDisplay.forEach(allergen => {
        const label = document.createElement('label');
        label.className = 'filter-option';
        label.innerHTML = `
          <input type="checkbox" name="allergen" value="${allergen.id}">
          <span>${allergen.displayName || allergen.id}</span>
        `;
        
        // Add selection handler
        label.addEventListener('change', function() {
          this.classList.toggle('selected', this.querySelector('input').checked);
        });
        
        filterGroup.appendChild(label);
      });

      // Set disclaimer if it exists
      if (restaurantData.disclaimer) {
        disclaimerContainer.innerHTML = `<p><strong>Note:</strong> ${restaurantData.disclaimer}</p>`;
        disclaimerContainer.classList.remove('hidden');
      } else {
        disclaimerContainer.classList.add('hidden');
      }
    })
    .catch(error => {
      console.error("Error loading restaurant data:", error);
      restaurantTitle.textContent = "Menu Not Available";
      filterGroup.innerHTML = '<p>Failed to load menu data. Please try again later.</p>';
    });

  // Handle form submission
  allergenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      // Get selected allergens
      const selectedAllergens = Array.from(
        document.querySelectorAll('input[name="allergen"]:checked')
      ).map(cb => cb.value.toLowerCase());

      // Fetch menu data
      const response = await fetch(menuUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const menuData = await response.json();

      // Filter items
      const safeItems = menuData.items.filter(item => {
        const itemAllergens = (item.allergens || []).map(a => 
          typeof a === 'string' ? a.toLowerCase() : a.id.toLowerCase()
        );
        return !selectedAllergens.some(allergen => 
          itemAllergens.includes(allergen)
        );
      });

      // Store and redirect
      sessionStorage.setItem('filteredMenu', JSON.stringify({
        restaurant: menuData.name,
        items: safeItems,
        customAllergens: menuData.customAllergens
      }));
      window.location.href = 'safe-menu.html';
      
    } catch (error) {
      console.error("Error loading menu:", error);
      alert("Failed to load menu data. Please try again later.");
    }
  });
});