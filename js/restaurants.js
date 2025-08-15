document.addEventListener('DOMContentLoaded', () => {
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'restaurantSearch';
  searchInput.placeholder = 'Search restaurants...';
  searchInput.className = 'search-input';
  

  const pageTitle = document.querySelector('.page-title');
  pageTitle.insertAdjacentElement('afterend', searchContainer);
  searchContainer.appendChild(searchInput);


  function searchRestaurants() {
    const searchTerm = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.partner-card');
    let anyMatches = false;

    cards.forEach(card => {
      const title = card.querySelector('h2').textContent.toLowerCase();
      if (title.includes(searchTerm)) {
        card.style.display = '';
        anyMatches = true;
      } else {
        card.style.display = 'none';
      }
    });

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


  searchInput.addEventListener('input', searchRestaurants);
  searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      searchInput.value = '';
      searchRestaurants();
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.partner-list');
  if (!container) return;

  // Get all cards except the "More Coming Soon" placeholder
  const regularCards = Array.from(container.querySelectorAll('.partner-card:not(.placeholder)'));
  
  // Get the placeholder card if it exists
  const placeholderCard = container.querySelector('.partner-card.placeholder');
  
  // Sort regular cards alphabetically
  regularCards.sort((a, b) => {
    const nameA = a.querySelector('h2').textContent.toLowerCase();
    const nameB = b.querySelector('h2').textContent.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Clear the container
  container.innerHTML = '';
  
  // Add sorted regular cards
  regularCards.forEach(card => container.appendChild(card));
  
  // Add placeholder card at the end if it exists
  if (placeholderCard) {
    container.appendChild(placeholderCard);
  }
});