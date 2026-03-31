document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const partnersTableBody = document.getElementById('partners-table-body');
    const vetsTableBody = document.getElementById('vets-table-body');
    const partnerSearch = document.getElementById('partner-search');
    const vetSearch = document.getElementById('vet-search');
    const logoutBtn = document.getElementById('logout-btn');

    // Check if already logged in
    const checkAuth = () => {
        // Check for mastermind authentication cookie
        const hasAuthCookie = document.cookie.includes('mastermind=');

        if (hasAuthCookie) {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            loadData();
        } else {
            // Clear session storage if cookie is not present (additional security)
            sessionStorage.removeItem('mastermind-auth');
            loginSection.style.display = 'block';
            dashboardSection.style.display = 'none';
        }
    };

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/mastermind/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include', // Important for cookie handling
            });

            if (response.ok) {
                sessionStorage.setItem('mastermind-auth', 'true');
                loginSection.style.display = 'none';
                dashboardSection.style.display = 'block';
                loadData();
            } else {
                alert('Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again.');
        }
    });

    // Handle logout
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/mastermind/logout', {
                method: 'POST',
                credentials: 'include', // Important for cookie handling
            });

            if (response.ok) {
                // Remove auth from session storage
                sessionStorage.removeItem('mastermind-auth');
                loginSection.style.display = 'block';
                dashboardSection.style.display = 'none';
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout. Please try again.');
        }
    });

    // Load partners and vets data
    const loadData = async () => {
        try {
            await Promise.all([loadPartners(), loadVets()]);
        } catch (error) {
            console.error('Error loading data:', error);

            // If unauthorized, redirect to login
            if (error.status === 401) {
                sessionStorage.removeItem('mastermind-auth');
                loginSection.style.display = 'block';
                dashboardSection.style.display = 'none';
                alert('Your session has expired. Please login again.');
            } else {
                alert('Failed to load user data. Please refresh the page.');
            }
        }
    };

    // Load partners data
    const loadPartners = async () => {
        const response = await fetch('/mastermind/partners', {
            credentials: 'include', // Important for cookie handling
        });

        if (!response.ok) {
            const error = new Error('Failed to fetch partners');
            error.status = response.status;
            throw error;
        }

        const partners = await response.json();
        renderPartners(partners);

        // Add search functionality
        partnerSearch.addEventListener('input', () => {
            const searchTerm = partnerSearch.value.toLowerCase();
            const filteredPartners = partners.filter(
                (partner) =>
                    partner.name?.toLowerCase().includes(searchTerm) ||
                    partner.email?.toLowerCase().includes(searchTerm),
            );
            renderPartners(filteredPartners);
        });
    };

    // Load vets data
    const loadVets = async () => {
        const response = await fetch('/mastermind/vets', {
            credentials: 'include', // Important for cookie handling
        });

        if (!response.ok) {
            const error = new Error('Failed to fetch vets');
            error.status = response.status;
            throw error;
        }

        const vets = await response.json();
        renderVets(vets);

        // Add search functionality
        vetSearch.addEventListener('input', () => {
            const searchTerm = vetSearch.value.toLowerCase();
            const filteredVets = vets.filter(
                (vet) =>
                    vet.name?.toLowerCase().includes(searchTerm) ||
                    vet.email?.toLowerCase().includes(searchTerm),
            );
            renderVets(filteredVets);
        });
    };

    // Render partners data
    const renderPartners = (partners) => {
        partnersTableBody.innerHTML = '';

        partners.forEach((partner) => {
            const row = document.createElement('tr');

            row.innerHTML = `
        <td>${partner.name || 'N/A'}</td>
        <td>${partner.email || 'N/A'}</td>
        <td>${partner.phone || 'N/A'}</td>
        <td>
          <button class="btn btn-sm ${partner.isSuspended ? 'btn-secondary' : 'btn-primary'} login-button" data-id="${partner.id}" data-role="partner" ${partner.isSuspended ? 'disabled' : ''}>
            <i class="bi ${partner.isSuspended ? 'bi-lock' : 'bi-box-arrow-in-right'}"></i> ${partner.isSuspended ? 'Suspended' : 'Login'}
          </button>
        </td>
      `;

            partnersTableBody.appendChild(row);
        });

        // Add event listeners to login buttons
        document
            .querySelectorAll('#partners-table-body .login-button:not([disabled])')
            .forEach((button) => {
                button.addEventListener('click', handleImpersonateLogin);
            });
    };

    // Render vets data
    const renderVets = (vets) => {
        vetsTableBody.innerHTML = '';

        vets.forEach((vet) => {
            const row = document.createElement('tr');

            row.innerHTML = `
        <td>${vet.name || 'N/A'}</td>
        <td>${vet.email || 'N/A'}</td>
        <td>
          <button class="btn btn-sm ${vet.isSuspended ? 'btn-secondary' : 'btn-primary'} login-button" data-id="${vet.id}" data-role="vet" ${vet.isSuspended ? 'disabled' : ''}>
            <i class="bi ${vet.isSuspended ? 'bi-lock' : 'bi-box-arrow-in-right'}"></i> ${vet.isSuspended ? 'Suspended' : 'Login'}
          </button>
        </td>
      `;

            vetsTableBody.appendChild(row);
        });

        // Add event listeners to login buttons
        document
            .querySelectorAll('#vets-table-body .login-button:not([disabled])')
            .forEach((button) => {
                button.addEventListener('click', handleImpersonateLogin);
            });
    };

    // Handle impersonate login
    const handleImpersonateLogin = async (e) => {
        const button = e.currentTarget;
        const userId = button.getAttribute('data-id');
        const role = button.getAttribute('data-role');

        button.disabled = true;
        button.innerHTML = '<i class="bi bi-hourglass"></i> Logging in...';

        try {
            const response = await fetch('/mastermind/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role }),
                credentials: 'include', // Important for cookie handling
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.redirectUrl;
            } else {
                throw new Error('Failed to impersonate login');
            }
        } catch (error) {
            console.error('Impersonate login error:', error);
            alert('Failed to login as user. Please try again.');
            button.disabled = false;
            button.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Login';
        }
    };

    // Initialize
    checkAuth();
});
