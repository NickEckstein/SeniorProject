document.addEventListener("DOMContentLoaded", () => {
    const usersContainer = document.getElementById("users-container");
    const modal = document.getElementById("users-modal");
    const modalContent = document.getElementById("modal-content");
    const userFormContainer = document.getElementById("addUser-form-container");
    const addUserBtn = document.getElementById("addUser-btn");
    const userForm = document.getElementById("user-form");
    const closeModalBtn = document.getElementById("close-modal");

    getUserList();
    //////////////// Functions for communication with server //////////////

    // Function to retrieve customer list  from server
    async function getUserList() {
        try {
            const response = await fetch("http://localhost:3001/api/admin/customer", {
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
            userData = data.data; // Store user data
            renderUserList(data)
        } catch (error) {
            console.error("Error fetching User List:", error);
        }
    }

    // Function to add customer
    async function addCustomer(customerData) {
        try {
            const response = await fetch(`http://localhost:3001/api/admin/customer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(customerData),
            });

            if (!response.ok) throw new Error("Error adding customer");

            const data = await response.json();
            console.log("Customer added successfully:", data);

        } catch (error) {
            console.error("Error adding new customer:", error);
        }
    }

    // Function to update account status
    async function updateAccountStatus(customerID, currentStatus) {
        try {
            // Toggle the status
            const status = currentStatus === "Active" ? "freeze" : "unfreeze";

            const response = await fetch(`http://localhost:3001/api/admin/customer/${status}/${customerID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Error updating account status");

            const result = await response.json();
            console.log("Account status updated successfully:", result);
        } catch (error) {
            console.error("Error updating account status:", error);
        }
    }

    //////////////////////////////////////////////////////////////////////

    function renderUserList(data) {
        usersContainer.innerHTML = ""; // Clear the container
    
        // Create the main table
        const table = document.createElement("table");
        
        // Create the table headers
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <th>Customer ID</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Gender</th>
            <th>Date Created</th>
            <th>Account Status</th>
        `;
        table.appendChild(headerRow);
    
        data.data.forEach(customer => {
            const customerRow = document.createElement("tr");
            customerRow.innerHTML = `
                <td>${customer.customerID}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.customerBio.firstName}</td>
                <td>${customer.customerBio.lastName}</td>
                <td>${customer.customerBio.gender}</td>
                <td>${customer.accountCreated}</td>
                <td>${customer.accountStatus}</td>
        `;

        // Make row clickable to open a modal with detailed order information
        customerRow.addEventListener("click", () => {
            openCustomerModal(customer);
        });

            table.appendChild(customerRow);
        });
    
        usersContainer.appendChild(table);
        
    }

    function openCustomerModal(customer) {
        // Populate modal with user information only
        modalContent.innerHTML = `
            <h2>User Information</h2>
            <p><strong>Customer ID:</strong> ${customer.customerID}</p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Phone Number:</strong> ${customer.phone}</p>
            <p><strong>First Name:</strong> ${customer.customerBio.firstName}</p>
            <p><strong>Last Name:</strong> ${customer.customerBio.lastName}</p>
            <p><strong>Gender:</strong> ${customer.customerBio.gender}</p>
            <p><strong>Date Created:</strong> ${customer.accountCreated}</p>
            <p><strong>Account Status:</strong> ${customer.accountStatus}</p>
            <button id="update-status-btn">Update Account Status</button>
        `;
    
        // Show the modal and overlay
        modal.style.display = "block";
    
        // Add event listener to the update status button
        const updateStatusBtn = document.getElementById("update-status-btn");
        updateStatusBtn.addEventListener("click", async () => {
            await updateAccountStatus(customer.customerID, customer.accountStatus);
            modal.style.display = "none"; // Close the modal after updating
            getUserList(); // Reload user list to reflect the updated status
        });
    }

    //////////// Event Listners /////////
    
    // Close Modal
    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Toggle the form visibility when the "Add Product" button is clicked
    addUserBtn.addEventListener("click", () => {
        userFormContainer.style.display = userFormContainer.style.display === "none" ? "block" : "none";
    });
    
    // Form submission for adding to inventory
    userForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent the form from refreshing the page

        // Get data from form
        const formData = new FormData(userForm);
        const email = formData.get("email");
        const password = formData.get("password"); 
        const phone = formData.get("phone");
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const street = formData.get("street");
        const city = formData.get("city");
        const country = formData.get("country");
        const gender = formData.get("gender");
        const dateCreated = new Date().toISOString();

        // Create the customer data object from form input
        const customerData = {
            email: email,
            phone: phone,
            password: password,
            customerBio: {
                firstName: firstName,
                lastName: lastName,
                address: {
                    street: street,
                    city: city,
                    country: country
                },
                gender: gender
            },
            accountCreated: dateCreated,
            accountStatus: "Active",
            orders: [] // Start with an empty orders list
        };

    // Call the function to add the customer to the database or server
    await addCustomer(customerData);
    getUserList();
    });
})

