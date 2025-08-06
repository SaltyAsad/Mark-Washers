

const API_URL = 'http://localhost:3000/api';
let currentFilter = 'all';

function updateTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

setInterval(updateTime, 1000);
updateTime();

document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const vehicleType = document.querySelector('input[name="vehicleType"]:checked').value;
    const numberPlate = document.getElementById('numberPlate').value.toUpperCase();
    
    try {
        const response = await fetch(`${API_URL}/wash`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ vehicleType, numberPlate })
        });
        
        if (response.ok) {
            showToast('Vehicle added successfully!', 'success');
            document.getElementById('vehicleForm').reset();
            loadQueue();
        } else {
            showToast('Error adding vehicle', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
    }
});

async function loadQueue() {
    try {
        const response = await fetch(`${API_URL}/wash`);
        const washes = await response.json();
        
        const queueList = document.getElementById('queueList');
        const filteredWashes = currentFilter === 'all' 
            ? washes 
            : washes.filter(wash => wash.status === currentFilter);
        
        document.getElementById('queueCount').textContent = 
            washes.filter(w => w.status === 'Pending').length;
        
        if (filteredWashes.length === 0) {
            queueList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No vehicles ${currentFilter === 'all' ? 'in queue' : currentFilter.toLowerCase()}</p>
                </div>
            `;
            return;
        }
        
        queueList.innerHTML = filteredWashes.map(wash => {
            const icon = wash.vehicleType === 'Car' ? 'fa-car-side' : 
                        wash.vehicleType === 'Bike' ? 'fa-motorcycle' : 'fa-truck';
            
            const entryTime = new Date(wash.entryTime);
            const timeStr = entryTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            return `
                <div class="queue-item ${wash.status.toLowerCase()}" data-id="${wash._id}">
                    <div class="vehicle-info">
                        <div class="vehicle-icon">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="vehicle-details">
                            <h3>${wash.tokenNumber}</h3>
                            <p>${wash.numberPlate}</p>
                            <div class="detail-tags">
                                <span class="tag lane">Lane ${wash.lane}</span>
                                <span class="tag price">PKR ${wash.price}</span>
                                <span class="tag">${timeStr}</span>
                            </div>
                        </div>
                    </div>
                    <div class="queue-actions">
                        <span class="status-badge status-${wash.status.toLowerCase()}">${wash.status}</span>
                        ${wash.status === 'Pending' ? 
                            `<button class="action-btn complete-btn" onclick="markComplete('${wash._id}')">
                                <i class="fas fa-check"></i> Complete
                            </button>` : 
                            `<button class="action-btn receipt-btn" onclick="showReceipt('${wash._id}')">
                                <i class="fas fa-receipt"></i> Receipt
                            </button>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading queue:', error);
        showToast('Error loading queue', 'error');
    }
}

function filterQueue(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    loadQueue();
}

async function markComplete(id) {
    try {
        const response = await fetch(`${API_URL}/wash/${id}/complete`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            showToast('Wash completed!', 'success');
            loadQueue();
        } else {
            showToast('Error completing wash', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
    }
}

async function showReceipt(id) {
    try {
        const response = await fetch(`${API_URL}/wash/${id}/receipt`);
        const receipt = await response.json();
        
        const modal = document.getElementById('receiptModal');
        const receiptContent = document.getElementById('receiptContent');
        
        const startTime = new Date(receipt.washStartTime);
        const finishTime = new Date(receipt.washFinishTime);
        
        receiptContent.innerHTML = `
            <p><strong>Receipt No:</strong> <span>${receipt.tokenNumber}</span></p>
            <p><strong>Vehicle Number:</strong> <span>${receipt.vehicleNumber}</span></p>
            <p><strong>Vehicle Type:</strong> <span>${receipt.type}</span></p>
            <p><strong>Lane:</strong> <span>${receipt.lane}</span></p>
            <p><strong>Date:</strong> <span>${startTime.toLocaleDateString()}</span></p>
            <p><strong>Start Time:</strong> <span>${startTime.toLocaleTimeString()}</span></p>
            <p><strong>Finish Time:</strong> <span>${finishTime.toLocaleTimeString()}</span></p>
            <p style="font-size: 1.2rem; font-weight: 600; color: var(--primary); border-top: 2px solid #e5e7eb; padding-top: 1rem; margin-top: 1rem;">
                <strong>Total Amount:</strong> <span>PKR ${receipt.totalPrice}</span>
            </p>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        showToast('Error loading receipt', 'error');
    }
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('receiptModal').style.display = 'none';
});

window.onclick = (event) => {
    const modal = document.getElementById('receiptModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

loadQueue();
setInterval(loadQueue, 5000);

// const API_URL = 'http://localhost:3000/api';
// let currentFilter = 'all';
// let currentUser = null;

// // Show different pages
// function showLogin() {
//     document.getElementById('loginPage').classList.remove('hidden');
//     document.getElementById('mainApp').classList.add('hidden');
// }

// function showMainApp() {
//     document.getElementById('loginPage').classList.add('hidden');
//     document.getElementById('mainApp').classList.remove('hidden');
    
//     if (currentUser) {
//         document.getElementById('userName').textContent = currentUser.fullName || currentUser.email;
//     }
    
//     updateTime();
//     loadQueue();
// }

// // Authentication functions using your existing endpoints
// async function login(email, password) {
//     try {
//         // Using GET method as per your route: router.route("/user/login").get(loginUser)
//         const response = await fetch(`${API_URL}/user/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         const data = await response.json();

//         if (response.ok) {
//             currentUser = data.data?.user || { email: email };
//             showMessage('loginMessage', 'Login successful!', 'success');
//             setTimeout(() => showMainApp(), 1000);
//         } else {
//             showMessage('loginMessage', data.message || 'Login failed', 'error');
//         }
//     } catch (error) {
//         showMessage('loginMessage', 'Connection error. Please try again.', 'error');
//     }
// }

// async function logout() {
//     try {
//         // Using POST method as per your route: router.route("/user/logout").post(verifyJWT,logOutUser)
//         await fetch(`${API_URL}/user/logout`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//     } catch (error) {
//         console.log('Logout request failed');
//     }

//     currentUser = null;
//     showLogin();
//     showToast('Logged out successfully!', 'success');
// }

// // Utility function to show messages
// function showMessage(elementId, message, type) {
//     const messageDiv = document.getElementById(elementId);
//     messageDiv.innerHTML = `<div class="${type}-message">${message}</div>`;
    
//     setTimeout(() => {
//         messageDiv.innerHTML = '';
//     }, 5000);
// }

// function updateTime() {
//     const now = new Date();
//     const timeElement = document.getElementById('currentTime');
//     if (timeElement) {
//         timeElement.textContent = now.toLocaleTimeString('en-US', { 
//             hour: '2-digit', 
//             minute: '2-digit' 
//         });
//     }
// }

// // Event listeners
// document.addEventListener('DOMContentLoaded', function() {
//     // Login form submission
//     document.getElementById('loginForm').addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const email = document.getElementById('loginEmail').value;
//         const password = document.getElementById('loginPassword').value;
        
//         document.getElementById('loginBtn').disabled = true;
//         await login(email, password);
//         document.getElementById('loginBtn').disabled = false;
//     });

//     // Logout button
//     document.getElementById('logoutBtn').addEventListener('click', logout);

//     // Vehicle form submission
//     document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
//         e.preventDefault();
        
//         const vehicleType = document.querySelector('input[name="vehicleType"]:checked').value;
//         const numberPlate = document.getElementById('numberPlate').value.toUpperCase();
        
//         try {
//             const response = await fetch(`${API_URL}/wash`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ vehicleType, numberPlate })
//             });
            
//             if (response.ok) {
//                 showToast('Vehicle added successfully!', 'success');
//                 document.getElementById('vehicleForm').reset();
//                 loadQueue();
//             } else {
//                 showToast('Error adding vehicle', 'error');
//             }
//         } catch (error) {
//             showToast('Connection error', 'error');
//         }
//     });

//     // Modal close handlers
//     document.querySelector('.close').addEventListener('click', () => {
//         document.getElementById('receiptModal').style.display = 'none';
//     });

//     // Initialize app - start with login page
//     showLogin();
// });

// async function loadQueue() {
//     try {
//         const response = await fetch(`${API_URL}/wash`);
//         const washes = await response.json();
        
//         const queueList = document.getElementById('queueList');
//         const filteredWashes = currentFilter === 'all' 
//             ? washes 
//             : washes.filter(wash => wash.status === currentFilter);
        
//         const queueCountElement = document.getElementById('queueCount');
//         if (queueCountElement) {
//             queueCountElement.textContent = washes.filter(w => w.status === 'Pending').length;
//         }
        
//         if (filteredWashes.length === 0) {
//             queueList.innerHTML = `
//                 <div class="empty-state">
//                     <i class="fas fa-inbox"></i>
//                     <p>No vehicles ${currentFilter === 'all' ? 'in queue' : currentFilter.toLowerCase()}</p>
//                 </div>
//             `;
//             return;
//         }
        
//         queueList.innerHTML = filteredWashes.map(wash => {
//             const icon = wash.vehicleType === 'Car' ? 'fa-car-side' : 
//                         wash.vehicleType === 'Bike' ? 'fa-motorcycle' : 'fa-truck';
            
//             const entryTime = new Date(wash.entryTime);
//             const timeStr = entryTime.toLocaleTimeString('en-US', { 
//                 hour: '2-digit', 
//                 minute: '2-digit' 
//             });
            
//             return `
//                 <div class="queue-item ${wash.status.toLowerCase()}" data-id="${wash._id}">
//                     <div class="vehicle-info">
//                         <div class="vehicle-icon">
//                             <i class="fas ${icon}"></i>
//                         </div>
//                         <div class="vehicle-details">
//                             <h3>${wash.tokenNumber}</h3>
//                             <p>${wash.numberPlate}</p>
//                             <div class="detail-tags">
//                                 <span class="tag lane">Lane ${wash.lane}</span>
//                                 <span class="tag price">PKR ${wash.price}</span>
//                                 <span class="tag">${timeStr}</span>
//                             </div>
//                         </div>
//                     </div>
//                     <div class="queue-actions">
//                         <span class="status-badge status-${wash.status.toLowerCase()}">${wash.status}</span>
//                         ${wash.status === 'Pending' ? 
//                             `<button class="action-btn complete-btn" onclick="markComplete('${wash._id}')">
//                                 <i class="fas fa-check"></i> Complete
//                             </button>` : 
//                             `<button class="action-btn receipt-btn" onclick="showReceipt('${wash._id}')">
//                                 <i class="fas fa-receipt"></i> Receipt
//                             </button>`
//                         }
//                     </div>
//                 </div>
//             `;
//         }).join('');
//     } catch (error) {
//         console.error('Error loading queue:', error);
//         showToast('Error loading queue', 'error');
//     }
// }

// function filterQueue(filter) {
//     currentFilter = filter;
//     document.querySelectorAll('.filter-tab').forEach(tab => {
//         tab.classList.remove('active');
//     });
//     event.target.classList.add('active');
//     loadQueue();
// }

// async function markComplete(id) {
//     try {
//         const response = await fetch(`${API_URL}/wash/${id}/complete`, {
//             method: 'PATCH'
//         });
        
//         if (response.ok) {
//             showToast('Wash completed!', 'success');
//             loadQueue();
//         } else {
//             showToast('Error completing wash', 'error');
//         }
//     } catch (error) {
//         showToast('Connection error', 'error');
//     }
// }

// async function showReceipt(id) {
//     try {
//         const response = await fetch(`${API_URL}/wash/${id}/receipt`);
//         const receipt = await response.json();
        
//         const modal = document.getElementById('receiptModal');
//         const receiptContent = document.getElementById('receiptContent');
        
//         const startTime = new Date(receipt.washStartTime);
//         const finishTime = new Date(receipt.washFinishTime);
        
//         receiptContent.innerHTML = `
//             <p><strong>Receipt No:</strong> <span>${receipt.tokenNumber}</span></p>
//             <p><strong>Vehicle Number:</strong> <span>${receipt.vehicleNumber}</span></p>
//             <p><strong>Vehicle Type:</strong> <span>${receipt.type}</span></p>
//             <p><strong>Lane:</strong> <span>${receipt.lane}</span></p>
//             <p><strong>Date:</strong> <span>${startTime.toLocaleDateString()}</span></p>
//             <p><strong>Start Time:</strong> <span>${startTime.toLocaleTimeString()}</span></p>
//             <p><strong>Finish Time:</strong> <span>${finishTime.toLocaleTimeString()}</span></p>
//             <p style="font-size: 1.2rem; font-weight: 600; color: var(--primary); border-top: 2px solid #e5e7eb; padding-top: 1rem; margin-top: 1rem;">
//                 <strong>Total Amount:</strong> <span>PKR ${receipt.totalPrice}</span>
//             </p>
//         `;
        
//         modal.style.display = 'block';
//     } catch (error) {
//         showToast('Error loading receipt', 'error');
//     }
// }

// function showToast(message, type) {
//     const toast = document.getElementById('toast');
//     toast.textContent = message;
//     toast.className = `toast ${type} show`;
    
//     setTimeout(() => {
//         toast.classList.remove('show');
//     }, 3000);
// }

// window.onclick = (event) => {
//     const modal = document.getElementById('receiptModal');
//     if (event.target == modal) {
//         modal.style.display = 'none';
//     }
// }

// // Update time periodically when on main app
// setInterval(() => {
//     if (!document.getElementById('mainApp').classList.contains('hidden')) {
//         updateTime();
//         loadQueue();
//     }
// }, 5000);