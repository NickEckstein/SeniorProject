document.addEventListener("DOMContentLoaded", () => {
    const usersContainer = document.getElementById("table-container");
    const addUserBtn = document.getElementById("add-new-btn");
    const modal = document.getElementById("customer-modal"); 
    const modalContent = document.getElementById("modal-content");
    const closeModalBtn = document.getElementById("close-userDetail-modal");
    const modalOverlay = document.getElementById("modal-overlay");
    const addUserModal = document.getElementById("add-User-modal");
    const closeAddUserModalBtn = document.getElementById("close-add-User-modal");
    const userForm = document.getElementById("new-user-form");
    const addUserModalOverlay = document.getElementById("add-User-modal-overlay");

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

    async function updateCustomerData(customerID, updatedData) {
        try {
            const response = await fetch(`http://localhost:3001/api/employee/customer/${customerID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });
    
            if (!response.ok) throw new Error("Error with server");
    
            const data = await response.json();
            console.log("Customer data updated successfully:", data);
        } catch (error) {
            console.error("Error updating customer data:", error);
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

        const formattedDate = new Date(customer.accountCreated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        modalContent.innerHTML = `
        <h2>User Information</h2>
        <form id="edit-user-form">
    
            <label for="customerId">Customer ID:</label>
            <input type="text" id="customerId" name="customerId" value="${customer.customerID}" required readonly="readonly">
    
            <div class = "multiple-input-fields">
                <div>
                    <label for="firstName">First Name:</label>
                    <input type="text" id="firstName" name="firstName" value="${customer.customerBio.firstName}" required>
                </div>
                <div>
                    <label for="lastName">Last Name:</label>
                    <input type="text" id="lastName" name="lastName" value="${customer.customerBio.lastName}" required>
                </div>
            </div>
    
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="${customer.email}" required>
    
            <label for="phone">Phone Number:</label>
            <input type="tel" id="phone" name="phone" value="${customer.phone}" required>
    
            <label for="street">Street:</label>
            <input type="text" id="street" name="street" value="${customer.customerBio.address.street}" required>
    
            <div class = "multiple-input-fields">
                <div>
                    <label for="city">City:</label>
                    <input type="text" id="city" name="city" value="${customer.customerBio.address.city}" required>
                </div>
                <div>
                    <label for="country">Country:</label>
                    <input type="text" id="country" name="country" value="${customer.customerBio.address.country}" required>
                </div>
            </div>
    
            <div class = "multiple-input-fields">
                <div>
                    <label for="gender">Gender:</label>
                    <select id="gender" name="gender">
                        <option value="Male" ${customer.customerBio.gender === "Male" ? "selected" : ""}>Male</option>
                        <option value="Female" ${customer.customerBio.gender === "Female" ? "selected" : ""}>Female</option>
                        <option value="Other" ${customer.customerBio.gender === "Other" ? "selected" : ""}>Other</option>
                    </select>
                </div>
                <div>
                    <label for="account-status">Account Status:</label>
                    <select id="account-status" name="account-status">
                        <option value="Active" ${customer.accountStatus === "Active" ? "selected" : ""}>Active</option>
                        <option value="Frozen" ${customer.accountStatus === "Frozen" ? "selected" : ""}>Frozen</option>
                    </select>
                </div>
            </div>
    
            <label for="date">Date Created:</label>
            <input type="text" id="date" name="dateCreated" value="${formattedDate}" required readonly="readonly">    
    
            <button type="submit" id="save-changes-btn">Save Changes</button>
        </form>
    `;
    
        modal.style.display = "block";
        modalOverlay.style.display = "block";

        // Add event listener for account status change
        document.getElementById("account-status").addEventListener("change", async (event) => {
            const newStatus = event.target.value;
            const currentStatus = customer.accountStatus;
    
            // Update account status if it has changed
            if ((currentStatus === "Active" && newStatus === "Frozen") || (currentStatus === "Frozen" && newStatus === "Active")) {
                await updateAccountStatus(customer.customerID, currentStatus);
                customer.accountStatus = newStatus; // Update the local customer object
            }
        });

        // Add event listener for form submission
        document.getElementById("edit-user-form").addEventListener("submit", async (event) => {
            event.preventDefault();
    
            const formData = new FormData(event.target);
            const updatedCustomerData = {};
            
            // Check and add updated fields to the payload
            if (formData.get("firstName") !== customer.customerBio.firstName) {
                updatedCustomerData.firstName = formData.get("firstName");
            }
            if (formData.get("lastName") !== customer.customerBio.lastName) {
                updatedCustomerData.lastName = formData.get("lastName");
            }
            if (formData.get("email") !== customer.email) {
                updatedCustomerData.email = formData.get("email");
            }
            if (formData.get("phone") !== customer.phone) {
                updatedCustomerData.phone = formData.get("phone");
            }
            if (formData.get("street") !== customer.customerBio.address.street) {
                updatedCustomerData.address = { ...(updatedCustomerData.address || {}), street: formData.get("street") };
            }
            if (formData.get("city") !== customer.customerBio.address.city) {
                updatedCustomerData.address = { ...(updatedCustomerData.address || {}), city: formData.get("city") };
            }
            if (formData.get("country") !== customer.customerBio.address.country) {
                updatedCustomerData.address = { ...(updatedCustomerData.address || {}), country: formData.get("country") };
            }
            if (formData.get("gender") !== customer.customerBio.gender) {
                updatedCustomerData.gender = formData.get("gender");
            }
    
            // Only send updated fields
            if (Object.keys(updatedCustomerData).length > 0) {
                console.log("Updating customer data:", updatedCustomerData);
                await updateCustomerData(customer.customerID, updatedCustomerData);
            }
    
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
