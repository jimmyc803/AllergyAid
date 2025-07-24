document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'restaurantSearch';
  searchInput.placeholder = 'Search restaurants...';
  searchInput.className = 'search-input';

  const searchButton = document.createElement('button');
  searchButton.id = 'searchRestaurantBtn';
  searchButton.textContent = 'Search';
  searchButton.className = 'search-button';

  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  searchContainer.appendChild(searchInput);
  searchContainer.appendChild(searchButton);

  // Insert search bar after page title
  const pageTitle = document.querySelector('.page-title');
  pageTitle.insertAdjacentElement('afterend', searchContainer);

  function searchRestaurants() {
    const searchTerm = document.getElementById('restaurantSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.partner-card');
    
    cards.forEach(card => {
      const title = card.querySelector('h2').textContent.toLowerCase();
      if (title.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  searchButton.addEventListener('click', searchRestaurants);
  searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      searchRestaurants();
    }
  });
});