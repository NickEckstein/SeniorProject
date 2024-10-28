document.addEventListener("DOMContentLoaded", () => {
    
    const customerForm = document.getElementById("customerForm");
    customerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const customerData = {
            email: document.getElementById("username").value,
            password: document.getElementById("password").value,
        };

        try {
            const response = await fetch("http://localhost:3001/api/customer/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(customerData),
            });

            const data = await response.json();
            console.log(data);
            if (response.ok && data){
                alert("Customer login sucessful: ${data.user.customerBio.firstName}");   
                window.location.href = "main_menu_customer.html";

            } else{
                alert("Customer login failed: ${data.error.message}");   
            }
        } catch (error) {
            console.error("Error during customer login:", error);
            alert("An error occured during login.")
        }
    });

    const employeeForm = document.getElementById("employeeForm");
    employeeForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const employeeData = {
            email: document.getElementById("emp-username").value,
            password: document.getElementById("emp-password").value,
        };

        try {
            const response = await fetch("http://localhost:3001/api/employee/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(employeeData),
            });

            const data = await response.json();
            console.log(data);
            if (response.ok && data){
                alert("Employee login sucessful: ${data.user.employeeBio.firstName}");   
                
                if(data.user.isAdmin){
                    window.location.href = "main_menu_admin.html";
                } else {
                    window.location.href = "main_menu_employee.html";
                }
            } else{
                alert("Customer login failed: ${data.error.message}");   
            }
        } catch (error) {
            console.error("Error during customer login:", error);
            alert("An error occured during login.")
        }
    });

    
    
})


function toggleLogin(type) {
    const employeeSection = document.getElementById('employee-login');
    const customerSection = document.getElementById('customer-login');
    const employeeButton = document.getElementById('employee-btn');
    const customerButton = document.getElementById('customer-btn');
    
    if (type === 'employee') {
        employeeSection.style.display = 'block';
        customerSection.style.display = 'none';
        employeeButton.classList.add('active');
        customerButton.classList.remove('active');
    } else {
        employeeSection.style.display = 'none';
        customerSection.style.display = 'block';
        employeeButton.classList.remove('active');
        customerButton.classList.add('active');
    }
}
