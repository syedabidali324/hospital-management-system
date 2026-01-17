/**
 * HMS Implementation - Core Application Logic
 * Framework-free SPA architecture
 */

const app = document.getElementById('app');
let currentUser = null;

// ==========================================
// 1. ROUTER & NAVIGATION
// ==========================================
function navigate(route) {
    // Basic Auth Check
    const user = JSON.parse(localStorage.getItem('hms_user'));
    currentUser = user;

    if (!user && route !== 'login') {
        renderLogin();
        return;
    }

    if (user && route === 'login') {
        // Redirect based on role if already logged in
        if (user.role === 'admin') navigate('admin-dashboard');
        else if (user.role === 'doctor') navigate('doctor-dashboard');
        else navigate('generic-dashboard');
        return;
    }

    switch (route) {
        case 'login':
            renderLogin();
            break;
        case 'admin-dashboard':
            if (user.role !== 'admin') { alert('Access Denied'); navigate('login'); return; }
            renderAdminDashboard();
            break;
        case 'doctor-dashboard':
            if (user.role !== 'doctor') { alert('Access Denied'); navigate('login'); return; }
            renderDoctorDashboard();
            break;
        case 'generic-dashboard':
            renderGenericDashboard();
            break;
        default:
            // Fallback for others
            if (user.role !== 'admin' && user.role !== 'doctor') renderGenericDashboard();
            else renderLogin();
    }
}

function dataLogout() {
    localStorage.removeItem('hms_user');
    currentUser = null;
    navigate('login');
}

// ==========================================
// 2. VIEW RENDERERS
// ==========================================

