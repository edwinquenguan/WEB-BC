document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // ==========================================
    // USER AUTHENTICATION & STATE STORAGE
    // ==========================================
    let currentUser = null;

    

    // Modal elements for Auth
    const authModal = document.getElementById('authModal');
    const loginNavBtn = document.getElementById('loginNavBtn');
    const registerNavBtn = document.getElementById('registerNavBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');
    const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
    
    // Auth Forms and Tab Switchers
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const registerFormContainer = document.getElementById('registerFormContainer');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Dashboard modal elements
    const dashboardModal = document.getElementById('dashboardModal');
    const dashboardToggleBtn = document.getElementById('dashboardToggleBtn');
    const mobileDashboardBtn = document.getElementById('mobileDashboardBtn');
    const closeDashboardModalBtn = document.getElementById('closeDashboardModalBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    const addFundsBtn = document.getElementById('addFundsBtn');

    // UI profile components
    const authNavGroup = document.getElementById('authNavGroup');
    const userBadgeGroup = document.getElementById('userBadgeGroup');
    const navUsername = document.getElementById('navUsername');
    const mobileAuthGroup = document.getElementById('mobileAuthGroup');
    const mobileUserBadge = document.getElementById('mobileUserBadge');
    const mobileUsername = document.getElementById('mobileUsername');
    
    // General alert modal
    const alertModal = document.getElementById('alertModal');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertIconContainer = document.getElementById('alertIconContainer');
    const alertIcon = document.getElementById('alertIcon');
    const closeAlertModalBtn = document.getElementById('closeAlertModalBtn');

    // ==========================================
    // AUTH MODAL TOGGLES
    // ==========================================
    function openAuthModal(defaultTab = 'login') {
        authModal.classList.add('open');
        switchAuthTab(defaultTab);
    }

    function closeAuthModal() {
        authModal.classList.remove('open');
        loginForm.reset();
        registerForm.reset();
    }

    function switchAuthTab(tab) {
        if (tab === 'login') {
            tabLoginBtn.classList.add('active');
            tabRegisterBtn.classList.remove('active');
            loginFormContainer.classList.remove('hidden');
            registerFormContainer.classList.add('hidden');
        } else {
            tabLoginBtn.classList.remove('active');
            tabRegisterBtn.classList.add('active');
            loginFormContainer.classList.add('hidden');
            registerFormContainer.classList.remove('hidden');
        }
    }

    if (loginNavBtn) loginNavBtn.addEventListener('click', () => openAuthModal('login'));
    if (registerNavBtn) registerNavBtn.addEventListener('click', () => openAuthModal('register'));
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', () => { mobileMenu.classList.remove('open'); openAuthModal('login'); });
    if (mobileRegisterBtn) mobileRegisterBtn.addEventListener('click', () => { mobileMenu.classList.remove('open'); openAuthModal('register'); });
    if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', closeAuthModal);
    
    if (tabLoginBtn) tabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
    if (tabRegisterBtn) tabRegisterBtn.addEventListener('click', () => switchAuthTab('register'));

    // ==========================================
    // REGISTRATION AND LOGIN LOGIC
    // ==========================================
    function getStoredUsers() {
        const users = localStorage.getItem('gcc_users');
        return users ? JSON.parse(users) : {};
    }

    function saveUserToDatabase(user) {
        const users = getStoredUsers();
        users[user.email] = user;
        localStorage.setItem('gcc_users', JSON.stringify(users));
    }

    // Register Submit
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            const users = getStoredUsers();
            if (users[email]) {
                showToast('Error', 'Este correo ya se encuentra registrado. Intenta iniciar sesión.', 'error');
                return;
            }

            // Create new user profile with $50,000 COP free gift balance!
            const newUser = {
                name: name,
                email: email,
                password: password,
                balance: 50000,
                reservations: [],
                tournaments: []
            };

            saveUserToDatabase(newUser);
            
            // Login user
            currentUser = newUser;
            localStorage.setItem('gcc_session', JSON.stringify(currentUser));
            
            closeAuthModal();
            updateUserUI();
            
            showToast('¡Registro Exitoso!', `Bienvenido, <strong>${name}</strong>. Te hemos obsequiado un saldo promocional de <strong>$50.000 COP</strong> para apartar tus mesas.`, 'success');
        });
    }

    // Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const users = getStoredUsers();
            const user = users[email];

            if (!user || user.password !== password) {
                showToast('Error de Ingreso', 'Correo o contraseña incorrectos. Por favor verifica tus datos.', 'error');
                return;
            }

            currentUser = user;
            localStorage.setItem('gcc_session', JSON.stringify(currentUser));
            
            closeAuthModal();
            updateUserUI();
            
            showToast('¡Bienvenido!', `Hola de nuevo, <strong>${currentUser.name}</strong>. Has ingresado a tu cuenta.`, 'success');
        });
    }

    // Logout
    function logoutUser() {
        currentUser = null;
        localStorage.removeItem('gcc_session');
        updateUserUI();
        
        // Close modals
        dashboardModal.classList.remove('open');
        
        // Reset booking tables selections
        poolTables.forEach(t => t.classList.remove('selected'));
        if (bookingPanel) {
            bookingPanel.classList.add('disabled');
            emptyPanelState.classList.remove('hidden');
            panelContent.classList.add('hidden');
        }
        
        showToast('Sesión Cerrada', 'Has cerrado tu sesión con éxito. ¡Vuelve pronto!', 'success');
    }

    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', () => { mobileMenu.classList.remove('open'); logoutUser(); });

    // Cargar saldo virtual (Add funds simulator)
    if (addFundsBtn) {
        addFundsBtn.addEventListener('click', () => {
            if (!currentUser) return;
            currentUser.balance += 20000;
            saveUserToDatabase(currentUser);
            localStorage.setItem('gcc_session', JSON.stringify(currentUser));
            updateUserUI();
            showToast('Saldo Cargado', 'Se han cargado $20.000 COP simulados a tu monedero virtual con éxito.', 'success');
        });
    }

    // ==========================================
    // UI RE-RENDERING UPON LOGIN STATE
    // ==========================================
    function updateUserUI() {
        if (currentUser) {
            // Navbar toggling
            if (authNavGroup) authNavGroup.classList.add('hidden');
            if (userBadgeGroup) userBadgeGroup.classList.remove('hidden');
            if (navUsername) navUsername.textContent = currentUser.name.split(' ')[0];
            
            // Mobile navigation toggling
            if (mobileAuthGroup) mobileAuthGroup.classList.add('hidden');
            if (mobileUserBadge) mobileUserBadge.classList.remove('hidden');
            if (mobileUsername) mobileUsername.textContent = currentUser.name.split(' ')[0];
            
            // Sync current user database changes (in case reservations list grew etc)
            const dbUsers = getStoredUsers();
            if (dbUsers[currentUser.email]) {
                currentUser = dbUsers[currentUser.email];
                localStorage.setItem('gcc_session', JSON.stringify(currentUser));
            }
            
            // Render Dashboard lists
            renderDashboard();
        } else {
            // Navbar toggling
            if (authNavGroup) authNavGroup.classList.remove('hidden');
            if (userBadgeGroup) userBadgeGroup.classList.add('hidden');
            
            // Mobile navigation toggling
            if (mobileAuthGroup) mobileAuthGroup.classList.remove('hidden');
            if (mobileUserBadge) mobileUserBadge.classList.add('hidden');
        }
    }

    function renderDashboard() {
        if (!currentUser) return;

        // Header info
        document.getElementById('dbUsername').textContent = currentUser.name;
        document.getElementById('dbBalance').textContent = formatCOP(currentUser.balance);

        // Render Booking list
        const dbReservationsList = document.getElementById('dbReservationsList');
        dbReservationsList.innerHTML = '';
        
        if (currentUser.reservations.length === 0) {
            dbReservationsList.innerHTML = '<div class="db-empty-list">No tienes reservas activas.</div>';
        } else {
            currentUser.reservations.forEach(res => {
                const item = document.createElement('div');
                item.className = 'db-list-item';
                item.innerHTML = `
                    <div class="db-item-info">
                        <span class="db-item-title">${res.tableName} (${res.tableType})</span>
                        <span class="db-item-sub">${res.dateTime} - ${res.duration}</span>
                    </div>
                    <div>
                        <span class="db-item-price mr-2">${formatCOP(res.price)}</span>
                        <button class="btn-cancel" data-id="${res.id}">Cancelar</button>
                    </div>
                `;
                dbReservationsList.appendChild(item);
            });

            // Cancel Booking click events
            dbReservationsList.querySelectorAll('.btn-cancel').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const bookingId = e.target.dataset.id;
                    cancelBooking(bookingId);
                });
            });
        }

        // Render Tournaments list
        const dbTournamentsList = document.getElementById('dbTournamentsList');
        dbTournamentsList.innerHTML = '';

        if (currentUser.tournaments.length === 0) {
            dbTournamentsList.innerHTML = '<div class="db-empty-list">No te has inscrito en ningún torneo aún.</div>';
        } else {
            currentUser.tournaments.forEach(t => {
                const item = document.createElement('div');
                item.className = 'db-list-item';
                item.innerHTML = `
                    <div class="db-item-info">
                        <span class="db-item-title">${t.tournamentName}</span>
                        <span class="db-item-sub">${t.level} - Habilidad</span>
                    </div>
                    <div>
                        <span class="db-item-price mr-2">${formatCOP(t.fee)}</span>
                        <span class="badge" style="border-color:var(--neon-green);color:var(--neon-green);background:rgba(16,185,129,0.1)">Inscrito</span>
                    </div>
                `;
                dbTournamentsList.appendChild(item);
            });
        }
    }

    // Toggle Dashboard Dialog
    if (dashboardToggleBtn) {
        dashboardToggleBtn.addEventListener('click', () => {
            dashboardModal.classList.add('open');
            renderDashboard();
        });
    }

    if (mobileDashboardBtn) {
        mobileDashboardBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            dashboardModal.classList.add('open');
            renderDashboard();
        });
    }

    if (closeDashboardModalBtn) {
        closeDashboardModalBtn.addEventListener('click', () => {
            dashboardModal.classList.remove('open');
        });
    }

    // Cancel Booking event handler
    function cancelBooking(id) {
        if (!currentUser) return;
        
        const bookingIndex = currentUser.reservations.findIndex(r => r.id === id);
        if (bookingIndex === -1) return;

        const booking = currentUser.reservations[bookingIndex];
        
        // Return 80% refund or full refund. Let's do 100% full refund for the mock app
        currentUser.balance += booking.price;
        
        // Remove booking
        currentUser.reservations.splice(bookingIndex, 1);
        
        // Save
        saveUserToDatabase(currentUser);
        localStorage.setItem('gcc_session', JSON.stringify(currentUser));
        
        updateUserUI();
        showToast('Reserva Cancelada', `Tu reserva ha sido cancelada. Se han reembolsado <strong>${formatCOP(booking.price)}</strong> a tu saldo.`, 'success');
    }

    // ==========================================
    // MOBILE MENU SYSTEM
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const menuClose = document.getElementById('menuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('open');
        });
    }

    if (menuClose && mobileMenu) {
        menuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
    });

    // Sticky nav active link updating on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 120)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // ==========================================
    // INTERACTIVE TABLE BOOKING CALCULATIONS
    // ==========================================
    const poolTables = document.querySelectorAll('.pool-table-item');
    const bookingPanel = document.getElementById('bookingPanel');
    const emptyPanelState = document.getElementById('emptyPanelState');
    const panelContent = document.getElementById('panelContent');
    
    const panelTableType = document.getElementById('panelTableType');
    const panelTableName = document.getElementById('panelTableName');
    const baseRatePerHour = document.getElementById('baseRatePerHour');
    
    // Form fields
    const bookingDate = document.getElementById('bookingDate');
    const bookingTime = document.getElementById('bookingTime');
    const bookingDuration = document.getElementById('bookingDuration');
    const durationValue = document.getElementById('durationValue');
    const optCues = document.getElementById('optCues');
    const optDrinks = document.getElementById('optDrinks');
    
    // Price summaries
    const summaryBasePrice = document.getElementById('summaryBasePrice');
    const extraCuesRow = document.getElementById('extraCuesRow');
    const summaryCuesPrice = document.getElementById('summaryCuesPrice');
    const extraDrinksRow = document.getElementById('extraDrinksRow');
    const summaryDrinksPrice = document.getElementById('summaryDrinksPrice');
    const summaryTotalPrice = document.getElementById('summaryTotalPrice');
    const bookingForm = document.getElementById('bookingForm');

    // Modals
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingModalBtn = document.getElementById('closeBookingModalBtn');
    const ticketTable = document.getElementById('ticketTable');
    const ticketDateTime = document.getElementById('ticketDateTime');
    const ticketDuration = document.getElementById('ticketDuration');
    const ticketCode = document.getElementById('ticketCode');
    const ticketTotal = document.getElementById('ticketTotal');

    // State Variables
    let selectedTable = null;
    let selectedBasePrice = 0;
    let computedTotalValue = 0;

    // Set today as minimum booking date
    if (bookingDate) {
        const today = new Date().toISOString().split('T')[0];
        bookingDate.min = today;
        bookingDate.value = today;
    }

    // Set default booking time to current hour or next
    if (bookingTime) {
        const now = new Date();
        let hours = String(now.getHours() + 1).padStart(2, '0');
        if (parseInt(hours) >= 24) hours = '12';
        bookingTime.value = `${hours}:00`;
    }

    // Table Click Selection
    poolTables.forEach(table => {
        table.addEventListener('click', () => {
            if (table.classList.contains('occupied')) {
                return;
            }

            // Remove selected state from previous
            poolTables.forEach(t => t.classList.remove('selected'));

            // Select current
            table.classList.add('selected');
            selectedTable = {
                id: table.dataset.id,
                name: table.querySelector('.table-label').textContent,
                type: table.dataset.type,
                price: parseFloat(table.dataset.price)
            };
            selectedBasePrice = selectedTable.price;

            // Update sidebar content
            bookingPanel.classList.remove('disabled');
            emptyPanelState.classList.add('hidden');
            panelContent.classList.remove('hidden');

            panelTableName.textContent = selectedTable.name;
            panelTableType.textContent = selectedTable.type;
            baseRatePerHour.textContent = `${formatCOP(selectedTable.price)}/h`;
            
            // Adjust VIP or type colors
            if (selectedTable.type.includes('Pool')) {
                panelTableType.style.borderColor = 'var(--neon-pink)';
                panelTableType.style.color = 'var(--neon-pink)';
                panelTableType.style.background = 'rgba(225, 29, 72, 0.1)';
            } else {
                panelTableType.style.borderColor = 'var(--neon-blue)';
                panelTableType.style.color = 'var(--neon-blue)';
                panelTableType.style.background = 'rgba(217, 119, 6, 0.1)';
            }

            calculateBookingPrice();
        });
    });

    // Handle duration range input
    if (bookingDuration) {
        bookingDuration.addEventListener('input', (e) => {
            const val = e.target.value;
            durationValue.textContent = `${val} ${val == 1 ? 'hora' : 'horas'}`;
            calculateBookingPrice();
        });
    }

    // Checkbox triggers
    if (optCues) optCues.addEventListener('change', calculateBookingPrice);
    if (optDrinks) optDrinks.addEventListener('change', calculateBookingPrice);

    function calculateBookingPrice() {
        if (!selectedTable) return;

        const duration = parseInt(bookingDuration.value);
        const baseTotal = selectedBasePrice * duration;
        
        let extraCues = 0;
        let extraDrinks = 0;

        // Show/hide and calculate extras
        if (optCues && optCues.checked) {
            extraCues = 5000 * duration;
            extraCuesRow.classList.remove('hidden');
            summaryCuesPrice.textContent = `${formatCOP(extraCues)}`;
        } else {
            extraCuesRow.classList.add('hidden');
        }

        if (optDrinks && optDrinks.checked) {
            extraDrinks = 10000; // fixed bar fee
            extraDrinksRow.classList.remove('hidden');
            summaryDrinksPrice.textContent = `${formatCOP(extraDrinks)}`;
        } else {
            extraDrinksRow.classList.add('hidden');
        }

        computedTotalValue = baseTotal + extraCues + extraDrinks;

        summaryBasePrice.textContent = `${formatCOP(baseTotal)}`;
        summaryTotalPrice.textContent = `${formatCOP(computedTotalValue)}`;
    }

    // Booking Form Submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 1. Check if user is logged in
            if (!currentUser) {
                openAuthModal('login');
                showToast('Ingresa a tu Cuenta', 'Por favor inicia sesión o crea una cuenta para poder apartar una mesa.', 'error');
                return;
            }

            // 2. Check if user has enough balance
            if (currentUser.balance < computedTotalValue) {
                showToast('Saldo Insuficiente', `Tu saldo actual es de <strong>${formatCOP(currentUser.balance)}</strong>, pero la reserva cuesta <strong>${formatCOP(computedTotalValue)}</strong>. Carga fondos en tu panel de usuario.`, 'error');
                return;
            }

            // 3. Deduct balance and create reservation
            currentUser.balance -= computedTotalValue;
            
            const rawDate = bookingDate.value;
            const rawTime = bookingTime.value;
            const dateObj = new Date(`${rawDate}T${rawTime}`);
            const formattedDate = dateObj.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const randomCode = 'GCC-' + Math.floor(10000 + Math.random() * 90000);
            
            const newRes = {
                id: randomCode,
                tableName: selectedTable.name,
                tableType: selectedTable.type,
                dateTime: formattedDate,
                duration: `${bookingDuration.value} ${bookingDuration.value == 1 ? 'hora' : 'horas'}`,
                price: computedTotalValue
            };

            currentUser.reservations.push(newRes);
            
            // Save state
            saveUserToDatabase(currentUser);
            localStorage.setItem('gcc_session', JSON.stringify(currentUser));
            updateUserUI();

            // Set ticket values in modal
            ticketTable.textContent = `${selectedTable.name} (${selectedTable.type})`;
            ticketDateTime.textContent = formattedDate;
            ticketDuration.textContent = newRes.duration;
            ticketCode.textContent = randomCode;
            ticketTotal.textContent = formatCOP(computedTotalValue);

            // Open Modal
            bookingModal.classList.add('open');
        });
    }

    // Close booking modal
    if (closeBookingModalBtn) {
        closeBookingModalBtn.addEventListener('click', () => {
            bookingModal.classList.remove('open');
            // Reset Booking Form
            bookingForm.reset();
            if (bookingDuration) {
                bookingDuration.value = 1;
                durationValue.textContent = '1 hora';
            }
            if (optCues) extraCuesRow.classList.add('hidden');
            if (optDrinks) extraDrinksRow.classList.add('hidden');
            
            // Deselect tables
            poolTables.forEach(t => t.classList.remove('selected'));
            selectedTable = null;
            
            // Reset panel state
            bookingPanel.classList.add('disabled');
            emptyPanelState.classList.remove('hidden');
            panelContent.classList.add('hidden');
        });
    }

    // ==========================================
    // MENU BAR TAB & CART SIMULATOR
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const menuItemCards = document.querySelectorAll('.menu-item-card');
    const orderSummaryBar = document.getElementById('orderSummaryBar');
    const cartTotalQty = document.getElementById('cartTotalQty');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Cart memory
    let cart = {};

    // Tab filtering
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.category;
            menuItemCards.forEach(card => {
                if (card.dataset.category === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Cart Button handlers (+ and -)
    const plusBtns = document.querySelectorAll('.btn-plus');
    const minusBtns = document.querySelectorAll('.btn-minus');

    plusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const card = btn.closest('.menu-item-card');
            const title = card.querySelector('.menu-item-title').textContent;
            
            // Parse price cleanly removing '$' and '.000'
            const rawPrice = card.querySelector('.menu-item-price').textContent;
            const price = parseFloat(rawPrice.replace('$', '').replace(/\./g, ''));

            if (!cart[id]) {
                cart[id] = { qty: 0, title: title, price: price };
            }
            cart[id].qty += 1;
            
            document.getElementById(`qty-${id}`).textContent = cart[id].qty;
            updateCartSummary();
        });
    });

    minusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            if (!cart[id] || cart[id].qty === 0) return;

            cart[id].qty -= 1;
            document.getElementById(`qty-${id}`).textContent = cart[id].qty;

            if (cart[id].qty === 0) {
                delete cart[id];
            }
            updateCartSummary();
        });
    });

    function updateCartSummary() {
        let totalItems = 0;
        let totalPrice = 0;

        for (const item in cart) {
            totalItems += cart[item].qty;
            totalPrice += cart[item].qty * cart[item].price;
        }

        if (totalItems > 0) {
            cartTotalQty.textContent = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;
            cartTotalPrice.textContent = `${formatCOP(totalPrice)}`;
            orderSummaryBar.classList.add('show');
        } else {
            orderSummaryBar.classList.remove('show');
        }
    }

    // Clear cart handler
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = {};
            document.querySelectorAll('.item-qty').forEach(qtyText => {
                qtyText.textContent = '0';
            });
            updateCartSummary();
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            let orderListText = '';
            let total = 0;

            for (const key in cart) {
                const item = cart[key];
                orderListText += `- ${item.qty}x ${item.title} (${formatCOP(item.price * item.qty)})<br>`;
                total += item.price * item.qty;
            }

            showToast('¡Pedido Recibido!', `Hemos registrado tu pedido en la barra:<br><br>${orderListText}<br><strong>Total estimado: ${formatCOP(total)}</strong><br><br>Un camarero de Billares Colpatria servirá estos consumos directamente a tu mesa.`, 'success');

            // Reset cart
            clearCartBtn.click();
        });
    }

    // ==========================================
    // TOURNAMENT SIGN-UP LOGIC
    // ==========================================
    const tBtns = document.querySelectorAll('.t-btn');
    const tournamentModal = document.getElementById('tournamentModal');
    const closeTournamentModalBtn = document.getElementById('closeTournamentModalBtn');
    const modalTournamentName = document.getElementById('modalTournamentName');
    const tModalFee = document.getElementById('tModalFee');
    const tournamentForm = document.getElementById('tournamentForm');
    
    let activeTournamentData = null;

    tBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Check auth state
            if (!currentUser) {
                openAuthModal('login');
                showToast('Ingresa a tu Cuenta', 'Por favor inicia sesión o crea una cuenta para inscribirte a los torneos.', 'error');
                return;
            }

            const tournamentName = btn.dataset.tournament;
            const fee = parseFloat(btn.dataset.fee);

            activeTournamentData = { name: tournamentName, fee: fee };

            // Fill form fields
            document.getElementById('tPlayerName').value = currentUser.name;
            modalTournamentName.textContent = tournamentName;
            tModalFee.textContent = `${formatCOP(fee)}`;
            
            tournamentModal.classList.add('open');
        });
    });

    if (closeTournamentModalBtn) {
        closeTournamentModalBtn.addEventListener('click', () => {
            tournamentModal.classList.remove('open');
            tournamentForm.reset();
            activeTournamentData = null;
        });
    }

    if (tournamentForm) {
        tournamentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser || !activeTournamentData) return;

            // Check balance
            if (currentUser.balance < activeTournamentData.fee) {
                showToast('Saldo Insuficiente', `Tu saldo actual de <strong>${formatCOP(currentUser.balance)}</strong> es insuficiente para la inscripción de <strong>${formatCOP(activeTournamentData.fee)}</strong>. Carga fondos en tu panel.`, 'error');
                return;
            }

            // Deduct balance and add tournament inscription
            currentUser.balance -= activeTournamentData.fee;
            
            const newT = {
                tournamentName: activeTournamentData.name,
                fee: activeTournamentData.fee,
                level: document.getElementById('tLevel').value
            };

            currentUser.tournaments.push(newT);

            // Save state
            saveUserToDatabase(currentUser);
            localStorage.setItem('gcc_session', JSON.stringify(currentUser));
            updateUserUI();

            tournamentModal.classList.remove('open');
            tournamentForm.reset();

            // Open Alert success modal
            showToast('¡Inscripción Exitosa!', `Felicidades, te has inscrito con éxito en <strong>${newT.tournamentName}</strong>.<br><br>Se han descontado <strong>${formatCOP(newT.fee)}</strong> de tu saldo virtual de socio.`, 'success');
        });
    }

    // ==========================================
    // OTHER FORM SUBMISSIONS
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const newsletterForm = document.getElementById('newsletterForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName').value;
            showToast('¡Mensaje Enviado!', `Gracias por contactarnos, <strong>${name}</strong>. Hemos recibido tu mensaje de forma exitosa.<br><br>Te responderemos por correo electrónico en un lapso de 24 horas.`, 'success');
            contactForm.reset();
        });
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;
            showToast('¡Suscripción Completa!', `Tu correo <strong>${email}</strong> ha sido agregado a nuestra lista de novedades sobre torneos de Billares Colpatria.`, 'success');
            emailInput.value = '';
        });
    }

    // Close modals on clicking backdrop
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
                if (modal.id === 'tournamentModal') tournamentForm.reset();
            }
        });
    });

    if (closeAlertModalBtn) {
        closeAlertModalBtn.addEventListener('click', () => {
            alertModal.classList.remove('open');
        });
    }

    // ==========================================
    // HELPER UTILITY FUNCTIONS
    // ==========================================
    function formatCOP(number) {
        return '$' + new Intl.NumberFormat('de-DE').format(number) + ' COP';
    }

    function showToast(title, message, type = 'success') {
        alertTitle.innerHTML = title;
        alertMessage.innerHTML = message;
        
        // Customize icon based on type
        alertIconContainer.className = 'success-icon-container';
        if (type === 'success') {
            alertIconContainer.style.background = 'rgba(16, 185, 129, 0.1)';
            alertIcon.setAttribute('data-lucide', 'party-popper');
            alertIcon.style.color = 'var(--neon-green)';
        } else {
            alertIconContainer.style.background = 'rgba(239, 68, 68, 0.1)';
            alertIcon.setAttribute('data-lucide', 'alert-triangle');
            alertIcon.style.color = 'var(--neon-red)';
        }
        
        // Re-trigger lucide icons inside the modal
        lucide.createIcons();
        
        alertModal.classList.add('open');
    }

    const savedSession = localStorage.getItem('gcc_session');

if (savedSession) {
    try {
        currentUser = JSON.parse(savedSession);
        updateUserUI();
    } catch (error) {
        console.error('Error cargando sesión:', error);
        localStorage.removeItem('gcc_session');
    }
}
});
