window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');

  const urlParams = new URLSearchParams(window.location.search);
  const restaurantName = urlParams.get('name');

  const logoImg = document.getElementById('restaurantLogo');
  const restaurantTitle = document.getElementById('restaurantName');

  if (!restaurantName) {
    restaurantTitle.textContent = "Restaurant Not Found";
    logoImg.style.display = "none";
    alert("No restaurant specified in URL.");
    return;
  }

  const menuUrl = `data/${restaurantName}.json`;
  logoImg.src = `images/logos/${restaurantName}.png`;
  logoImg.alt = `${restaurantName.replace(/-/g, ' ')} logo`;

  const readableName = restaurantName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  restaurantTitle.textContent = `${readableName} Allergy-Friendly Menu`;

  document.getElementById("filterForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const selectedCategories = Array.from(document.querySelectorAll('input[name="allergy"]:checked'))
      .map(cb => cb.value);

    try {
      const res = await fetch(menuUrl);
      if (!res.ok) throw new Error('Menu fetch failed');

      const data = await res.json();

      const filteredItems = data.items.filter(item =>
        selectedCategories.every(cat => item.categories.includes(cat))
      );

      sessionStorage.setItem('filteredMenu', JSON.stringify({
        restaurant: data.name,
        items: filteredItems
      }));

      window.location.href = 'safe-menu.html';
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Sorry, we couldn't load the menu for this restaurant.");
    }
  });
});
