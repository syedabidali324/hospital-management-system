/**
 * HMS Data Store (Simulated Backend)
 * Handles persistence via localStorage
 */

const DB_KEY = 'hms_db_v2';

const DEFAULT_DB = {
    users: [
        { id: 'u1', username: 'admin', password: '123', role: 'admin', name: 'Super Admin' },
        { id: 'u2', username: 'doc1', password: '123', role: 'doctor', name: 'Dr. John Doe', specialty: 'Cardiology', fee: 1500 },
        { id: 'u3', username: 'doc2', password: '123', role: 'doctor', name: 'Dr. Sarah Wilson', specialty: 'Neurology', fee: 2000 },
        { id: 'u4', username: 'doc3', password: '123', role: 'doctor', name: 'Dr. Emily Chen', specialty: 'Pediatrics', fee: 1200 },
        { id: 'u5', username: 'doc4', password: '123', role: 'doctor', name: 'Dr. James Smith', specialty: 'Orthopedics', fee: 1800 }
    ],
    settings: {
        hospitalName: 'NexGen Medical Center',
        baseFee: 1000
    },
    appointments: [
        { id: 'a1', doctorId: 'u2', patientName: 'Alice Smith', time: '10:00 AM', reason: 'Fever', status: 'Pending' },
        { id: 'a2', doctorId: 'u2', patientName: 'Bob Jones', time: '11:30 AM', reason: 'Checkup', status: 'Confirmed' }
    ],
    prescriptions: []
};

class Store {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(DB_KEY)) {
            localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB));
            console.log('Database initialized with default data.');
        }
        this.data = JSON.parse(localStorage.getItem(DB_KEY));
    }

    save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    }

    // Auth
    login(username, password) {
        return this.data.users.find(u => u.username === username && u.password === password);
    }

    // User Management
    getUsers() {
        return this.data.users;
    }

    addUser(user) {
        user.id = 'u' + Date.now();
        this.data.users.push(user);
        this.save();
        return user;
    }

    deleteUser(id) {
        this.data.users = this.data.users.filter(u => u.id !== id);
        this.save();
    }

    // Settings
    getSettings() {
        return this.data.settings;
    }

    updateSettings(newSettings) {
        this.data.settings = { ...this.data.settings, ...newSettings };
        this.save();
    }
}

const db = new Store();
window.db = db; // Expose to window for easy access
