window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantParam = urlParams.get('name'); // 'chickfila' from URL
  
  // Get DOM elements
  const logoImg = document.getElementById('restaurantLogo');
  const restaurantTitle = document.getElementById('restaurantName');
  const allergenForm = document.getElementById('allergenForm');

  // Validate restaurant parameter
  if (!restaurantParam) {
    restaurantTitle.textContent = "Restaurant Not Found";
    if (logoImg) logoImg.style.display = "none";
    menuContainer.innerHTML = '<p>Please select a restaurant from the home page.</p>';
    return;
  }

  // Set paths - ensure these match your actual file structure
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

  // Format display name
  const readableName = restaurantParam
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  restaurantTitle.textContent = `${readableName} Menu`;

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
        const itemAllergens = (item.allergens || []).map(a => a.toLowerCase());
        return !selectedAllergens.some(allergen => 
          itemAllergens.includes(allergen)
        );
      });

      // Store and redirect
      sessionStorage.setItem('filteredMenu', JSON.stringify({
        restaurant: menuData.name,
        items: safeItems
      }));
      window.location.href = 'safe-menu.html';
      
    } catch (error) {
      console.error("Error loading menu:", error);
      alert("Failed to load menu data. Please try again later.");
    }
  });
});