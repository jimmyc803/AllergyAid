window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');

  const urlParams = new URLSearchParams(window.location.search);
  const restaurantParam = urlParams.get('name');
  
  const logoImg = document.getElementById('restaurantLogo');
  const restaurantTitle = document.getElementById('restaurantName');
  const allergenForm = document.getElementById('allergenForm');
  const filterGroup = document.querySelector('.filter-group');
  const disclaimerContainer = document.getElementById('restaurantDisclaimer');

  if (!restaurantParam) {
    restaurantTitle.textContent = "Restaurant Not Found";
    if (logoImg) logoImg.style.display = "none";
    filterGroup.innerHTML = '<p>Please select a restaurant from the home page.</p>';
    return;
  }

  const menuUrl = `./data/${restaurantParam}.json`;
  const logoUrl = `./images/logos/${restaurantParam}.png`;

  if (logoImg) {
    logoImg.src = logoUrl;
    logoImg.alt = `${restaurantParam.replace(/-/g, ' ')} logo`;
    logoImg.onerror = () => {
      logoImg.style.display = "none";
    };
  }

  fetch(menuUrl)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(restaurantData => {
      restaurantTitle.textContent = `${restaurantData.name} Menu`;
      filterGroup.innerHTML = '';

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

      allergensToDisplay.forEach(allergen => {
        const label = document.createElement('label');
        label.className = 'filter-option';
        label.innerHTML = `
          <input type="checkbox" name="allergen" value="${allergen.id}">
          <span>${allergen.displayName || allergen.id}</span>
        `;
        
        label.addEventListener('change', function() {
          this.classList.toggle('selected', this.querySelector('input').checked);
        });
        
        filterGroup.appendChild(label);
      });

      // New standardized disclaimer with dynamic website link
      const disclaimerText = "Allergy Data is sourced directly from the official restaurant sites. For full details,";
      
      if (restaurantData.website) {
        disclaimerContainer.innerHTML = `
          <p><strong>Disclaimer:</strong> ${disclaimerText} 
            <a href="${restaurantData.website}" target="_blank" rel="noopener noreferrer">[click here]</a>
          </p>
        `;
      } else {
        disclaimerContainer.innerHTML = `
          <p><strong>Disclaimer:</strong> ${disclaimerText} please consult the restaurant's official website.</p>
        `;
      }
      disclaimerContainer.classList.remove('hidden');
    })
    .catch(error => {
      console.error("Error loading restaurant data:", error);
      restaurantTitle.textContent = "Menu Not Available";
      filterGroup.innerHTML = '<p>Failed to load menu data. Please try again later.</p>';
    });

  allergenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const selectedAllergens = Array.from(
        document.querySelectorAll('input[name="allergen"]:checked')
      ).map(cb => cb.value.toLowerCase());

      const response = await fetch(menuUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const menuData = await response.json();

      const safeItems = menuData.items.filter(item => {
        const itemAllergens = (item.allergens || []).map(a => 
          typeof a === 'string' ? a.toLowerCase() : a.id.toLowerCase()
        );
        return !selectedAllergens.some(allergen => 
          itemAllergens.includes(allergen)
        );
      });

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