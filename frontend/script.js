const API_BASE = 'http://localhost:7000';
let currentToken = '';
let selectedFile = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeUploadArea();
    checkSavedToken();
});

function initializeUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');

    uploadArea.addEventListener('click', () => imageInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
    }
    
    selectedFile = file;
    updateUploadArea(file);
    document.getElementById('moderateBtn').disabled = !currentToken;
}

function updateUploadArea(file) {
    const uploadArea = document.getElementById('uploadArea');
    const reader = new FileReader();
    
    reader.onload = function(e) {
        uploadArea.innerHTML = `
            <img src="${e.target.result}" alt="Selected image" class="image-preview">
            <p><strong>${file.name}</strong></p>
            <p class="file-info">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        `;
    };
    
    reader.readAsDataURL(file);
}

function checkSavedToken() {
    const saved = localStorage.getItem('moderation_token');
    if (saved) {
        document.getElementById('tokenInput').value = saved;
        setToken();
    }
}

async function setToken() {
    const tokenInput = document.getElementById('tokenInput');
    const token = tokenInput.value.trim();
    
    if (!token) {
        showTokenStatus('Please enter a token', false);
        return;
    }
    
    try {
        // Test the token by making a request to the API
        const response = await fetch(`${API_BASE}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            currentToken = token;
            localStorage.setItem('moderation_token', token);
            showTokenStatus('✅ Token valid', true);
            document.getElementById('moderateBtn').disabled = !selectedFile;
            
            // Check if admin token
            try {
                const adminCheck = await fetch(`${API_BASE}/auth/tokens`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (adminCheck.ok) {
                    document.getElementById('adminSection').style.display = 'block';
                }
            } catch (e) {
                // Not an admin token, that's fine
            }
        } else {
            throw new Error('Invalid token');
        }
    } catch (error) {
        currentToken = '';
        localStorage.removeItem('moderation_token');
        showTokenStatus('❌ Invalid token', false);
        document.getElementById('moderateBtn').disabled = true;
        document.getElementById('adminSection').style.display = 'none';
    }
}

function showTokenStatus(message, isValid) {
    const status = document.getElementById('tokenStatus');
    status.textContent = message;
    status.className = `token-status ${isValid ? 'valid' : 'invalid'}`;
}

async function moderateImage() {
    if (!selectedFile || !currentToken) {
        showError('Please select an image and set a valid token');
        return;
    }
    
    const button = document.getElementById('moderateBtn');
    const originalText = button.textContent;
    button.innerHTML = '<span class="loading"></span> Analyzing...';
    button.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const response = await fetch(`${API_BASE}/moderate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to moderate image');
        }
        
        const result = await response.json();
        displayResults(result);
        
    } catch (error) {
        showError(`Moderation failed: ${error.message}`);
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

function displayResults(result) {
    const resultsSection = document.getElementById('resultsSection');
    const resultCard = document.getElementById('resultCard');
    
    const isSafe = result.is_safe;
    const confidence = Math.round(result.confidence * 100);
    
    resultCard.className = `result-card ${isSafe ? 'result-safe' : 'result-unsafe'}`;
    
    let categoriesHtml = '';
    if (result.categories && result.categories.length > 0) {
        categoriesHtml = `
            <div class="categories">
                <strong>Flagged Categories:</strong><br>
                ${result.categories.map(cat => `<span class="category-tag">${cat.replace('_', ' ')}</span>`).join('')}
            </div>
        `;
    }
    
    resultCard.innerHTML = `
        <div class="result-header">
            <span class="result-icon">${isSafe ? '✅' : '⚠️'}</span>
            <span class="result-status">${isSafe ? 'Content Safe' : 'Content Flagged'}</span>
        </div>
        
        <p><strong>Confidence:</strong> ${confidence}%</p>
        <div class="confidence-bar">
            <div class="confidence-fill ${isSafe ? 'confidence-safe' : 'confidence-unsafe'}" 
                 style="width: ${confidence}%"></div>
        </div>
        
        <p><strong>Message:</strong> ${result.message}</p>
        
        ${categoriesHtml}
        
        ${result.details ? `
            <details style="margin-top: 15px;">
                <summary style="cursor: pointer; font-weight: bold;">Technical Details</summary>
                <pre style="margin-top: 10px; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto;">${JSON.stringify(result.details, null, 2)}</pre>
            </details>
        ` : ''}
    `;
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

async function createToken() {
    if (!currentToken) {
        showError('Please set an admin token first');
        return;
    }
    
    const isAdmin = confirm('Should this token have admin privileges?');
    const description = prompt('Enter a description for this token (optional):');
    
    try {
        const response = await fetch(`${API_BASE}/auth/tokens`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isAdmin: isAdmin,
                description: description || null
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create token');
        }
        
        const result = await response.json();
        displayAdminResult(`
            <h4>New Token Created</h4>
            <p><strong>Token:</strong> <code>${result.token}</code></p>
            <p><strong>Admin:</strong> ${result.isAdmin ? 'Yes' : 'No'}</p>
            <p><strong>Description:</strong> ${result.description || 'None'}</p>
            <p><strong>Created:</strong> ${new Date(result.createdAt).toLocaleString()}</p>
        `);
        
    } catch (error) {
        showError(`Failed to create token: ${error.message}`);
    }
}

async function listTokens() {
    if (!currentToken) {
        showError('Please set an admin token first');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/tokens`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch tokens');
        }
        
        const tokens = await response.json();
        
        const tokensHtml = tokens.map(token => `
            <div style="border: 1px solid #e2e8f0; padding: 10px; margin: 5px 0; border-radius: 8px;">
                <p><strong>Token:</strong> <code>${token.token}</code></p>
                <p><strong>Admin:</strong> ${token.isAdmin ? 'Yes' : 'No'}</p>
                <p><strong>Description:</strong> ${token.description || 'None'}</p>
                <p><strong>Created:</strong> ${new Date(token.createdAt).toLocaleString()}</p>
                <button onclick="deleteToken('${token.token}')" style="background: #e53e3e; padding: 5px 10px; font-size: 12px;">Delete</button>
            </div>
        `).join('');
        
        displayAdminResult(`
            <h4>All Active Tokens (${tokens.length})</h4>
            ${tokensHtml || '<p>No tokens found</p>'}
        `);
        
    } catch (error) {
        showError(`Failed to list tokens: ${error.message}`);
    }
}

async function deleteToken(token) {
    if (!currentToken) {
        showError('Please set an admin token first');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete this token?\n${token}`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/tokens/${token}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete token');
        }
        
        displayAdminResult(`<p style="color: green;">✅ Token deleted successfully</p>`);
        
        // Refresh the token list
        setTimeout(listTokens, 1000);
        
    } catch (error) {
        showError(`Failed to delete token: ${error.message}`);
    }
}

function displayAdminResult(html) {
    const adminResults = document.getElementById('adminResults');
    adminResults.innerHTML = html;
}

function showError(message) {
    alert(message); // Simple error display - could be enhanced with toast notifications
}
