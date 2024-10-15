document.addEventListener("DOMContentLoaded", () => {
    const usersContainer = document.getElementById("users-container");
    const modal = document.getElementById("users-modal");
    const modalContent = document.getElementById("modal-content");
    const addUserModal = document.getElementById("addUser-modal");
    const closeAddUserModalBtn = document.getElementById("close-addUser-modal");
    const addUserModalOverlay = document.getElementById("addUser-modal-overlay");
    const addUserBtn = document.getElementById("addUser-btn");
    const userForm = document.getElementById("user-form");
    const closeModalBtn = document.getElementById("close-modal");
    const modalOverlay = document.getElementById("modal-overlay");

    getUserList();

    //////////////// Functions for communication with server //////////////

    // Function to retrieve customer list  from server
    async function getUserList() {
        try {
            const response = await fetch("http://localhost:3001/api/employee/customer", {
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
            const response = await fetch(`http://localhost:3001/api/shared/customer`, {
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

            const response = await fetch(`http://localhost:3001/api/employee/customer/${status}/${customerID}`, {
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

    // Render user list in table
    function renderUserList(data) {
        usersContainer.innerHTML = ""; // Clear the container

        const table = document.createElement("table");

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

            customerRow.addEventListener("click", () => {
                openCustomerModal(customer);
            });

            table.appendChild(customerRow);
        });

        usersContainer.appendChild(table);
    }

    // Open customer details modal
    function openCustomerModal(customer) {
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
        modal.style.display = "block";
        modalOverlay.style.display = "block";

        const updateStatusBtn = document.getElementById("update-status-btn");
        updateStatusBtn.addEventListener("click", async () => {
            await updateAccountStatus(customer.customerID, customer.accountStatus);
            modal.style.display = "none"; 
            modalOverlay.style.display = "none";
            getUserList(); 
        });
    }

    // Close customer modal
    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    });

    modalOverlay.addEventListener("click", () => {
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    });

    // Open Add User modal
    addUserBtn.addEventListener("click", () => {
        addUserModal.style.display = "block";
        addUserModalOverlay.style.display = "block";
    });

    // Close Add User modal
    closeAddUserModalBtn.addEventListener("click", () => {
        addUserModal.style.display = "none";
        addUserModalOverlay.style.display = "none";
    });

    addUserModalOverlay.addEventListener("click", () => {
        addUserModal.style.display = "none";
        addUserModalOverlay.style.display = "none";
    });

    // Add user form submission
    userForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(userForm);
        const customerData = {
            email: formData.get("email"),
            phone: formData.get("phone"),
            password: formData.get("password"),
            customerBio: {
                firstName: formData.get("firstName"),
                lastName: formData.get("lastName"),
                address: {
                    street: formData.get("street"),
                    city: formData.get("city"),
                    country: formData.get("country")
                },
                gender: formData.get("gender")
            },
            accountCreated: new Date().toISOString(),
            accountStatus: "Active",
            orders: []
        };

        await addCustomer(customerData);
        addUserModal.style.display = "none";
        addUserModalOverlay.style.display = "none";
        getUserList(); 
    });
});
