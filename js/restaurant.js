// Handle form submission
allergenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectedAllergens = Array.from(
        document.querySelectorAll('input[name="allergen"]:checked')
    ).map(cb => cb.value);

    try {
        const response = await fetch(menuUrl);
        if (!response.ok) throw new Error('Menu not found');
        
        const menuData = await response.json();
        
        // Filter items that don't contain selected allergens
        const safeItems = menuData.items.filter(item => {
            const itemAllergens = item.allergens || [];
            return !selectedAllergens.some(allergen => 
                itemAllergens.includes(allergen)
            );
        });

        // Store filtered data for the safe menu page
        sessionStorage.setItem('filteredMenu', JSON.stringify({
            restaurant: menuData.name,
            items: safeItems
        }));

        // Navigate to safe menu page
        window.location.href = 'safe-menu.html';
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to load menu. Please try again.");
    }
});