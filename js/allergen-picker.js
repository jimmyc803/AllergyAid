const restaurantId = new URLSearchParams(location.search).get("name");
const title = document.getElementById("restaurantName");
const form = document.getElementById("allergenForm");
const options = document.getElementById("allergenOptions");
const submit = form.querySelector('button[type="submit"]');
const count = document.getElementById("selectionCount");
const errorMessage = document.getElementById("formError");
let restaurantData;
let availableAllergens = [];
const defaultAllergens = [
  "milk",
  "egg",
  "soy",
  "wheat",
  "sesame",
  "tree nuts",
  "peanut",
  "fish",
].map((id) => ({
  id,
  displayName: id.replace(/\b\w/g, (letter) => letter.toUpperCase()),
}));
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}
function selectedAllergens() {
  return [...options.querySelectorAll("input:checked")].map(
    (input) => input.value,
  );
}
function updateCount() {
  const total = selectedAllergens().length;
  count.textContent = total
    ? `${total} allergen${total === 1 ? "" : "s"} selected`
    : "No allergens selected";
}
function validateMenu(data) {
  if (
    typeof data.name !== "string" ||
    !Array.isArray(data.items) ||
    !data.items.every(
      (item) =>
        typeof item.name === "string" &&
        Array.isArray(item.allergens) &&
        item.allergens.every(
          (a) => typeof a === "string" || (a && typeof a.id === "string"),
        ),
    )
  ) {
    throw new Error("Invalid menu data");
  }
  return data;
}
async function loadRestaurant() {
  if (
    !restaurantId ||
    !/^[a-z0-9-]+$/.test(restaurantId) ||
    restaurantId === "template"
  ) {
    title.textContent = "Restaurant not found";
    count.textContent = "Choose a restaurant to continue.";
    showError("Please use “All restaurants” above to choose a restaurant.");
    return;
  }
  try {
    const response = await fetch(`./data/${restaurantId}.json`);
    if (!response.ok) throw new Error("Menu unavailable");
    restaurantData = validateMenu(await response.json());
    title.textContent = restaurantData.name;
    document.title = `${restaurantData.name} allergen choices — Allergy Aid`;
    const seen = new Set();
    availableAllergens = (
      restaurantData.customAllergens || defaultAllergens
    ).filter((allergen) => {
      const id = allergen.id.toLowerCase();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    // Restore choices only for this restaurant. Its labels may differ from another guide.
    let previous = [];
    try {
      const saved = JSON.parse(sessionStorage.getItem("filteredMenu"));
      if (
        saved?.restaurantId === restaurantId &&
        Array.isArray(saved.selectedAllergens)
      )
        previous = saved.selectedAllergens;
    } catch {
      /* Storage is optional until the user requests results. */
    }
    for (const allergen of availableAllergens) {
      const label = document.createElement("label");
      label.className = "filter-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "allergen";
      input.value = allergen.id.toLowerCase();
      input.checked = previous.includes(input.value);
      const text = document.createElement("span");
      text.textContent = allergen.displayName || allergen.id;
      label.append(input, text);
      options.append(label);
    }
    const source = document.getElementById("restaurantSource");
    if (/^https?:\/\//i.test(restaurantData.website || "")) {
      source.href = restaurantData.website;
      source.hidden = false;
    }
    updateCount();
    submit.disabled = false;
  } catch (error) {
    title.textContent = "Menu not available";
    count.textContent = "Menu could not be loaded.";
    showError(
      "We couldn’t load this menu. Check your connection and refresh, or choose another restaurant.",
    );
    console.warn("Unable to load menu:", error);
  }
}
options.addEventListener("change", updateCount);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!restaurantData) return;
  errorMessage.hidden = true;
  const selected = selectedAllergens();
  // Match the restaurant's original allergen IDs; do not infer ingredient substitutions.
  const items = restaurantData.items.filter((item) => {
    const allergens = item.allergens.map((a) =>
      (typeof a === "string" ? a : a.id).toLowerCase(),
    );
    return !selected.some((allergen) => allergens.includes(allergen));
  });
  try {
    sessionStorage.setItem(
      "filteredMenu",
      JSON.stringify({
        restaurant: restaurantData.name,
        restaurantId,
        website: restaurantData.website,
        selectedAllergens: selected,
        selectedLabels: availableAllergens
          .filter((a) => selected.includes(a.id.toLowerCase()))
          .map((a) => a.displayName || a.id),
        items,
      }),
    );
    location.href = "safe-menu.html";
  } catch {
    showError(
      "Your browser couldn’t save these choices. Allow session storage for this site, then try again.",
    );
  }
});
loadRestaurant();
