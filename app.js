// OpenStack GUI Application
class OpenStackApp {
    constructor() {
        this.authToken = null;
        this.authUrl = null;
        this.userId = null;
        this.projectId = null;
        this.username = null;
        this.projectName = null;
        this.novaUrl = null;
        this.glanceUrl = null;
        this.config = window.CONFIG || {};
        this.autoRefreshTimer = null;
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.prefillLoginForm();
        this.checkAuthStatus();
    }

    // Logging helper per debug
    log(...args) {
        if (this.config.DEBUG_MODE) {
            console.log('[OpenStack GUI]', ...args);
        }
    }

    // Pre-compila il form di login con i valori di default
    prefillLoginForm() {
        if (this.config.PREFILL_LOGIN_FORM) {
            if (this.config.KEYSTONE_ENDPOINT) {
                document.getElementById('auth-url').value = this.config.KEYSTONE_ENDPOINT;
            }
            if (this.config.DEFAULT_DOMAIN) {
                document.getElementById('domain').value = this.config.DEFAULT_DOMAIN;
            }
            if (this.config.DEFAULT_PROJECT) {
                document.getElementById('project').value = this.config.DEFAULT_PROJECT;
            }
        }
    }

    attachEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!e.target.classList.contains('logout-btn')) {
                    this.switchSection(e.target.dataset.section);
                }
            });
        });

        // Create instance button
        document.getElementById('create-instance-btn').addEventListener('click', () => {
            this.openModal('create-instance-modal');
            this.loadFlavors();
            this.loadImagesForInstanceCreation();
        });

        // Upload image button
        document.getElementById('upload-image-btn').addEventListener('click', () => {
            this.openModal('upload-image-modal');
        });

        // Create instance form
        document.getElementById('create-instance-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createInstance();
        });

        // Upload image form
        document.getElementById('upload-image-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadImage();
        });

        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modal;
                this.closeModal(modalId);
            });
        });

        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        if (token) {
            this.authToken = token;
            this.authUrl = localStorage.getItem('authUrl');
            this.userId = localStorage.getItem('userId');
            this.projectId = localStorage.getItem('projectId');
            this.username = localStorage.getItem('username');
            this.projectName = localStorage.getItem('projectName');
            this.novaUrl = localStorage.getItem('novaUrl');
            this.glanceUrl = localStorage.getItem('glanceUrl');
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    async login() {
        const authUrl = document.getElementById('auth-url').value;
        const domain = document.getElementById('domain').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const project = document.getElementById('project').value;

        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = '';
        errorDiv.classList.remove('active');

        try {
            const authPayload = {
                auth: {
                    identity: {
                        methods: ['password'],
                        password: {
                            user: {
                                name: username,
                                domain: { name: domain },
                                password: password
                            }
                        }
                    },
                    scope: {
                        project: {
                            name: project,
                            domain: { name: domain }
                        }
                    }
                }
            };

            const response = await this.fetch(`${authUrl}/auth/tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(authPayload)
            });

            if (!response.ok) {
                throw new Error('Autenticazione fallita. Verifica le credenziali.');
            }

            const token = response.headers.get('X-Subject-Token');
            const data = await response.json();

            this.authToken = token;
            this.authUrl = authUrl;
            this.userId = data.token.user.id;
            this.projectId = data.token.project.id;
            this.username = username;
            this.projectName = project;

            // Get service endpoints
            const endpointType = this.config.ENDPOINT_TYPE || 'public';
            this.log('Using endpoint type:', endpointType);

            // Check for manual endpoint overrides first
            if (this.config.NOVA_ENDPOINT_OVERRIDE) {
                this.novaUrl = this.config.NOVA_ENDPOINT_OVERRIDE;
                this.log('Using Nova endpoint override:', this.novaUrl);
            } else {
                const catalog = data.token.catalog;
                const novaService = catalog.find(s => s.type === 'compute');
                if (novaService) {
                    const endpoint = novaService.endpoints.find(e => e.interface === endpointType);
                    if (endpoint) {
                        this.novaUrl = endpoint.url;
                        this.log('Nova endpoint from catalog:', this.novaUrl);
                    } else {
                        console.warn(`No ${endpointType} endpoint found for Nova, falling back to public`);
                        const fallback = novaService.endpoints.find(e => e.interface === 'public');
                        if (fallback) this.novaUrl = fallback.url;
                    }
                }
            }

            if (this.config.GLANCE_ENDPOINT_OVERRIDE) {
                this.glanceUrl = this.config.GLANCE_ENDPOINT_OVERRIDE;
                this.log('Using Glance endpoint override:', this.glanceUrl);
            } else {
                const catalog = data.token.catalog;
                const glanceService = catalog.find(s => s.type === 'image');
                if (glanceService) {
                    const endpoint = glanceService.endpoints.find(e => e.interface === endpointType);
                    if (endpoint) {
                        this.glanceUrl = endpoint.url;
                        this.log('Glance endpoint from catalog:', this.glanceUrl);
                    } else {
                        console.warn(`No ${endpointType} endpoint found for Glance, falling back to public`);
                        const fallback = glanceService.endpoints.find(e => e.interface === 'public');
                        if (fallback) this.glanceUrl = fallback.url;
                    }
                }
            }

            // Store in localStorage
            localStorage.setItem('authToken', this.authToken);
            localStorage.setItem('authUrl', this.authUrl);
            localStorage.setItem('userId', this.userId);
            localStorage.setItem('projectId', this.projectId);
            localStorage.setItem('username', this.username);
            localStorage.setItem('projectName', this.projectName);
            localStorage.setItem('novaUrl', this.novaUrl);
            localStorage.setItem('glanceUrl', this.glanceUrl);

            this.showDashboard();

        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.add('active');
        }
    }

    logout() {
        localStorage.clear();
        this.authToken = null;
        this.showLogin();
    }

    showLogin() {
        document.getElementById('login-section').classList.add('active');
        document.getElementById('dashboard-section').classList.remove('active');
    }

    showDashboard() {
        document.getElementById('login-section').classList.remove('active');
        document.getElementById('dashboard-section').classList.add('active');

        document.getElementById('current-user').textContent = `User: ${this.username}`;
        document.getElementById('current-project').textContent = `Project: ${this.projectName}`;

        this.loadInstances();
    }

    switchSection(section) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });

        if (section === 'compute') {
            document.getElementById('compute-section').classList.add('active');
            this.loadInstances();
        } else if (section === 'images') {
            document.getElementById('images-section').classList.add('active');
            this.loadImages();
        }
    }

    // Nova (Compute) Functions
    async loadInstances() {
        const container = document.getElementById('instances-list');
        container.innerHTML = '<div class="loading">Caricamento istanze...</div>';

        try {
            const response = await this.fetch(`${this.novaUrl}/servers/detail`, {
                headers: {
                    'X-Auth-Token': this.authToken
                }
            });

            if (!response.ok) {
                throw new Error('Errore nel caricamento delle istanze');
            }

            const data = await response.json();
            this.renderInstances(data.servers);

        } catch (error) {
            container.innerHTML = `<div class="loading">Errore: ${error.message}</div>`;
        }
    }

    renderInstances(instances) {
        const container = document.getElementById('instances-list');

        if (instances.length === 0) {
            container.innerHTML = '<div class="loading">Nessuna istanza trovata</div>';
            return;
        }

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>ID</th>
                        <th>Stato</th>
                        <th>Immagine</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
        `;

        instances.forEach(instance => {
            const status = instance.status.toLowerCase();
            const statusClass = status === 'active' ? 'status-active' :
                               status === 'shutoff' ? 'status-stopped' : 'status-building';

            html += `
                <tr>
                    <td>${instance.name}</td>
                    <td><small>${instance.id}</small></td>
                    <td><span class="status-badge ${statusClass}">${instance.status}</span></td>
                    <td>${instance.image ? instance.image.id.substring(0, 8) : 'N/A'}</td>
                    <td>
                        <div class="action-buttons">
                            ${status === 'shutoff' ?
                                `<button class="btn btn-success btn-small" onclick="app.startInstance('${instance.id}')">Start</button>` :
                                `<button class="btn btn-secondary btn-small" onclick="app.stopInstance('${instance.id}')">Stop</button>`
                            }
                            <button class="btn btn-primary btn-small" onclick="app.rebootInstance('${instance.id}')">Reboot</button>
                            <button class="btn btn-danger btn-small" onclick="app.deleteInstance('${instance.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    async loadFlavors() {
        try {
            const response = await this.fetch(`${this.novaUrl}/flavors/detail`, {
                headers: {
                    'X-Auth-Token': this.authToken
                }
            });

            const data = await response.json();
            const select = document.getElementById('instance-flavor');
            select.innerHTML = '<option value="">Seleziona un flavor...</option>';

            data.flavors.forEach(flavor => {
                const option = document.createElement('option');
                option.value = flavor.id;
                option.textContent = `${flavor.name} (RAM: ${flavor.ram}MB, vCPUs: ${flavor.vcpus})`;
                select.appendChild(option);
            });

        } catch (error) {
            console.error('Errore nel caricamento dei flavors:', error);
        }
    }

    async loadImagesForInstanceCreation() {
        try {
            const response = await this.fetch(`${this.glanceUrl}/v2/images`, {
                headers: {
                    'X-Auth-Token': this.authToken
                }
            });

            const data = await response.json();
            const select = document.getElementById('instance-image');
            select.innerHTML = '<option value="">Seleziona un\'immagine...</option>';

            data.images.forEach(image => {
                if (image.status === 'active') {
                    const option = document.createElement('option');
                    option.value = image.id;
                    option.textContent = image.name;
                    select.appendChild(option);
                }
            });

        } catch (error) {
            console.error('Errore nel caricamento delle immagini:', error);
        }
    }

    async createInstance() {
        const name = document.getElementById('instance-name').value;
        const imageId = document.getElementById('instance-image').value;
        const flavorId = document.getElementById('instance-flavor').value;

        try {
            const payload = {
                server: {
                    name: name,
                    imageRef: imageId,
                    flavorRef: flavorId
                }
            };

            const response = await this.fetch(`${this.novaUrl}/servers`, {
                method: 'POST',
                headers: {
                    'X-Auth-Token': this.authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Errore nella creazione dell\'istanza');
            }

            this.closeModal('create-instance-modal');
            document.getElementById('create-instance-form').reset();
            this.loadInstances();

        } catch (error) {
            alert('Errore: ' + error.message);
        }
    }

    async startInstance(instanceId) {
        await this.instanceAction(instanceId, { 'os-start': null });
    }

    async stopInstance(instanceId) {
        await this.instanceAction(instanceId, { 'os-stop': null });
    }

    async rebootInstance(instanceId) {
        await this.instanceAction(instanceId, { reboot: { type: 'SOFT' } });
    }

    async deleteInstance(instanceId) {
        if (!confirm('Sei sicuro di voler eliminare questa istanza?')) {
            return;
        }

        try {
            const response = await this.fetch(`${this.novaUrl}/servers/${instanceId}`, {
                method: 'DELETE',
                headers: {
                    'X-Auth-Token': this.authToken
                }
            });

            if (!response.ok) {
                throw new Error('Errore nell\'eliminazione dell\'istanza');
            }

            this.loadInstances();

        } catch (error) {
            alert('Errore: ' + error.message);
        }
    }

    async instanceAction(instanceId, action) {
        try {
            const response = await this.fetch(`${this.novaUrl}/servers/${instanceId}/action`, {
                method: 'POST',
                headers: {
                    'X-Auth-Token': this.authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(action)
            });

            if (!response.ok) {
                throw new Error('Errore nell\'esecuzione dell\'azione');
            }

            setTimeout(() => this.loadInstances(), 1000);

        } catch (error) {
            alert('Errore: ' + error.message);
        }
    }

    // Glance (Images) Functions
    async loadImages() {
        const container = document.getElementById('images-list');
        container.innerHTML = '<div class="loading">Caricamento immagini...</div>';

        try {
            const response = await this.fetch(`${this.glanceUrl}/v2/images`, {
                headers: {
                    'X-Auth-Token': this.authToken
                }
            });

            if (!response.ok) {
                throw new Error('Errore nel caricamento delle immagini');
            }

            const data = await response.json();
            this.renderImages(data.images);

        } catch (error) {
            container.innerHTML = `<div class="loading">Errore: ${error.message}</div>`;
        }
    }

    renderImages(images) {
        const container = document.getElementById('images-list');

        if (images.length === 0) {
            container.innerHTML = '<div class="loading">Nessuna immagine trovata</div>';
            return;
        }

        let html = '<div class="image-grid">';

        images.forEach(image => {
            const size = image.size ? (image.size / (1024 * 1024 * 1024)).toFixed(2) : 'N/A';
            const visibility = image.visibility === 'public' ? 'Pubblica' : 'Privata';

            html += `
                <div class="image-card">
                    <h3>${image.name}</h3>
                    <div class="image-info">
                        <strong>ID:</strong> ${image.id.substring(0, 16)}...
                    </div>
                    <div class="image-info">
                        <strong>Formato:</strong> ${image.disk_format || 'N/A'}
                    </div>
                    <div class="image-info">
                        <strong>Dimensione:</strong> ${size} GB
                    </div>
                    <div class="image-info">
                        <strong>Visibilità:</strong> ${visibility}
                    </div>
                    <div class="image-info">
                        <strong>Stato:</strong> <span class="status-badge ${image.status === 'active' ? 'status-active' : 'status-building'}">${image.status}</span>
                    </div>
                    <div class="image-actions">
                        <button class="btn btn-danger btn-small" onclick="app.deleteImage('${image.id}')">Delete</button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    async uploadImage() {
        const name = document.getElementById('image-name').value;
        const format = document.getElementById('image-format').value;
        const url = document.getElementById('image-url').value;
        const isPublic = document.getElementById('image-public').checked;

        try {
            // Create image
            const createPayload = {
                name: name,
                disk_format: format,
                container_format: 'bare',
                visibility: isPublic ? 'public' : 'private'
            };

            const createResponse = await this.fetch(`${this.glanceUrl}/v2/images`, {
                method: 'POST',
                headers: {
                    'X-Auth-Token': this.authToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(createPayload)
            });

            if (!createResponse.ok) {
                throw new Error('Errore nella creazione dell\'immagine');
            }

            const imageData = await createResponse.json();

            // Upload image data from URL
            const imageResponse = await fetch(url);
            const imageBlob = await imageResponse.blob();

            const uploadResponse = await this.fetch(`${this.glanceUrl}/v2/images/${imageData.id}/file`, {
                method: 'PUT',
                headers: {
                    'X-Auth-Token': this.authToken,
                    'Content-Type': 'application/octet-stream'
                },
                body: imageBlob
            });

            if (!uploadResponse.ok) {
                throw new Error('Errore nell\'upload dell\'immagine');
            }

            this.closeModal('upload-image-modal');
            document.getElementById('upload-image-form').reset();
            this.loadImages();

        } catch (error) {
            alert('Errore: ' + error.message);
        }
    }

    async deleteImage(imageId) {
        if (!confirm('Sei sicuro di voler eliminare questa immagine?')) {
            return;
        }

        try {
            const response = await this.fetch(`${this.glanceUrl}/v2/images/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'X-Auth-Token': this.authToken
                }
            });

            if (!response.ok) {
                throw new Error('Errore nell\'eliminazione dell\'immagine');
            }

            this.loadImages();

        } catch (error) {
            alert('Errore: ' + error.message);
        }
    }

    // Modal Functions
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
}

// Initialize app
const app = new OpenStackApp();
