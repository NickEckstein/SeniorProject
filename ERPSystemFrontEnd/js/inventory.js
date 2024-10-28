document.addEventListener("DOMContentLoaded", () => {
    const inventoryContainer = document.getElementById("table-container");
    const addProductBtn = document.getElementById("add-new-btn");
    const modal = document.getElementById("product-modal");
    const modalContent = document.getElementById("modal-content");
    const closeModalBtn = document.getElementById("close-productDetail-modal");
    const modalOverlay = document.getElementById("modal-overlay");
    const addProductModal = document.getElementById("add-Product-modal");
    const closeAddProductModalBtn = document.getElementById("close-add-Product-modal");
    const inventoryForm = document.getElementById("new-product-form");
    const addProductModalOverlay = document.getElementById("add-Product-modal-overlay");

    getAdminInventory();

    ///////////////////////////////////////////////////////////////////////////////////////

    async function getAdminInventory() {
        try {
            const response = await fetch("http://localhost:3001/api/shared/inventory/", {
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

    async function restockProduct(categoryID, productID) {
        try {
            const response = await fetch(`http://localhost:3001/api/employee/inventory/restock/${categoryID}/${productID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                }
            });
    
            if (!response.ok) {
                throw new Error("Error restocking the product");
            }
    
            const result = await response.json();
            console.log("Product restocked successfully:", result);
        } catch (error) {
            console.error("Error restocking product:", error);
        }
    }

        async function updateProductData(categoryID, productID, updatedData) {
        try {
            const response = await fetch(`http://localhost:3001/api/employee/inventory/${categoryID}/${productID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });
    
            if (!response.ok) throw new Error("Error updating product data");
    
            const data = await response.json();
            console.log("Product data updated successfully:", data);
        } catch (error) {
            console.error("Error updating product data:", error);
        }
    }
    
    ///////////////////////////////////////////////////////////////////////////////////////
    function renderInventory(data) {
        inventoryContainer.innerHTML = ""; // Clear the container

        const table = document.createElement("table");

        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <th>Category</th>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Price</th>
            <th>Total Sold</th>
            <th>Stock</th>
            <th>Stock Status</th>
            <th>Date Added</th>
            <th>Color</th>
        `;
        table.appendChild(headerRow);

        data.data.forEach(category => {
            category.products.forEach(product => {
                const productRow = document.createElement("tr");
                productRow.innerHTML = `
                    <td>${category.categoryName}</td>
                    <td>${product.productID}</td>
                    <td>${product.productName}</td>
                    <td>$${product.unitPrice}</td>
                    <td>${product.stockInfo.totalSold}</td>
                    <td>${product.stockInfo.currentQuantity}</td>
                    <td>${product.stockInfo.stockStatus}</td>
                    <td>${product.dateAdded}</td>
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

        const formattedDateAdded = formatDate(product.dateAdded);

        modalContent.innerHTML = `
            <h2>${product.productName}</h2>
            <form id="edit-product-form">
    
                <label for="productId">Product ID:</label>
                <input type="text" id="productId" name="productId" value="${product.productID}" required readonly="readonly">

                <label for="productName">Product Name:</label>
                <input type="text" id="productName" name="productName" value="${product.productName}" required>
    
                <label for="description">Description:</label>
                <textarea id="description" name="description" required>${product.productDescription}</textarea>

                <div class = "multiple-input-fields">
                    <div>
                        <label for="price">Price:</label>
                        <input type="number" id="price" name="price" value="${product.unitPrice}" required>
                    </div>
                    <div>
                        <label for="sold">Total Sold:</label>
                        <input type="number" id="sold" name="sold" value="${product.stockInfo.totalSold}" required readonly="readonly">
                    </div>
                </div>

                <div class = "multiple-input-fields">
                    <div>                
                        <label for="stockQuantity">Stock Quantity:</label>
                        <input type="text" id="stockQuantity" name="stockQuantity" value="${product.stockInfo.currentQuantity}" required readonly="readonly">
                    </div>
                    <div>
                        <button id="restock-product-btn">Restock Product</button>
                    </div>
                </div>  

                <div class = "multiple-input-fields">
                    <div>
                        <label for="restockQuantity">Restock Quantity:</label>
                        <input type="number" id="restockQuantity" name="restockQuantity" value="${product.stockInfo.restockQuantity}" required>
                    </div>
                    <div>            
                        <label for="restockThreshold">Restock Threshold:</label>
                        <input type="number" id="restockThreshold" name="restockThreshold" value="${product.stockInfo.restockThreshold}" required>
                    </div>
                </div> 

                <label for="color">Color:</label>
                <input type="text" id="color" name="color" value="${product.color}" required>
    
                <label for="date">Date Created:</label>
                <input type="text" id="date" name="date" value="${formattedDateAdded}" required readonly="readonly">    
            
                <div class = "multiple-input-fields">
                    <div>
                        <button type="submit" id="save-changes-btn">Save Changes</button>
                    </div>
                    <div>            
                        <button id="delete-btn" ">Delete Product</button>
                    </div>
                </div>                 

            </form>

        `;

        modal.style.display = "block";
        modalOverlay.style.display = "block";

        // Add event listener for form submission
        document.getElementById("edit-product-form").addEventListener("submit", async (event) => {
            event.preventDefault();
    
            const formData = new FormData(event.target);
            const updatedProductData = {};
    
            // Check and add updated fields to the payload
            if (formData.get("productName") !== product.productName) {
                updatedProductData.productName = formData.get("productName");
            }
            if (formData.get("description") !== product.productDescription) {
                updatedProductData.productDescription = formData.get("description");
            }
            if (formData.get("price") !== product.unitPrice) {
                updatedProductData.unitPrice = parseFloat(formData.get("price"));
            }
            if (formData.get("restockQuantity") !== product.stockInfo.restockQuantity) {
                updatedProductData.restockQuantity = parseInt(formData.get("restockQuantity"));
            }
            if (formData.get("restockThreshold") !== product.stockInfo.restockThreshold) {
                updatedProductData.restockThreshold = parseInt(formData.get("restockThreshold"));
            }
            if (formData.get("color") !== product.color) {
                updatedProductData.color = formData.get("color");
            }
    
            // Only send updated fields
            if (Object.keys(updatedProductData).length > 0) {
                console.log("Updating product data:", updatedProductData);
                await updateProductData(categoryID, product.productID, updatedProductData); 
            }
    
            modal.style.display = "none"; 
            modalOverlay.style.display = "none";
            await getAdminInventory(); // Refresh the inventory
        });
        
        const restockButton = document.getElementById("restock-product-btn");
        restockButton.addEventListener("click", async () => {
            await restockProduct(categoryID, product.productID);
            modal.style.display = "none";
            modalOverlay.style.display = "none";
            await getAdminInventory(); // Refresh the inventory to reflect updated stock
        });
    
        const deleteButton = document.getElementById("delete-btn");
        deleteButton.addEventListener("click", async () => {
            await deleteProduct(categoryID, product.productID);
            modal.style.display = "none"; // Close the modal after deletion
            modalOverlay.style.display = "none";
            await getAdminInventory(); // Reload inventory to reflect the deleted product
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


    addProductBtn.addEventListener("click", () => {
        addProductModal.style.display = "block";
        addProductModalOverlay.style.display = "block";
    });

    closeAddProductModalBtn.addEventListener("click", () => {
        addProductModal.style.display = "none";
        addProductModalOverlay.style.display = "none";
    });

    addProductModalOverlay.addEventListener("click", () => {
        addProductModal.style.display = "none";
        addProductModalOverlay.style.display = "none";
    });
    
    function formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

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
        const imageFile = formData.get("imageUrl");
        const imageUrl = imageFile.name;
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
                imageUrl: imageUrl,
                dateAdded: dateAdded,
                color: color
            }
        };

        // Find the Category ID for the selected category
        const categoryData = inventoryData.find(data => data.categoryName === categoryName);
        const category_id = categoryData.categoryID;

        await addProductToInventory(category_id, productData);
        addProductModal.style.display = "none";
        addProductModalOverlay.style.display = "none";
        getAdminInventory(); // Refresh the inventory
    });
});
