// API Configuration
const API_BASE = window.location.origin;
const API = {
    auth: {
        register: `${API_BASE}/api/auth/register`,
        login: `${API_BASE}/api/auth/login`
    },
    todos: `${API_BASE}/api/todo`,
    categories: `${API_BASE}/api/category`,
    tags: `${API_BASE}/api/tag`
};

// State
let currentUser = null;
let token = null;
let categories = [];
let tags = [];
let selectedTags = [];
let editingTodo = null;
let currentPage = 1;
let totalPages = 1;
const pageSize = 10;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
        token = storedToken;
        currentUser = JSON.parse(storedUser);
        showApp();
    } else {
        showAuth();
    }

    // Setup form handlers
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

// Auth Functions
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabs[0].classList.add('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabs[1].classList.add('active');
    }

    hideAuthError();
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(API.auth.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            token = data.token;
            currentUser = { username: data.username, email: data.email, userId: data.userId };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));

            showApp();
        } else {
            const error = await response.json();
            showAuthError(error.message || 'Invalid credentials');
        }
    } catch (error) {
        showAuthError('Login failed. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(API.auth.register, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            const data = await response.json();
            token = data.token;
            currentUser = { username: data.username, email: data.email, userId: data.userId };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));

            showApp();
        } else {
            const error = await response.json();
            showAuthError(error.message || 'Registration failed');
        }
    } catch (error) {
        showAuthError('Registration failed. Please try again.');
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuth();
}

function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideAuthError() {
    document.getElementById('authError').classList.add('hidden');
}

function showAuth() {
    document.getElementById('authView').classList.remove('hidden');
    document.getElementById('appView').classList.add('hidden');
}

function showApp() {
    document.getElementById('authView').classList.add('hidden');
    document.getElementById('appView').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.username;

    loadCategories();
    loadTags();
    loadTodos();
}

// API Helper
async function apiCall(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            alert('Session expired. Please login again.');
            logout();
            return null;
        }

        if (response.status === 500) {
            // Check if it's a foreign key constraint error (likely invalid user)
            const text = await response.text();
            if (text.includes('foreign key constraint') || text.includes('FK_')) {
                alert('Your session is invalid. Please login again.');
                logout();
                return null;
            }
            throw new Error(`Server error: ${response.status}`);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Tab Switching
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));

    document.getElementById('todosTab').classList.add('hidden');
    document.getElementById('categoriesTab').classList.add('hidden');
    document.getElementById('tagsTab').classList.add('hidden');

    if (tab === 'todos') {
        tabs[0].classList.add('active');
        document.getElementById('todosTab').classList.remove('hidden');
        loadTodos();
    } else if (tab === 'categories') {
        tabs[1].classList.add('active');
        document.getElementById('categoriesTab').classList.remove('hidden');
        loadCategories();
    } else if (tab === 'tags') {
        tabs[2].classList.add('active');
        document.getElementById('tagsTab').classList.remove('hidden');
        loadTags();
    }
}

// Todo Functions
async function loadTodos() {
    const searchTerm = document.getElementById('searchTerm').value;
    const filterStatus = document.getElementById('filterStatus').value;
    const filterCategory = document.getElementById('filterCategory').value;
    const filterPriority = document.getElementById('filterPriority').value;
    const sortBy = document.getElementById('sortBy').value;
    const sortDescending = document.getElementById('sortOrder').value;

    const params = new URLSearchParams({
        page: currentPage,
        pageSize,
        sortBy,
        sortDescending
    });

    if (searchTerm) params.append('searchTerm', searchTerm);
    if (filterStatus) params.append('isCompleted', filterStatus);
    if (filterCategory) params.append('categoryId', filterCategory);
    if (filterPriority) params.append('priority', filterPriority);

    const data = await apiCall(`${API.todos}?${params}`);
    if (data) {
        renderTodos(data.items);
        updatePagination(data.page, data.totalPages, data.totalCount);
    }
}

