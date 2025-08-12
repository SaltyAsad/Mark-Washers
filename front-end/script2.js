

const API_URL = 'http://localhost:3000/api';
let currentFilter = 'all';

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

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
        // const response = await fetch(`${API_URL}/wash`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ vehicleType, numberPlate })
        // });

         const response = await fetch(`${API_URL}/wash`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODkxNDMxZGJmOTNkNjAwMTc4MmMwYzMiLCJlbWFpbCI6ImFzYWRAZ21haWwuY29tIiwiaWF0IjoxNzU0OTU2NTEyLCJleHAiOjE3NTUwNDI5MTJ9.RHPvvVAD55e7d5x2UVh2KF7u9psSQvRfzgxTN9vVB-4`
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
        //const response = await fetch(`${API_URL}/user-wash`);
        const response = await fetch(`${API_URL}/user-wash`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('accessToken')}`
            },})

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

// Logout button handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                // const response = await fetch('http://localhost:3000/api/user/logout', {
                //     method: 'POST',
                //     credentials: 'include'
                // });
                const response = await fetch(`${API_URL}/user/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODkxNDMxZGJmOTNkNjAwMTc4MmMwYzMiLCJlbWFpbCI6ImFzYWRAZ21haWwuY29tIiwiaWF0IjoxNzU0OTU2NTEyLCJleHAiOjE3NTUwNDI5MTJ9.RHPvvVAD55e7d5x2UVh2KF7u9psSQvRfzgxTN9vVB-4`
            },})
                const result = await response.json();
                alert(result.message || 'Logged out');
                window.location.href = 'index.html'; // Redirect to login page
            } catch (error) {
                alert('Logout failed');
                console.error('Error:', error);
            }
        });
    }

loadQueue();
//setInterval(loadQueue, 5000);
