document.addEventListener("DOMContentLoaded", () => {
    const inventoryContainer = document.getElementById("inventory-container");
    const inventoryFormContainer = document.getElementById("inventory-form-container");
    const inventoryForm = document.getElementById("inventory-form");
    const modal = document.getElementById("product-modal");
    const modalContent = document.getElementById("modal-content");
    const closeModalBtn = document.getElementById("close-modal");
    const modalOverlay = document.getElementById("modal-overlay");

    // Add product modal elements
    const addProductModal = document.getElementById("add-product-modal");
    const closeAddProductModalBtn = document.getElementById("close-add-product-modal");
    const addProductModalOverlay = document.getElementById("add-product-modal-overlay");
    const addProductBtn = document.getElementById("add-product-btn");

    getAdminInventory();

    async function getAdminInventory() {
        try {
            const response = await fetch("http://localhost:3001/api/employee/inventory/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            inventoryData = data.data; // Store inventory data
            renderInventory(data);
        } catch (error) {
            console.error("Error fetching admin inventory:", error);
        }
    }

    async function addProductToInventory(category_id, productData) {
        try {
            const response = await fetch(`http://localhost:3001/api/employee/inventory/${category_id}`, {
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

    async function deleteProduct(category_id, product_id) {
        try {
            const response = await fetch(`http://localhost:3001/api/employee/inventory/${category_id}/${product_id}`, {
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

    function renderInventory(data) {
        inventoryContainer.innerHTML = ""; // Clear the container

        const table = document.createElement("table");

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
        modalOverlay.style.display = "block";

        const deleteButton = document.getElementById("delete-product-btn");
        deleteButton.addEventListener("click", async () => {
            await deleteProduct(categoryID, product.productID);
            modal.style.display = "none"; // Close the modal after deletion
            modalOverlay.style.display = "none";
            await getAdminInventory();    // Reload inventory to reflect the deleted product
        });
    }

    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    });

    modalOverlay.addEventListener("click", () => {
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    });

        // Function to open the "Add Product" modal
        function openAddProductModal() {
            addProductModal.style.display = "block";
            addProductModalOverlay.style.display = "block";
        }
    
        // Function to close the "Add Product" modal
        function closeAddProductModal() {
            addProductModal.style.display = "none";
            addProductModalOverlay.style.display = "none";
        }
    
        // Event listener for opening the "Add Product" modal
        addProductBtn.addEventListener("click", () => {
            openAddProductModal();
        });
    
        // Event listener for closing the "Add Product" modal
        closeAddProductModalBtn.addEventListener("click", () => {
            closeAddProductModal();
        });
    
        // Close modal when clicking outside of it (on the overlay)
        addProductModalOverlay.addEventListener("click", () => {
            closeAddProductModal();
        });
    
        // Form submission logic for adding new product
        inventoryForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Prevent form from refreshing the page
    
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
                    imageUrl: imageUrl || "https://example.com/products/default.jpg",
                    dateAdded: dateAdded,
                    color: color
                }
            };
    
            // Find the Category ID for the selected category
            const categoryData = inventoryData.find(data => data.categoryName === categoryName);
            const category_id = categoryData.categoryID;
    
            // Call function to add product to inventory
            await addProductToInventory(category_id, productData);
            closeAddProductModal();  // Close the modal after submission
            getAdminInventory(); // Refresh the inventory
        });
});
