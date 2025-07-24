document.addEventListener('DOMContentLoaded', () => {
  // Create search elements
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'restaurantSearch';
  searchInput.placeholder = 'Search restaurants...';
  searchInput.className = 'search-input';
  
  // Insert search bar after page title
  const pageTitle = document.querySelector('.page-title');
  pageTitle.insertAdjacentElement('afterend', searchContainer);
  searchContainer.appendChild(searchInput);

  // Real-time search functionality
  function searchRestaurants() {
    const searchTerm = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.partner-card');
    let anyMatches = false;

    cards.forEach(card => {
      const title = card.querySelector('h2').textContent.toLowerCase();
      if (title.includes(searchTerm)) {
        card.style.display = ''; // Reset to default display
        anyMatches = true;
      } else {
        card.style.display = 'none';
      }
    });

    // Show "no results" message if no matches
    const noResultsDiv = document.querySelector('.no-results');
    if (!anyMatches && searchTerm.length > 0) {
      if (!noResultsDiv) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
          <i class="fas fa-search"></i>
          <p>No restaurants match "${searchTerm}"</p>
        `;
        document.querySelector('.partner-list').appendChild(noResults);
      }
    } else if (noResultsDiv && searchTerm.length === 0) {
      noResultsDiv.remove();
    }
  }

  // Event listeners
  searchInput.addEventListener('input', searchRestaurants);
  searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      searchInput.value = '';
      searchRestaurants();
    }
  });
});