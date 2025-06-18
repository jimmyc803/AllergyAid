window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');

  const filteredData = JSON.parse(sessionStorage.getItem('filteredMenu'));
  const menuContainer = document.getElementById('menuContainer');
  const restaurantName = document.getElementById('restaurantName');

  if (!filteredData) {
    restaurantName.textContent = 'No menu data found';
    menuContainer.innerHTML = '<p>Please go back and select dietary restrictions first.</p>';
    return;
  }

  restaurantName.textContent = `${filteredData.restaurant} - Safe Menu Items`;

  if (filteredData.items.length === 0) {
    menuContainer.innerHTML = '<p>No items match your restrictions.</p>';
  } else {
    menuContainer.innerHTML = ''; // Clear old content

    filteredData.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'menu-item';

      // Item name + price
      const namePrice = document.createElement('div');
      namePrice.className = 'item-name-price';
      namePrice.textContent = `${item.name} — ${item.price}`;

      // Description
      const desc = document.createElement('p');
      desc.className = 'item-description';
      desc.textContent = item.description;

      card.appendChild(namePrice);
      card.appendChild(desc);
      menuContainer.appendChild(card);
    });
  }

  document.getElementById('backBtn').addEventListener('click', () => {
    window.history.back();
  });
});
