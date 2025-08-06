// Ticket Management System
class TicketManager {
    constructor() {
        this.tickets = this.loadTickets();
        this.initializeEventListeners();
        this.renderTickets();
        this.updateUserInfo();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Form submission
        document.getElementById('ticketForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitTicket();
        });

        // Image upload preview
        document.getElementById('screenshot').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        // Remove image
        document.getElementById('removeImage').addEventListener('click', () => {
            this.removeImage();
        });

        // Status filter
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filterTickets(e.target.value);
        });

        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        // Click outside modal to close
        document.getElementById('successModal').addEventListener('click', (e) => {
            if (e.target.id === 'successModal') {
                this.closeModal();
            }
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    // Submit new ticket
    submitTicket() {
        const form = document.getElementById('ticketForm');
        const formData = new FormData(form);
        
        // Validate required fields
        if (!this.validateForm(formData)) {
            return;
        }

        const ticket = {
            id: Date.now(),
            title: formData.get('title'),
            description: formData.get('description'),
            status: 'pending',
            date: new Date().toLocaleDateString('ar-SA'),
            response: 'قيد المراجعة...',
            screenshot: null
        };

        // Handle screenshot if uploaded
        const screenshotFile = formData.get('screenshot');
        if (screenshotFile && screenshotFile.size > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                ticket.screenshot = e.target.result;
                this.addTicket(ticket);
            };
            reader.readAsDataURL(screenshotFile);
        } else {
            this.addTicket(ticket);
        }
    }

    // Validate form data
    validateForm(formData) {
        const requiredFields = ['title', 'description'];
        
        for (const field of requiredFields) {
            if (!formData.get(field) || formData.get(field).trim() === '') {
                this.showError(`الرجاء ملء جميع الحقول المطلوبة`);
                return false;
            }
        }
        
        return true;
    }

    // Add ticket to storage and update UI
    addTicket(ticket) {
        this.tickets.unshift(ticket);
        this.saveTickets();
        this.renderTickets();
        this.resetForm();
        this.showSuccessModal();
        
        // Simulate status updates
        this.simulateTicketProgress(ticket.id);
    }

    // Handle image upload and preview
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                this.showError('حجم الملف كبير جداً. الحد الأقصى 10MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showError('يرجى اختيار ملف صورة صحيح');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('previewImg').src = e.target.result;
                document.getElementById('imagePreview').classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    }

    // Remove uploaded image
    removeImage() {
        document.getElementById('screenshot').value = '';
        document.getElementById('imagePreview').classList.add('hidden');
    }

    // Reset form after submission
    resetForm() {
        document.getElementById('ticketForm').reset();
        this.removeImage();
    }

    // Show success modal
    showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Animate modal
        setTimeout(() => {
            modal.querySelector('.transform').classList.remove('scale-95');
            modal.querySelector('.transform').classList.add('scale-100');
        }, 10);
    }

    // Close success modal
    closeModal() {
        const modal = document.getElementById('successModal');
        modal.querySelector('.transform').classList.remove('scale-100');
        modal.querySelector('.transform').classList.add('scale-95');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    }

    // Show error message
    showError(message) {
        // Create and show temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-x-full';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Animate in
        setTimeout(() => {
            errorDiv.classList.remove('translate-x-full');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            errorDiv.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 300);
        }, 3000);
    }

    // Filter tickets by status
    filterTickets(status) {
        const filteredTickets = status ? this.tickets.filter(ticket => ticket.status === status) : this.tickets;
        this.renderTickets(filteredTickets);
    }

    // Render tickets table
    renderTickets(ticketsToRender = this.tickets) {
        const tbody = document.getElementById('ticketsTableBody');
        const noTicketsDiv = document.getElementById('noTickets');
        
        if (ticketsToRender.length === 0) {
            tbody.innerHTML = '';
            noTicketsDiv.style.display = 'block';
            return;
        }
        
        noTicketsDiv.style.display = 'none';
        
        tbody.innerHTML = ticketsToRender.map(ticket => `
            <tr class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div>
                            <div class="text-sm font-medium text-gray-900">${ticket.title}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${ticket.date}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 text-xs font-medium rounded-full status-${ticket.status}">
                        ${this.getStatusText(ticket.status)}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    ${ticket.response}
                </td>
            </tr>
        `).join('');
    }

    // Get priority CSS class
    getPriorityClass(priority) {
        const classes = {
            'low': 'bg-gray-100 text-gray-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'high': 'bg-orange-100 text-orange-800',
            'urgent': 'bg-red-100 text-red-800'
        };
        return classes[priority] || classes.low;
    }

    // Get priority text in Arabic
    getPriorityText(priority) {
        const texts = {
            'low': 'منخفضة',
            'medium': 'متوسطة',
            'high': 'عالية',
            'urgent': 'عاجلة'
        };
        return texts[priority] || 'منخفضة';
    }

    // Get status text in Arabic
    getStatusText(status) {
        const texts = {
            'pending': 'قيد الانتظار',
            'in-progress': 'قيد المعالجة',
            'resolved': 'تم الحل',
            'closed': 'مغلقة'
        };
        return texts[status] || 'قيد الانتظار';
    }

    // Simulate ticket progress for demo purposes
    simulateTicketProgress(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        // After 3 seconds, change to in-progress
        setTimeout(() => {
            ticket.status = 'in-progress';
            ticket.response = 'جاري العمل على حل المشكلة...';
            this.saveTickets();
            this.renderTickets();
        }, 3000);

        // After 8 seconds, change to resolved
        setTimeout(() => {
            ticket.status = 'resolved';
            ticket.response = 'تم حل المشكلة بنجاح. شكراً لتواصلك معنا.';
            this.saveTickets();
            this.renderTickets();
        }, 8000);
    }

    // Load tickets from localStorage
    loadTickets() {
        const stored = localStorage.getItem('supportTickets');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Return sample data if no tickets exist
        return [
            {
                id: 1,
                title: 'مشكلة في تسجيل الدخول',
                priority: 'high',
                category: 'account',
                description: 'لا أستطيع تسجيل الدخول إلى حسابي',
                status: 'resolved',
                date: new Date(Date.now() - 86400000).toLocaleDateString('ar-SA'),
                response: 'تم إعادة تعيين كلمة المرور وحل المشكلة'
            },
            {
                id: 2,
                title: 'بطء في تحميل الصفحات',
                priority: 'medium',
                category: 'technical',
                description: 'الموقع يحمل ببطء شديد',
                status: 'in-progress',
                date: new Date(Date.now() - 43200000).toLocaleDateString('ar-SA'),
                response: 'جاري فحص المشكلة مع فريق التقنية'
            }
        ];
    }

    // Save tickets to localStorage
    saveTickets() {
        localStorage.setItem('supportTickets', JSON.stringify(this.tickets));
    }

    // Handle logout
    handleLogout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            // Clear user data from localStorage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userToken');
            
            // Show logout message
            this.showNotification('تم تسجيل الخروج بنجاح', 'success');
            
            // Redirect to login page after delay
            setTimeout(() => {
                window.location.href = 'login.html'; // أو أي صفحة login أخرى
            }, 1500);
        }
    }

    // Update user name in header
    updateUserInfo() {
        const currentUser = this.getCurrentUser();
        const userNameElement = document.getElementById('userName');
        const avatarElement = document.querySelector('.w-10.h-10');
        
        if (currentUser) {
            userNameElement.textContent = currentUser.name;
            // Update avatar with first letter of name
            avatarElement.textContent = currentUser.name.charAt(0);
        }
    }

    // Get current user from localStorage or default
    getCurrentUser() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            return JSON.parse(storedUser);
        }
        
        // Default user if none stored
        return {
            name: 'أحمد محمد',
            email: 'ahmed@example.com',
            id: 1
        };
    }

    // Set current user
    setCurrentUser(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        this.updateUserInfo();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicketManager();
    
    // Add fade-in animation to elements
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // تم حذف تأثير التكبير من الـ inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    // تم إزالة الـ focus و blur event listeners اللي كانت بتكبر الـ fields
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    button {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);