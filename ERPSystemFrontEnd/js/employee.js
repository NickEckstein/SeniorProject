document.addEventListener("DOMContentLoaded", () => {
    const employeeContainer = document.getElementById("employee-container");
    const modal = document.getElementById("employee-modal");
    const modalContent = document.getElementById("modal-content");
    const employeeFormContainer = document.getElementById("addEmployee-form-container");
    const addEmployeeBtn = document.getElementById("addEmployee-btn");
    const employeeForm = document.getElementById("employee-form");
    const closeModalBtn = document.getElementById("close-modal");

    getEmployeeList();

    //////////////// Functions for communication with server //////////////

    // Function to retrieve employee list from server
    async function getEmployeeList() {
        try {
            const response = await fetch("http://localhost:3001/api/admin/employee", {
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
            employeeData = data.data; // Store employee data
            renderEmployeeList(data);
        } catch (error) {
            console.error("Error fetching Employee List:", error);
        }
    }

    // Function to add employee
    async function addEmployee(employeeData) {
        try {
            const response = await fetch("http://localhost:3001/api/admin/employee", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(employeeData),
            });

            if (!response.ok) throw new Error("Error adding employee");

            const data = await response.json();
            console.log("Employee added successfully:", data);

        } catch (error) {
            console.error("Error adding new employee:", error);
        }
    }

    // Function to update account status
    async function updateAccountStatus(employeeID, currentStatus) {
        try {
            const status = currentStatus === "Active" ? "close" : "reopen";

            const response = await fetch(`http://localhost:3001/api/admin/employee/${status}/${employeeID}`, {
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

    function renderEmployeeList(data) {
        employeeContainer.innerHTML = ""; // Clear the container
    
        const table = document.createElement("table");
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <th>Employee ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Job Title</th>
            <th>Employee Type</th>
            <th>Pay Frequency</th>
            <th>Salary</th>
            <th>Department</th>
            <th>Is Admin</th>
            <th>Account Status</th>
        `;
        table.appendChild(headerRow);
    
        data.data.forEach(employee => {
            const totalSalary = Number(employee.workInfo.payAmount.baseSalary) + Number(employee.workInfo.payAmount.bonus);
    
            const employeeRow = document.createElement("tr");
            employeeRow.innerHTML = `
                <td>${employee.employeeID}</td>
                <td>${employee.employeeBio.firstName} ${employee.employeeBio.lastName}</td>
                <td>${employee.email}</td>
                <td>${employee.workInfo.jobTitle}</td>
                <td>${employee.workInfo.employeeType}</td>
                <td>${employee.workInfo.payFrequency}</td>
                <td>$${totalSalary.toFixed(2)}</td>
                <td>${employee.workInfo.department}</td>
                <td>${employee.isAdmin}</td>
                <td>${employee.accountStatus}</td>
            `;
    
            employeeRow.addEventListener("click", () => {
                openEmployeeModal(employee);
            });
    
            table.appendChild(employeeRow);
        });
    
        employeeContainer.appendChild(table);
    }
    

    function openEmployeeModal(employee) {
        modalContent.innerHTML = `
            <h2>Employee Information</h2>
            <p><strong>Employee ID:</strong> ${employee.employeeID}</p>
            <p><strong>Email:</strong> ${employee.email}</p>
            <p><strong>Phone Number:</strong> ${employee.phone}</p>
            <p><strong>First Name:</strong> ${employee.employeeBio.firstName}</p>
            <p><strong>Last Name:</strong> ${employee.employeeBio.lastName}</p>
            <p><strong>Gender:</strong> ${employee.employeeBio.gender}</p>
            <p><strong>Address:</strong> ${employee.employeeBio.address.street}, ${employee.employeeBio.address.city}, ${employee.employeeBio.address.state}, ${employee.employeeBio.address.zipCode}, ${employee.employeeBio.address.country}</p>
            <p><strong>Hire Date:</strong> ${employee.workInfo.hireDate}</p>
            <p><strong>Working Hours:</strong> ${employee.workInfo.workingHours.startTime} - ${employee.workInfo.workingHours.endTime}</p>
            <p><strong>Account Status:</strong> ${employee.accountStatus}</p>
            <button id="update-status-btn">Update Account Status</button>
        `;
    
        modal.style.display = "block";
    
        const updateStatusBtn = document.getElementById("update-status-btn");
        updateStatusBtn.addEventListener("click", async () => {
            await updateAccountStatus(employee.employeeID, employee.accountStatus);
            modal.style.display = "none"; 
            getEmployeeList(); 
        });
    }
    

    //////////// Event Listeners ///////////
    
    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    addEmployeeBtn.addEventListener("click", () => {
        employeeFormContainer.style.display = employeeFormContainer.style.display === "none" ? "block" : "none";
    });
    
    employeeForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(employeeForm);
        const email = formData.get("email");
        const password = formData.get("password"); 
        const phone = formData.get("phone");
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const street = formData.get("street");
        const city = formData.get("city");
        const state = formData.get("state");
        const zipCode = formData.get("zipCode");
        const country = formData.get("country");
        const gender = formData.get("gender");
        const jobTitle = formData.get("jobTitle");
        const employeeType = formData.get("employeeType");
        const hireDate = formData.get("hireDate");
        const payFrequency = formData.get("payFrequency");
        const baseSalary = formData.get("baseSalary");
        const bonus = formData.get("bonus");
        const department = formData.get("department");
        const startTime = formData.get("startTime");
        const endTime = formData.get("endTime");
        const dateCreated = new Date().toISOString();
        const isAdmin = document.getElementById("isAdmin").checked;


        const employeeData = {
            email : email,
            password: password,
            phone: phone,
            lastLogin: "",
            isAdmin: isAdmin,
            employeeBio: {
                firstName: firstName,
                lastName: lastName,
                address: {
                    street: street,
                    city: city,
                    state: state,
                    zipCode: zipCode,
                    country: country,
                },
                gender: gender,
            },
            workInfo: {
                jobTitle: jobTitle,
                employeeType: employeeType,
                hireDate: hireDate,
                payFrequency: payFrequency,
                payAmount: {
                    baseSalary: baseSalary,
                    bonus: bonus,
                },
                department: department,
                workingHours: {
                    startTime: startTime,
                    endTime: endTime,
                },
            },
            accountCreated: dateCreated,
            accountStatus: "Active",
        };

        await addEmployee(employeeData);
        getEmployeeList();
    });
});
