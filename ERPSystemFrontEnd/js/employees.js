document.addEventListener("DOMContentLoaded", () => {
    const employeeTableContainer = document.getElementById("table-container");
    const addEmployeeBtn = document.getElementById("add-new-btn");
    const modal = document.getElementById("employee-modal");
    const modalContent = document.getElementById("modal-content");
    const closeModalBtn = document.getElementById("close-employeeDetail-modal");
    const modalOverlay = document.getElementById("modal-overlay");
    const addEmployeeModal = document.getElementById("add-employee-modal");
    const closeEmployeeUserModalBtn = document.getElementById("close-add-employee-modal");
    const addEmployeeModalOverlay = document.getElementById("add-employee-modal-overlay");
    const employeeForm = document.getElementById("new-employee-form");


    getEmployeeList();

    //////////////// Functions for communication with server //////////////

    // Fetch employee list from server
    async function getEmployeeList() {
        try {
            const response = await fetch("http://localhost:3001/api/employee/manage", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch employee list");
            }

            const data = await response.json();
            renderEmployeeList(data);
        } catch (error) {
            console.error("Error fetching employee list:", error);
        }
    }

    async function addEmployee(employeeData) {
        try {
            const response = await fetch(`http://localhost:3001/api/employee/manage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(employeeData),
            });

            if (!response.ok) throw new Error("Error adding employee ");

            const data = await response.json();
            console.log("Employee added successfully:", data);

        } catch (error) {
            console.error("Error adding new employee:", error);
        }
    }

    // Update employee account status
    async function updateAccountStatus(employeeID, currentStatus) {
        try {
            const status = currentStatus === "Active" ? "close" : "reopen";

            const response = await fetch(`http://localhost:3001/api/employee/manage/${status}/${employeeID}`, {
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

    // Update employee information
    async function updateCustomerData(employeeID, updatedData) {
        try {
            const response = await fetch(`http://localhost:3001/api/employee/manage/${employeeID}`, {
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

    // Render employee list in table
    function renderEmployeeList(data) {
        employeeTableContainer.innerHTML = "";

        const table = document.createElement("table");

        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <th>Employee ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Job Title</th>
            <th>Department</th>
            <th>Account Status</th>
            <th>Admin</th>
        `;
        table.appendChild(headerRow);

        data.data.forEach(employee => {
            const employeeRow = document.createElement("tr");
            employeeRow.innerHTML = `
                <td>${employee.employeeID}</td>
                <td>${employee.employeeBio.firstName}</td>
                <td>${employee.employeeBio.lastName}</td>
                <td>${employee.email}</td>
                <td>${employee.phone}</td>
                <td>${employee.workInfo.jobTitle}</td>
                <td>${employee.workInfo.department}</td>
                <td>${employee.accountStatus}</td>
                <td>${employee.isAdmin}</td>
            `;

            employeeRow.addEventListener("click", () => {
                openEmployeeModal(employee);
            });

            table.appendChild(employeeRow);
        });

        employeeTableContainer.appendChild(table);
    }

    // Open employee details modal
    function openEmployeeModal(employee) {

        const formattedHireDate = formatDate(employee.workInfo.hireDate)
        const formattedAccountDate = new Date(employee.accountCreated).toLocaleDateString();

        modalContent.innerHTML = `
        <h2>${employee.employeeBio.firstName} ${employee.employeeBio.lastName}</h2>

        <form id="edit-employee-form">
            <label for="employeeId">Employee ID:</label>
            <input type="text" id="employeeId" name="employeeId" value="${employee.employeeID}" readonly>

            <div class="multiple-input-fields">
                <div>
                    <label for="firstName">First Name:</label>
                    <input type="text" id="firstName" name="firstName" value="${employee.employeeBio.firstName}" required>
                </div>
                <div>
                    <label for="lastName">Last Name:</label>
                    <input type="text" id="lastName" name="lastName" value="${employee.employeeBio.lastName}" required>
                </div>
            </div>

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="${employee.email}" required>

            <label for="phone">Phone:</label>
            <input type="tel" id="phone" name="phone" value="${employee.phone}" required>

            <label for="jobTitle">Job Title:</label>
            <input type="text" id="jobTitle" name="jobTitle" value="${employee.workInfo.jobTitle}" readonly>

            <label for="department">Department:</label>
            <input type="text" id="department" name="department" value="${employee.workInfo.department}" readonly>

            <label for="hireDate">Hire Date:</label>
            <input type="text" id="hireDate" name="hireDate" value="${formattedHireDate}" readonly>

            <div class="multiple-input-fields">
                <div>
                    <label for="payFrequency">Pay Frequency:</label>
                    <input type="text" id="payFrequency" name="payFrequency" value="${employee.workInfo.payFrequency}" required >
                </div>
                <div>
                    <label for="baseSalary">Base Salary:</label>
                    <input type="number" id="baseSalary" name="baseSalary" value="${employee.workInfo.payAmount.baseSalary}" required>
                </div>
            </div>

            <label for="account-status">Account Status:</label>
            <select id="account-status" name="account-status">
                <option value="Active" ${employee.accountStatus === "Active" ? "selected" : ""}>Active</option>
                <option value="Closed" ${employee.accountStatus === "Closed" ? "selected" : ""}>Closed</option>
            </select>

            <button type="submit" id="save-changes-btn">Save Changes</button>
        </form>
    `;

        modal.style.display = "block";
        modalOverlay.style.display = "block";

        // Add event listener for account status change
        document.getElementById("account-status").addEventListener("change", async (event) => {
            const newStatus = event.target.value;
            const currentStatus = employee.accountStatus;
    
            // Update account status if it has changed
            if ((currentStatus === "Active" && newStatus === "Closed") || (currentStatus === "Closed" && newStatus === "Active")) {
                await updateAccountStatus(employee.employeeID, currentStatus);
                employee.accountStatus = newStatus; // Update the local customer object
            }
        });

        document.getElementById("edit-employee-form").addEventListener("submit", async (event) => {
            event.preventDefault();
    
            const formData = new FormData(event.target);
            const updatedEmployeeData = {};
            
            // Check and add updated fields to the payload
            if (formData.get("firstName") !== employee.employeeBio.firstName) {
                updatedEmployeeData.firstName = formData.get("firstName");
            }
            if (formData.get("lastName") !== employee.employeeBio.lastName) {
                updatedEmployeeData.lastName = formData.get("lastName");
            }
            if (formData.get("email") !== employee.email) {
                updatedEmployeeData.email = formData.get("email");
            }
            if (formData.get("phone") !== employee.phone) {
                updatedEmployeeData.phone = formData.get("phone");
            }
            if (formData.get("baseSalary") !== employee.workInfo.payAmount.baseSalary) {
                updatedEmployeeData.baseSalary = parseInt(formData.get("baseSalary"));
            }
            if (formData.get("payFrequency") !== employee.workInfo.payFrequency) {
                updatedEmployeeData.payFrequency =formData.get("payFrequency");
            }

            // Only send updated fields
            if (Object.keys(updatedEmployeeData).length > 0) {
                console.log("Updating employee data:", updatedEmployeeData);
                await updateCustomerData(employee.employeeID, updatedEmployeeData);
            }
    
            modal.style.display = "none"; 
            modalOverlay.style.display = "none";
            getEmployeeList(); 
        });
    }

    // Close Employee details modal
    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    });

    modalOverlay.addEventListener("click", () => {
        modal.style.display = "none";
        modalOverlay.style.display = "none";
    });

    // Open Add new employee modal
    addEmployeeBtn.addEventListener("click", () => {
        addEmployeeModal.style.display = "block";
        addEmployeeModalOverlay.style.display = "block";
    });

    // Close Add User modal
    closeEmployeeUserModalBtn.addEventListener("click", () => {
        addEmployeeModal.style.display = "none";
        addEmployeeModalOverlay.style.display = "none";
    });

    addEmployeeModalOverlay.addEventListener("click", () => {
        addEmployeeModal.style.display = "none";
        addEmployeeModalOverlay.style.display = "none";
    });

    function formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    employeeForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(employeeForm);
        const employeeData = {
            email: formData.get("email"),
            password: formData.get("password"),
            phone: formData.get("phone"),
            lastLogin: "",
            isAdmin: formData.get("isAdmin") === "true",
            employeeBio: {
                firstName: formData.get("firstName"),
                lastName: formData.get("lastName"),
                address: {
                    street: formData.get("street"),
                    city: formData.get("city"),
                    state: formData.get("state"),
                    zipCode: formData.get("zipCode"),
                    country: formData.get("country")
                },
                gender: formData.get("gender")
            },
            workInfo: {
                jobTitle: formData.get("jobTitle"),
                employeeType: formData.get("employeeType"),
                hireDate: new Date().toISOString(),
                payFrequency: formData.get("payFrequency"),
                payAmount: {
                    baseSalary: parseFloat(formData.get("baseSalary")),
                    bonus: parseFloat(formData.get("bonus"))
                },
                department: formData.get("department"),
                workingHours: {
                    startTime: formData.get("startTime"),
                    endTime: formData.get("endTime")
                }
            },
            accountCreated: new Date().toISOString(),
            accountStatus: "Active"
        };
    
            await addEmployee(employeeData);
            addEmployeeModal.style.display = "none";
            addEmployeeModalOverlay.style.display = "none";
            getEmployeeList(); 
    });

});