/* --- LOGIN VIEW --- */
function renderLogin() {
    app.innerHTML = `
        <div class="login-container flex-center fade-in">
            <div class="login-overlay flex-center">
                <div class="login-box glass-panel text-center">
                    <h1 class="brand-text"><i class="fas fa-heartbeat"></i> NexGen HMS</h1>
                    <p style="margin-bottom: 2rem; color: #a0aec0;">Secure Hospital Portal</p>
                    
                    <form id="loginForm" onsubmit="handleLogin(event)">
                        <div style="margin-bottom: 1rem;">
                            <input type="text" id="username" class="input-field" placeholder="Username" required>
                        </div>
                        <div style="margin-bottom: 2rem;">
                            <input type="password" id="password" class="input-field" placeholder="Password" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            SIGN IN <i class="fas fa-arrow-right" style="margin-left: 8px;"></i>
                        </button>
                    </form>
                    
                    <div style="margin-top: 1.5rem; font-size: 0.8rem; color: #718096;">
                        <p>Default Admin: <b>admin</b> / <b>123</b></p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* --- ADMIN DASHBOARD VIEW --- */
function renderAdminDashboard(view = 'home') {
    const content = getAdminContent(view);

    app.innerHTML = `
        <div class="dashboard-layout fade-in">
            <!-- Sidebar -->
            <aside class="sidebar glass-panel" style="margin: 1rem; border-radius: 20px;">
                <h2 style="margin-bottom: 2rem; text-align: center; color: var(--color-primary);">Admin Panel</h2>
                <nav>
                    <a onclick="renderAdminDashboard('home')" class="sidebar-nav-item ${view === 'home' ? 'active' : ''}">
                        <i class="fas fa-home"></i> Dashboard
                    </a>
                    <a onclick="renderAdminDashboard('users')" class="sidebar-nav-item ${view === 'users' ? 'active' : ''}">
                        <i class="fas fa-users-cog"></i> User Mgmt
                    </a>
                    <a onclick="renderAdminDashboard('settings')" class="sidebar-nav-item ${view === 'settings' ? 'active' : ''}">
                        <i class="fas fa-cogs"></i> Settings
                    </a>
                    <a onclick="renderAdminDashboard('reports')" class="sidebar-nav-item ${view === 'reports' ? 'active' : ''}">
                        <i class="fas fa-file-invoice-dollar"></i> Reports
                    </a>
                </nav>
                <div style="margin-top: auto;">
                    <button onclick="dataLogout()" class="btn btn-danger" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="main-content">
                <header class="header">
                    <h2 style="font-weight: 500;">Welcome, ${currentUser.name}</h2>
                    <div class="glass-panel" style="padding: 8px 16px; border-radius: 50px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-user-shield" style="color: var(--color-primary);"></i>
                        <span style="font-size: 0.9rem;">Administrator</span>
                    </div>
                </header>
                ${content}
            </main>
        </div>
    `;

    if (view === 'users') renderUserTable();
}

function getAdminContent(view) {
    if (view === 'home') {
        const users = window.db.getUsers();
        const doctors = users.filter(u => u.role === 'doctor').length;
        const staff = users.filter(u => u.role === 'receptionist' || u.role === 'pharmacist').length;
        const settings = window.db.getSettings();

        return `
            <div class="card-grid">
                <div class="glass-panel stat-card card-blue float-anim">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <p style="color: #cbd5e1; font-size: 0.9rem;">Total Doctors</p>
                            <div class="stat-value" style="color: #38bdf8;">${doctors}</div>
                        </div>
                        <div style="background: rgba(56, 189, 248, 0.2); padding: 12px; border-radius: 12px;">
                            <i class="fas fa-user-md fa-2x" style="color: #38bdf8;"></i>
                        </div>
                    </div>
                </div>
                <div class="glass-panel stat-card card-purple" style="animation-delay: 0.1s;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <p style="color: #cbd5e1; font-size: 0.9rem;">Active Staff</p>
                            <div class="stat-value" style="color: #a78bfa;">${staff}</div>
                        </div>
                        <div style="background: rgba(167, 139, 250, 0.2); padding: 12px; border-radius: 12px;">
                            <i class="fas fa-users fa-2x" style="color: #a78bfa;"></i>
                        </div>
                    </div>
                </div>
                <div class="glass-panel stat-card card-green" style="animation-delay: 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <p style="color: #cbd5e1; font-size: 0.9rem;">Consultation Fee</p>
                            <div class="stat-value" style="color: #34d399;">$${settings.baseFee}</div>
                        </div>
                        <div style="background: rgba(52, 211, 153, 0.2); padding: 12px; border-radius: 12px;">
                            <i class="fas fa-dollar-sign fa-2x" style="color: #34d399;"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="glass-panel fade-in" style="padding: 2.5rem; animation-delay: 0.3s; background: linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6));">
                <h3 style="margin-bottom: 1rem;"><i class="fas fa-chart-line" style="color: #38bdf8; margin-right: 10px;"></i> System Status</h3>
                <p style="color: var(--color-text-muted);">
                    System is running at peak performance. All modules are active and secure.
                </p>
            </div>
        `;
    }
    else if (view === 'users') {
        return `
            <div class="glass-panel" style="padding: 2rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                    <h3>User Management</h3>
                    <button onclick="showAddUserModal()" class="btn btn-primary"><i class="fas fa-plus"></i> Add User</button>
                </div>
                <div id="userTableContainer" style="overflow-x: auto;">
                    <!-- Table injected via JS -->
                </div>
            </div>

            <!-- Simple Modal for Add User -->
            <div id="addUserModal" class="glass-panel" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); padding:2rem; z-index:100; min-width: 300px;">
                <h3 style="margin-bottom:1rem;">Add New User</h3>
                <form onsubmit="handleAddUser(event)">
                    <input type="text" name="name" class="input-field" placeholder="Full Name" style="margin-bottom:0.5rem;" required>
                    <input type="text" name="username" class="input-field" placeholder="Username" style="margin-bottom:0.5rem;" required>
                    <input type="password" name="password" class="input-field" placeholder="Password" style="margin-bottom:0.5rem;" required>
                    <select name="role" class="input-field" style="margin-bottom:1rem; background: var(--color-bg-card); color: white;">
                        <option value="doctor">Doctor</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="pharmacist">Pharmacist</option>
                    </select>
                    <div style="display:flex; gap:10px;">
                        <button type="button" onclick="document.getElementById('addUserModal').style.display='none'" class="btn" style="background:transparent; border:1px solid white; color:white;">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        `;
    }
    else if (view === 'settings') {
        const s = window.db.getSettings();
        return `
            <div class="glass-panel" style="padding: 2rem; max-width: 600px;">
                <h3 style="margin-bottom: 1.5rem;">System Configuration</h3>
                <form onsubmit="handleSettingsUpdate(event)">
                    <label style="display:block; margin-bottom:0.5rem; color:var(--color-text-muted);">Hospital Name</label>
                    <input type="text" id="set_hname" class="input-field" value="${s.hospitalName}" style="margin-bottom: 1rem;">
                    
                    <label style="display:block; margin-bottom:0.5rem; color:var(--color-text-muted);">Base Doctor Fee ($)</label>
                    <input type="number" id="set_fee" class="input-field" value="${s.baseFee}" style="margin-bottom: 1.5rem;">

                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>
        `;
    }
    else if (view === 'reports') {
        return `
            <div class="glass-panel" style="padding: 2.5rem;">
                <h3 style="margin-bottom: 2rem;">System Reports</h3>
                
                <div style="display: grid; gap: 1.5rem;">
                    <!-- Report Item 1 -->
                    <div style="background: rgba(15, 23, 42, 0.4); padding: 1.5rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <div style="background: rgba(56, 189, 248, 0.2); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px;">
                                <i class="fas fa-chart-pie" style="color: #38bdf8; font-size: 1.2rem;"></i>
                            </div>
                            <div>
                                <h4 style="color: white; margin-bottom: 4px;">Monthly Financial Report</h4>
                                <p style="color: var(--color-text-muted); font-size: 0.9rem;">January 2026</p>
                            </div>
                        </div>
                        <button onclick="alert('Downloading Financial Report...')" class="btn" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1);">
                            <i class="fas fa-download"></i> PDF
                        </button>
                    </div>

                    <!-- Report Item 2 -->
                    <div style="background: rgba(15, 23, 42, 0.4); padding: 1.5rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <div style="background: rgba(167, 139, 250, 0.2); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px;">
                                <i class="fas fa-user-clock" style="color: #a78bfa; font-size: 1.2rem;"></i>
                            </div>
                            <div>
                                <h4 style="color: white; margin-bottom: 4px;">Doctor Performance Log</h4>
                                <p style="color: var(--color-text-muted); font-size: 0.9rem;">Activity & Consultations</p>
                            </div>
                        </div>
                        <button onclick="alert('Downloading Performance Log...')" class="btn" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1);">
                            <i class="fas fa-download"></i> CSV
                        </button>
                    </div>

                    <!-- Report Item 3 -->
                    <div style="background: rgba(15, 23, 42, 0.4); padding: 1.5rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <div style="background: rgba(52, 211, 153, 0.2); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px;">
                                <i class="fas fa-clipboard-list" style="color: #34d399; font-size: 1.2rem;"></i>
                            </div>
                            <div>
                                <h4 style="color: white; margin-bottom: 4px;">Patient Admission History</h4>
                                <p style="color: var(--color-text-muted); font-size: 0.9rem;">Last 30 Days</p>
                            </div>
                        </div>
                        <button onclick="alert('Downloading Patient History...')" class="btn" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1);">
                            <i class="fas fa-download"></i> PDF
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderUserTable() {
    const users = window.db.getUsers();
    let html = `
        <table style="width: 100%; border-collapse: collapse; color: white;">
            <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left;">
                    <th style="padding: 12px;">Name</th>
                    <th style="padding: 12px;">Role</th>
                    <th style="padding: 12px;">Username</th>
                    <th style="padding: 12px;">Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    users.forEach(u => {
        if (u.role === 'admin') return; // Hide admin from list for safety
        html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 12px;">${u.name}</td>
                <td style="padding: 12px;"><span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${u.role.toUpperCase()}</span></td>
                <td style="padding: 12px;">${u.username}</td>
                <td style="padding: 12px;">
                    <button onclick="handleDeleteUser('${u.id}')" class="btn btn-danger" style="padding: 6px 12px; font-size: 0.8rem;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';

    // Inject into container if it exists (safeguard)
    const container = document.getElementById('userTableContainer');
    if (container) container.innerHTML = html;
}

/* --- DOCTOR DASHBOARD VIEW --- */
function renderDoctorDashboard(view = 'home') {
    app.innerHTML = `
        <div class="dashboard-layout fade-in">
            <aside class="sidebar glass-panel" style="margin: 1rem; border-radius: 20px;">
                <h2 style="margin-bottom: 2rem; text-align: center; color: var(--color-secondary);">Doctor Portal</h2>
                <nav>
                    <a onclick="renderDoctorDashboard('home')" class="sidebar-nav-item ${view === 'home' ? 'active' : ''}">
                        <i class="fas fa-calendar-alt"></i> Schedule
                    </a>
                    <a onclick="renderDoctorDashboard('prescriptions')" class="sidebar-nav-item ${view === 'prescriptions' ? 'active' : ''}">
                        <i class="fas fa-prescription"></i> Write Rx
                    </a>
                    <a onclick="renderDoctorDashboard('profile')" class="sidebar-nav-item ${view === 'profile' ? 'active' : ''}">
                        <i class="fas fa-user-md"></i> Profile
                    </a>
                </nav>
                <div style="margin-top: auto;">
                    <button onclick="dataLogout()" class="btn btn-danger" style="width: 100%;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </aside>

            <main class="main-content">
                <header class="header">
                    <h2>Dr. ${currentUser.name}</h2>
                    <div class="glass-panel" style="padding: 8px 16px; border-radius: 50px;">
                        <span>${currentUser.specialty || 'General Practitioner'}</span>
                    </div>
                </header>
                
                ${getDoctorContent(view)}
            </main>
        </div>
    `;
}

function getDoctorContent(view) {
    if (view === 'home') {
        const apps = window.db.data.appointments.filter(a => a.doctorId === currentUser.id);

        let apptHtml = '';
        if (apps.length === 0) {
            apptHtml = '<p style="color: var(--color-text-muted);">No appointments found.</p>';
        } else {
            apps.forEach(a => {
                apptHtml += `
                    <div class="glass-panel" style="padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="color: var(--color-primary);">${a.time} - ${a.patientName}</h4>
                            <p style="font-size: 0.9rem; color: #cbd5e0;">Reason: ${a.reason}</p>
                        </div>
                        <span style="background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem;">${a.status}</span>
                    </div>
                `;
            });
        }

        return `
            <div class="glass-panel" style="padding: 2rem; margin-bottom: 2rem;">
                <h3><i class="far fa-clock"></i> Today's Schedule</h3>
                <div style="margin-top: 1.5rem;">
                    ${apptHtml}
                </div>
            </div>
        `;
    }
    else if (view === 'prescriptions') {
        return `
            <div class="glass-panel" style="padding: 2rem; max-width: 800px;">
                <h3 style="margin-bottom: 1.5rem;">Write Prescription</h3>
                <form onsubmit="handlePrescription(event)">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <input type="text" class="input-field" placeholder="Patient Name" required>
                        <input type="text" class="input-field" placeholder="Age" required>
                    </div>
                    <textarea class="input-field" rows="4" placeholder="Medicines (e.g., Panadol 500mg - 1+1+1)" style="margin-bottom: 1rem;" required></textarea>
                    <textarea class="input-field" rows="2" placeholder="Notes / Advice" style="margin-bottom: 1.5rem;"></textarea>
                    
                    <button type="submit" class="btn btn-primary"><i class="fas fa-print"></i> Save & Print</button>
                </form>
            </div>
        `;
    }
    else {
        return getDoctorProfile();
    }
}

function getDoctorProfile() {
    return `
        <div class="glass-panel" style="padding: 2rem; max-width: 600px;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="width: 100px; height: 100px; background: var(--color-primary); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user-md fa-3x" style="color: white;"></i>
                </div>
                <h3>${currentUser.name}</h3>
            </div>
            <div style="display: grid; gap: 1rem;">
                <div class="input-field">Username: ${currentUser.username}</div>
                <div class="input-field">Specialty: ${currentUser.specialty || 'General'}</div>
            </div>
        </div>
    `;
}

function handlePrescription(e) {
    e.preventDefault();
    alert('Prescription Saved Successfully! (Simulation)');
    renderDoctorDashboard('home');
}

/* --- GENERIC DASHBOARD (Fallback) --- */
function renderGenericDashboard() {
    app.innerHTML = `
        <div class="flex-center" style="height: 100vh; flex-direction: column;">
            <div class="glass-panel" style="padding: 3rem; text-align: center;">
                <h2 style="color: var(--color-primary);">Welcome, ${currentUser.name}</h2>
                <p style="margin: 1rem 0; color: #a0aec0;">You are logged in as <b>${currentUser.role}</b>.</p>
                <p style="margin-bottom: 2rem;">Your dashboard is under construction.</p>
                <button onclick="dataLogout()" class="btn btn-danger">Logout</button>
            </div>
        </div>
    `;
}

// Update Router Fallback
// ... (Logic in navigate function needs to be updated manually if I don't replace the whole file, 
//      but strict replacement is safer. I'll stick to replacing the renderDoctorDashboard and below.)




// ==========================================
// 3. EVENT HANDLERS
// ==========================================

function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    const user = window.db.login(u, p);
    if (user) {
        localStorage.setItem('hms_user', JSON.stringify(user));
        navigate('login'); // Will auto-redirect
    } else {
        alert('Invalid Credentials!');
    }
}

function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

function handleAddUser(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newUser = {
        name: fd.get('name'),
        username: fd.get('username'),
        password: fd.get('password'),
        role: fd.get('role'),
        specialty: 'General', // Default
    };

    window.db.addUser(newUser);
    renderAdminDashboard('users'); // Refresh
}

function handleDeleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        window.db.deleteUser(id);
        renderAdminDashboard('users'); // Refresh
    }
}

function handleSettingsUpdate(e) {
    e.preventDefault();
    const hospitalName = document.getElementById('set_hname').value;
    const baseFee = document.getElementById('set_fee').value;

    window.db.updateSettings({ hospitalName, baseFee });
    alert('Settings Saved!');
    renderAdminDashboard('settings');
}


// ==========================================
// 4. INITIALIZATION
// ==========================================

// Start the app
navigate('login'); // Default start