function renderTodos(todos) {
    const todoList = document.getElementById('todoList');

    if (!todos || todos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No todos found. Create one above!</div>';
        return;
    }

    todoList.innerHTML = todos.map(todo => {
        const priorityClass = ['priority-low', 'priority-medium', 'priority-high', 'priority-urgent'][todo.priority];
        const priorityText = ['Low', 'Medium', 'High', 'Urgent'][todo.priority];
        const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && !todo.isCompleted;

        return `
            <li class="todo-item ${todo.isCompleted ? 'completed' : ''} ${priorityClass}">
                <div class="todo-header">
                    <input type="checkbox"
                           class="todo-checkbox"
                           ${todo.isCompleted ? 'checked' : ''}
                           onchange="toggleTodo(${todo.id})">
                    <div class="todo-content">
                        <div class="todo-title">${escapeHtml(todo.title)}</div>
                        ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
                        <div class="todo-meta">
                            <span class="todo-badge badge-${priorityText.toLowerCase()}">${priorityText}</span>
                            ${todo.category ? `<span class="todo-badge badge-category">${escapeHtml(todo.category.name)}</span>` : ''}
                            ${todo.tags && todo.tags.length > 0 ? todo.tags.map(tag =>
                                `<span class="todo-badge badge-tag">${escapeHtml(tag.name)}</span>`
                            ).join('') : ''}
                        </div>
                        ${dueDate ? `<div class="todo-date ${isOverdue ? 'overdue' : ''}">
                            Due: ${dueDate.toLocaleString()}
                            ${isOverdue ? ' (OVERDUE!)' : ''}
                        </div>` : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button onclick="openEditModal(${todo.id})" class="btn-sm btn-success">Edit</button>
                    <button onclick="deleteTodo(${todo.id})" class="btn-sm btn-danger">Delete</button>
                </div>
            </li>
        `;
    }).join('');
}

async function addTodo() {
    const title = document.getElementById('todoTitle').value.trim();
    if (!title) return;

    const description = document.getElementById('todoDescription').value.trim();
    const priority = parseInt(document.getElementById('todoPriority').value);
    const dueDate = document.getElementById('todoDueDate').value;
    const categoryId = document.getElementById('todoCategory').value;

    const todo = {
        title,
        description: description || null,
        priority,
        dueDate: dueDate || null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        isCompleted: false,
        tagIds: selectedTags
    };

    await apiCall(API.todos, {
        method: 'POST',
        body: JSON.stringify(todo)
    });

    // Clear form
    document.getElementById('todoTitle').value = '';
    document.getElementById('todoDescription').value = '';
    document.getElementById('todoPriority').value = '1';
    document.getElementById('todoDueDate').value = '';
    document.getElementById('todoCategory').value = '';
    selectedTags = [];

    loadTodos();
}

async function toggleTodo(id) {
    await apiCall(`${API.todos}/${id}/toggle`, {
        method: 'PATCH'
    });
    loadTodos();
}

async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    await apiCall(`${API.todos}/${id}`, {
        method: 'DELETE'
    });
    loadTodos();
}

async function openEditModal(id) {
    const todo = await apiCall(`${API.todos}/${id}`);
    if (!todo) return;

    editingTodo = todo;

    document.getElementById('editTitle').value = todo.title;
    document.getElementById('editDescription').value = todo.description || '';
    document.getElementById('editPriority').value = todo.priority;
    document.getElementById('editDueDate').value = todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : '';
    document.getElementById('editCategory').value = todo.categoryId || '';

    selectedTags = todo.tags ? todo.tags.map(t => t.id) : [];

    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    editingTodo = null;
}

async function saveEditTodo() {
    if (!editingTodo) return;

    const title = document.getElementById('editTitle').value.trim();
    if (!title) return;

    const description = document.getElementById('editDescription').value.trim();
    const priority = parseInt(document.getElementById('editPriority').value);
    const dueDate = document.getElementById('editDueDate').value;
    const categoryId = document.getElementById('editCategory').value;

    const todo = {
        title,
        description: description || null,
        priority,
        dueDate: dueDate || null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        isCompleted: editingTodo.isCompleted,
        tagIds: selectedTags
    };

    await apiCall(`${API.todos}/${editingTodo.id}`, {
        method: 'PUT',
        body: JSON.stringify(todo)
    });

    closeEditModal();
    loadTodos();
}

// Category Functions
async function loadCategories() {
    const data = await apiCall(API.categories);
    if (data) {
        categories = data;
        renderCategories();
        updateCategorySelects();
    }
}

function renderCategories() {
    const list = document.getElementById('categoryList');

    if (!categories || categories.length === 0) {
        list.innerHTML = '<div class="empty-state">No categories yet. Create one above!</div>';
        return;
    }

    list.innerHTML = categories.map(cat => `
        <div class="category-card" style="--category-color: ${cat.color};">
            <div class="item-header">
                <div class="item-name">${escapeHtml(cat.name)}</div>
                <div class="item-actions">
                    <button onclick="deleteCategory(${cat.id})" class="btn-sm btn-danger">Delete</button>
                </div>
            </div>
            ${cat.description ? `<div>${escapeHtml(cat.description)}</div>` : ''}
        </div>
    `).join('');
}

