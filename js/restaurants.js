const searchInput = document.getElementById("restaurantSearch");
const cards = [...document.querySelectorAll(".restaurant-card")];
const emptyState = document.getElementById("noResults");
const resultCount = document.getElementById("restaurantCount");
// Normalize punctuation so "chick fil a" and "Chick-fil-A" both find the same place.
const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
function searchRestaurants() {
  const query = normalize(searchInput.value);
  let count = 0;
  cards.forEach((card) => {
    card.hidden = !normalize(card.dataset.name).includes(query);
    if (!card.hidden) count++;
  });
  resultCount.textContent = `${count} restaurant guide${count === 1 ? "" : "s"}`;
  emptyState.hidden = count > 0;
  document.getElementById("noResultsText").textContent = count
    ? ""
    : `We couldn’t find a match for “${searchInput.value.trim()}”. Try another name.`;
}
function clearSearch() {
  searchInput.value = "";
  searchRestaurants();
  searchInput.focus();
}
searchInput.addEventListener("input", searchRestaurants);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") clearSearch();
});
document.getElementById("clearSearch").addEventListener("click", clearSearch);
searchRestaurants();
