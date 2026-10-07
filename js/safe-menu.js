const container = document.getElementById("menuContainer");
const title = document.getElementById("restaurantName");
const backLink = document.getElementById("backBtn");
const search = document.getElementById("menuItemSearch");
const count = document.getElementById("menuCount");
function emptyState(heading, message, href, linkText) {
  const panel = document.createElement("div");
  panel.className = "empty-state";
  const h2 = document.createElement("h2");
  h2.textContent = heading;
  const p = document.createElement("p");
  p.textContent = message;
  const link = document.createElement("a");
  link.className = "button secondary";
  link.href = href;
  link.textContent = linkText;
  panel.append(h2, p, link);
  container.replaceChildren(panel);
}
let menuData;
try {
  menuData = JSON.parse(sessionStorage.getItem("filteredMenu"));
  if (
    !menuData ||
    typeof menuData.restaurant !== "string" ||
    !/^[a-z0-9-]+$/.test(menuData.restaurantId || "") ||
    !Array.isArray(menuData.items) ||
    !Array.isArray(menuData.selectedLabels) ||
    !menuData.selectedLabels.every((label) => typeof label === "string") ||
    !menuData.items.every(
      (item) =>
        item &&
        typeof item.name === "string" &&
        (item.category === undefined || typeof item.category === "string"),
    )
  ) {
    throw new Error("Missing or invalid menu");
  }
} catch {
  menuData = null;
}
if (!menuData) {
  title.textContent = "No restaurant selected";
  emptyState(
    "No menu yet",
    "Pick a restaurant and your allergens first.",
    "restaurants.html",
    "Find a restaurant",
  );
} else {
  title.textContent = `${menuData.restaurant} safe menu`;
  document.title = `${menuData.restaurant} filtered menu — Allergy Aid`;
  backLink.href = `allergen-picker.html?name=${encodeURIComponent(menuData.restaurantId)}`;
  backLink.textContent = "← Edit allergen choices";
  document.getElementById("filterSummary").textContent = menuData.selectedLabels
    .length
    ? `Without: ${menuData.selectedLabels.join(", ")}`
    : "No allergens selected. Showing the full menu.";
  const source = document.getElementById("restaurantSource");
  if (/^https?:\/\//i.test(menuData.website || "")) {
    source.href = menuData.website;
    source.hidden = false;
  }
  document.getElementById("menuToolbar").hidden = false;
  function renderMenu() {
    const term = search.value.trim().toLowerCase();
    const items = menuData.items.filter((item) =>
      item.name.toLowerCase().includes(term),
    );
    count.textContent = `${items.length} menu item${items.length === 1 ? "" : "s"}`;
    container.replaceChildren();
    if (!items.length) {
      emptyState(
        term ? "No matching items" : "No items match these choices",
        term
          ? `Nothing matched “${search.value.trim()}”. Try a different search.`
          : "Every item lists at least one of your allergens.",
        backLink.href,
        "Review allergen choices",
      );
      return;
    }
    const groups = new Map();
    items.forEach((item) => {
      const category = item.category || "Other";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(item);
    });
    groups.forEach((items, category) => {
      const details = document.createElement("details");
      details.className = "menu-category";
      details.open = true;
      const summary = document.createElement("summary");
      summary.append(document.createTextNode(category));
      const number = document.createElement("span");
      number.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;
      summary.append(number);
      const list = document.createElement("ul");
      list.className = "menu-items";
      items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "menu-item";
        const name = document.createElement("h3");
        name.textContent = item.name;
        li.append(name);
        list.append(li);
      });
      details.append(summary, list);
      container.append(details);
    });
  }
  search.addEventListener("input", renderMenu);
  search.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      search.value = "";
      renderMenu();
    }
  });
  renderMenu();
}
