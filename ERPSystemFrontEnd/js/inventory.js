document.addEventListener("DOMContentLoaded", () => {
    const inventoryContainer = document.getElementById("inventory-container");
    const inventoryFormContainer = document.getElementById("inventory-form-container");
    const inventoryForm = document.getElementById("inventory-form");
    const modal = document.getElementById("product-modal");
    const modalContent = document.getElementById("modal-content");
    const closeModalBtn = document.getElementById("close-modal");
    const addProductBtn = document.getElementById("add-product-btn");

    getAdminInventory();
    
    //////////////// Functions for communication with server //////////////

    // Function to retrieve inventory data from server
    async function getAdminInventory() {
        try {
            const response = await fetch("http://localhost:3001/api/admin/inventory/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            console.log(data);
            inventoryData = data.data; // Store inventory data
            renderInventory(data);
        } catch (error) {
            console.error("Error fetching admin inventory:", error);
        }
    }

    // Function to send product data to the server
    async function addProductToInventory(category_id, productData) {
        try {
            const response = await fetch(`http://localhost:3001/api/admin/inventory/${category_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) throw new Error("Error adding inventory item");

            const data = await response.json();
            console.log("Product added successfully:", data);

        } catch (error) {
            console.error("Error adding new product:", error);
        }
    }

    // Function for deleting product from server
    async function deleteProduct(category_id, product_id) {
        try {
            const response = await fetch(`http://localhost:3001/api/admin/inventory/${category_id}/${product_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Error deleting inventory item");

            const result = await response.json();
            console.log("Product deleted successfully:", result);

        } catch (error) {
            console.error("Error deleting product:", error);
        }
    }

    //////////////////////////////////////////////////////////////////////

    function renderInventory(data) {
        inventoryContainer.innerHTML = ""; // Clear the container
    
        // Create the main table
        const table = document.createElement("table");
        
        // Create the table headers
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <th>Category</th>
            <th>Product Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Sold</th>
            <th>Restock When</th>
            <th>Restock Quantity</th>
            <th>Stock Status</th>
            <th>Color</th>
        `;
        table.appendChild(headerRow);
    
        data.data.forEach(category => {
            category.products.forEach(product => {
                const productRow = document.createElement("tr");
                productRow.innerHTML = `
                    <td>${category.categoryName}</td>
                    <td>${product.productName}</td>
                    <td>${product.productDescription}</td>
                    <td>$${product.unitPrice}</td>
                    <td>${product.stockInfo.currentQuantity}</td>
                    <td>${product.stockInfo.totalSold}</td>
                    <td>${product.stockInfo.restockThreshold}</td>
                    <td>${product.stockInfo.restockQuantity}</td>
                    <td>${product.stockInfo.stockStatus}</td>
                    <td>${product.color}</td>
                `;

                // Make row clickable to open the modal
                productRow.addEventListener("click", () => {
                    openProductModal(category.categoryID, product);
                });
                
                table.appendChild(productRow);
            });
        });
    
        inventoryContainer.appendChild(table);
        
    }
     

    function openProductModal(categoryID, product) {

        modalContent.innerHTML = `
            <h2>${product.productName}</h2>
            <p><strong>Description:</strong> ${product.productDescription}</p>
            <p><strong>Price:</strong> $${product.unitPrice}</p>
            <p><strong>Stock:</strong> ${product.stockInfo.currentQuantity}</p>
            <p><strong>Restock When:</strong> ${product.stockInfo.restockThreshold}</p>
            <p><strong>Last Restock:</strong> ${product.stockInfo.lastRestock}</p>
            <p><strong>Color:</strong> ${product.color}</p>
            <p><strong>Date Added:</strong> ${product.dateAdded}</p>
            <button id="delete-product-btn" style="margin-top: 10px; background-color: red; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">
                Delete Product
            </button>
        `;
        modal.style.display = "block";
    
        // Add event listener to the delete button
        const deleteButton = document.getElementById("delete-product-btn");
        deleteButton.addEventListener("click", async () => {
            await deleteProduct(categoryID, product.productID);
            modal.style.display = "none"; // Close the modal after deletion
            await getAdminInventory();    // Reload inventory to reflect the deleted product
        });
    }
    
    //////////// Event Listners /////////

    // Close Modal
    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Toggle the form visibility when the "Add Product" button is clicked
    addProductBtn.addEventListener("click", () => {
        inventoryFormContainer.style.display = inventoryFormContainer.style.display === "none" ? "block" : "none";
    });

    // Form submission for adding to inventory
    inventoryForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent the form from refreshing the page

        // Get data from form
        const formData = new FormData(inventoryForm);
        const categoryName = formData.get("categoryName");
        const productName = formData.get("productName");
        const productDescription = formData.get("productDescription");
        const unitPrice = formData.get("unitPrice");
        const stockQuantity = formData.get("stockQuantity");
        const restockThreshold = formData.get("restockThreshold");
        const restockQuantity = formData.get("restockQuantity");
        const imageUrl = formData.get("imageUrl");
        const color = formData.get("color");
        const dateAdded = new Date().toISOString();

        // Create the product data object from form input
        const productData = {
            categoryName: categoryName,
            product: {
                productName: productName,
                productDescription: productDescription,
                unitPrice: unitPrice,
                stockInfo: {
                    currentQuantity: stockQuantity,
                    totalSold: 0,
                    restockThreshold: restockThreshold,
                    lastRestock: dateAdded,
                    restockQuantity: restockQuantity,
                    stockStatus: stockQuantity > 0 ? "In Stock" : "Out of Stock"
                },
                //url not yet implemented
                imageUrl: imageUrl || "https://example.com/products/default.jpg", // Use the form input or a default URL
                dateAdded: dateAdded,
                color: color
            }
        };

        // Find the Category ID for the category selected
        const categoryData = inventoryData.find(data => data.categoryName === categoryName);
        const category_id = categoryData.categoryID;

        // Call the function to add the product to the inventory
        await addProductToInventory(category_id, productData);
        getAdminInventory();
    });

});
