document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/testRoute');
        const data = await response.json();
        const heading = document.getElementById('api-message');
        if (heading) {
            heading.textContent = data.message;
        }
    } catch (error) {
        console.error('Error fetching API:', error);
    }

    function setCookie(name, value) {
        let date = new Date();
        date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000)); // 1 day in milliseconds
        let expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/api/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                const result = await response.json();
                // Save tokens to cookies if present
                if (result.data.accesstoken && result.data.refreshtoken) {
                    //document.cookie = `accessToken=${result.data.accesstoken}; 30; path=/;` ;
                    //document.cookie = `refreshToken=${result.data.refreshtoken}; 30; path=/;`;
                    setCookie('accesstoken', result.data.accesstoken);
                    setCookie('refreshtoken', result.data.refreshtoken);
                    console.log('Access Token:', result.data.accesstoken);
                    console.log('Refresh Token:', result.data.refreshtoken);
                }
                console.log('Login response received');
                if (result.success) {
                    window.location.href = 'dashboard.html'; // Adjust the URL as needed
                }
            } catch (error) {
                alert('Login failed');
                console.error('Error:', error);
            }
        });
    }

    // Registration form handler
    const registerForm = document.querySelector('form[action="submit_registration"]');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/api/user/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                const result = await response.json();
                alert(result.message || 'Registration response received');
                
            } catch (error) {
                alert('Registration failed');
                console.error('Error:', error);
            }
        });
    }

    
});