function updateCategorySelects() {
    const selects = [
        document.getElementById('todoCategory'),
        document.getElementById('filterCategory'),
        document.getElementById('editCategory')
    ];

    selects.forEach(select => {
        const currentValue = select.value;
        const options = categories.map(cat =>
            `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`
        ).join('');

        if (select.id === 'filterCategory') {
            select.innerHTML = '<option value="">All Categories</option>' + options;
        } else {
            select.innerHTML = '<option value="">No Category</option>' + options;
        }

        select.value = currentValue;
    });
}

async function addCategory() {
    const name = document.getElementById('categoryName').value.trim();
    if (!name) return;

    const description = document.getElementById('categoryDescription').value.trim();
    const color = document.getElementById('categoryColor').value;

    await apiCall(API.categories, {
        method: 'POST',
        body: JSON.stringify({
            name,
            description: description || null,
            color
        })
    });

    document.getElementById('categoryName').value = '';
    document.getElementById('categoryDescription').value = '';
    document.getElementById('categoryColor').value = '#3B82F6';

    loadCategories();
}

async function deleteCategory(id) {
    if (!confirm('Delete this category? Todos will not be deleted.')) return;

    await apiCall(`${API.categories}/${id}`, {
        method: 'DELETE'
    });
    loadCategories();
}

// Tag Functions
async function loadTags() {
    const data = await apiCall(API.tags);
    if (data) {
        tags = data;
        renderTags();
    }
}

function renderTags() {
    const list = document.getElementById('tagList');

    if (!tags || tags.length === 0) {
        list.innerHTML = '<div class="empty-state">No tags yet. Create one above!</div>';
        return;
    }

    list.innerHTML = tags.map(tag => `
        <div class="tag-card" style="border-left-color: ${tag.color};">
            <div class="item-header">
                <div class="item-name">${escapeHtml(tag.name)}</div>
                <div class="item-actions">
                    <button onclick="deleteTag(${tag.id})" class="btn-sm btn-danger">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

async function addTag() {
    const name = document.getElementById('tagName').value.trim();
    if (!name) return;

    const color = document.getElementById('tagColor').value;

    await apiCall(API.tags, {
        method: 'POST',
        body: JSON.stringify({ name, color })
    });

    document.getElementById('tagName').value = '';
    document.getElementById('tagColor').value = '#6B7280';

    loadTags();
}

async function deleteTag(id) {
    if (!confirm('Delete this tag? It will be removed from all todos.')) return;

    await apiCall(`${API.tags}/${id}`, {
        method: 'DELETE'
    });
    loadTags();
}

// Tag Selection Modal
function showTagSelector() {
    renderTagCheckboxes();
    document.getElementById('tagModal').classList.remove('hidden');
}

function showEditTagSelector() {
    renderTagCheckboxes();
    document.getElementById('tagModal').classList.remove('hidden');
}

function renderTagCheckboxes() {
    const container = document.getElementById('tagCheckboxes');

    if (!tags || tags.length === 0) {
        container.innerHTML = '<p>No tags available. Create some in the Tags tab!</p>';
        return;
    }

    container.innerHTML = tags.map(tag => `
        <label class="checkbox-label">
            <input type="checkbox"
                   value="${tag.id}"
                   ${selectedTags.includes(tag.id) ? 'checked' : ''}
                   onchange="toggleTagSelection(${tag.id})">
            ${escapeHtml(tag.name)}
        </label>
    `).join('');
}

function toggleTagSelection(tagId) {
    const index = selectedTags.indexOf(tagId);
    if (index > -1) {
        selectedTags.splice(index, 1);
    } else {
        selectedTags.push(tagId);
    }
}

function closeTagModal() {
    document.getElementById('tagModal').classList.add('hidden');
}

// Pagination
function updatePagination(page, pages, total) {
    currentPage = page;
    totalPages = pages;

    document.getElementById('pageInfo').textContent = `Page ${page} of ${pages} (${total} total)`;
    document.getElementById('prevBtn').disabled = page <= 1;
    document.getElementById('nextBtn').disabled = page >= pages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadTodos();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadTodos();
    }
}

// Filters
function applyFilters() {
    currentPage = 1;
    loadTodos();
}

// Utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
