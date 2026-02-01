// MOCK DATA
const IMAGES = ['assets/img-jazz.png', 'assets/img-theater.png', 'assets/img-art.png'];
const getRandomImg = () => IMAGES[Math.floor(Math.random() * IMAGES.length)];

const EVENTS = [
    { id: '1', title: 'Jazz & Vinos Escondidos', category: 'Jazz', tags: ['Jazz', 'Gastronomía'], timeOfDay: 'noche', distanceM: 350, time: '21:00', venue: 'El Sótano', priceRange: '$$', editorialNote: 'Íntimo, poca luz, selección de vinos naturales exepcional.', isLocalGem: true, image: 'assets/img-jazz.png' },
    { id: '2', title: 'Teatro Callejero: La Máscara', category: 'Teatro', tags: ['Teatro', 'Arte'], timeOfDay: 'tarde', distanceM: 120, time: '18:30', venue: 'Plaza Central', priceRange: 'Gratis', editorialNote: 'Performance espontánea, muy visual y provocadora.', isLocalGem: true, image: 'assets/img-theater.png' },
    { id: '3', title: 'Exposición: Neón Futuro', category: 'Arte', tags: ['Arte', 'Historia'], timeOfDay: 'mañana', distanceM: 800, time: '11:00', venue: 'Galería M', priceRange: '$', editorialNote: 'Retrofuturismo local. Imperdible la sala de espejos.', isLocalGem: false, image: 'assets/img-art.png' },
    { id: '4', title: 'Rave Underground', category: 'Electrónica', tags: ['Electrónica'], timeOfDay: 'noche', distanceM: 1500, time: '23:59', venue: 'Nave 4', priceRange: '$$$', editorialNote: 'Sonido crudo, sin teléfonos en la pista.', isLocalGem: true, image: getRandomImg() },
    { id: '5', title: 'Cine Clásico: Noir', category: 'Cine', tags: ['Cine', 'Historia'], timeOfDay: 'tarde', distanceM: 450, time: '19:00', venue: 'Cine Club', priceRange: '$', editorialNote: 'Proyección en 35mm original. Ambiente nostálgico.', isLocalGem: false, image: getRandomImg() },
    { id: '6', title: 'Mercado de Abastos', category: 'Gastronomía', tags: ['Gastronomía', 'Historia'], timeOfDay: 'mañana', distanceM: 200, time: '09:00', venue: 'Mercado Viejo', priceRange: '$', editorialNote: 'El mejor lugar para probar comida callejera auténtica.', isLocalGem: true, image: getRandomImg() },
    { id: '7', title: 'Jam Session Abierta', category: 'Jazz', tags: ['Jazz'], timeOfDay: 'noche', distanceM: 600, time: '22:30', venue: 'Bar Blue', priceRange: 'Gratis', editorialNote: 'Nivel musical altísimo, ambiente relajado.', isLocalGem: false, image: 'assets/img-jazz.png' },
    { id: '8', title: 'Taller de Cerámica', category: 'Arte', tags: ['Arte'], timeOfDay: 'mañana', distanceM: 1200, time: '10:00', venue: 'Casa Taller', priceRange: '$$', editorialNote: 'Manos al barro en una casona antigua restaurada.', isLocalGem: true, image: 'assets/img-art.png' },
    { id: '9', title: 'Ciclo Documental', category: 'Cine', tags: ['Cine', 'Historia'], timeOfDay: 'tarde', distanceM: 500, time: '17:00', venue: 'Biblioteca', priceRange: 'Gratis', editorialNote: 'Joyas olvidadas del cine nacional.', isLocalGem: false, image: getRandomImg() },
    { id: '10', title: 'Burger & Beats', category: 'Gastronomía', tags: ['Gastronomía', 'Electrónica'], timeOfDay: 'noche', distanceM: 900, time: '20:00', venue: 'Terraza Z', priceRange: '$$', editorialNote: 'Vistas a la ciudad y beats suaves para cenar.', isLocalGem: false, image: getRandomImg() }
];

const ROUTES = [
    {
        id: 'r1',
        title: 'Santiago oculto: leyendas de piedra',
        desc: 'Un recorrido por la historia no oficial de la ciudad.',
        stops: ['6', '3', '2'] // IDs form EVENTS
    },
    {
        id: 'r2',
        title: 'Jazz & vino: noche local',
        desc: 'La ruta perfecta para amantes de la buena música y el buen beber.',
        stops: ['1', '7', '10']
    }
];

// STATE LIBRARIES
const INTERESTS_OPTS = ['Arte', 'Jazz', 'Teatro', 'Electrónica', 'Cine', 'Gastronomía', 'Historia'];

const app = {
    state: {
        location: '',
        selectedInterests: [], // Set
        timeOfDay: 'noche',
        arMode: false,
        savedIds: [], // loaded from LS
        hasSearched: false
    },

    init: () => {
        app.loadSaved();
        app.renderInterests();
        app.setupListeners();
        app.renderRoutes();
        app.updateSavedList();

        // Initial nav state
        app.switchTab('radar');
        app.switchTab('radar');

        // Back Button Logic
        const backBtn = document.getElementById('btn-ar-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                app.state.arMode = false;
                document.getElementById('ra-toggle').checked = false;

                // Reset view to setup
                document.getElementById('radar-results').classList.remove('ar-active-view');
                document.getElementById('radar-results').classList.add('hidden');
                document.getElementById('radar-results').classList.remove('active');

                document.getElementById('radar-setup').classList.remove('hidden');
                document.getElementById('radar-setup').classList.add('active');
            });
        }
    },

    loadSaved: () => {
        const saved = localStorage.getItem('joyradar_saved');
        if (saved) {
            app.state.savedIds = JSON.parse(saved);
        }
    },

    saveState: () => {
        localStorage.setItem('joyradar_saved', JSON.stringify(app.state.savedIds));
        app.updateSavedList();
        app.renderMap();
    },

    toggleSave: (id) => {
        const index = app.state.savedIds.indexOf(id);
        if (index > -1) {
            app.state.savedIds.splice(index, 1);
        } else {
            app.state.savedIds.push(id);
        }
        app.saveState();
        app.updateUIButtons(id);
    },

    isSaved: (id) => app.state.savedIds.includes(id),

    updateUIButtons: (id) => {
        // Update any button referencing this ID (card or modal)
        const buttons = document.querySelectorAll(`[data-save-btn="${id}"]`);
        buttons.forEach(btn => {
            btn.textContent = app.isSaved(id) ? 'Guardado' : 'Guardar';
            if (app.isSaved(id)) {
                btn.style.background = '#FF9500';
                btn.style.color = '#fff';
            } else {
                btn.removeAttribute('style');
            }
        });

        // Update modal button if open
        const modalBtn = document.getElementById('modal-toggle-save');
        if (modalBtn && modalBtn.dataset.currentId === id) {
            modalBtn.textContent = app.isSaved(id) ? 'Guardado' : 'Guardar';
            if (app.isSaved(id)) {
                modalBtn.style.background = '#FF9500';
                modalBtn.style.borderColor = '#FF9500';
            } else {
                modalBtn.style.background = 'transparent';
                modalBtn.style.borderColor = 'rgba(255,255,255,0.1)';
            }
        }
    },

    setupListeners: () => {
        // TAB NAV
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = btn.dataset.target; // radar, map, routes, etc
                app.switchTab(target);
            });
        });

        // SETUP FORM
        document.getElementById('btn-location').addEventListener('click', () => {
            if (navigator.geolocation) {
                // Fake delay
                document.getElementById('location-input').value = "Buscando...";
                setTimeout(() => {
                    document.getElementById('location-input').value = "Centro, Santiago";
                }, 800);
            }
        });

        document.getElementById('time-selector').addEventListener('click', (e) => {
            if (e.target.classList.contains('segment')) {
                document.querySelectorAll('.segment').forEach(s => s.classList.remove('active'));
                e.target.classList.add('active');
                app.state.timeOfDay = e.target.dataset.value;
            }
        });

        document.getElementById('ra-toggle').addEventListener('change', (e) => {
            app.state.arMode = e.target.checked;
        });

        document.getElementById('profile-ra-toggle').addEventListener('change', (e) => {
            // Mock profile pref sync
            app.state.arMode = e.target.checked;
            document.getElementById('ra-toggle').checked = e.target.checked;
        });

        document.getElementById('btn-discover').addEventListener('click', app.runDiscovery);
        document.getElementById('btn-reset-radar').addEventListener('click', () => {
            document.getElementById('radar-results').classList.remove('active');
            document.getElementById('radar-results').classList.add('hidden');
            setTimeout(() => {
                document.getElementById('radar-setup').classList.remove('hidden');
                document.getElementById('radar-setup').classList.add('active');
            }, 50);
        });

        document.getElementById('btn-go-to-map').addEventListener('click', () => app.switchTab('map'));

        // MODAL
        document.getElementById('modal-close').addEventListener('click', () => {
            document.getElementById('details-modal').classList.add('hidden');
        });

        document.getElementById('modal-toggle-save').addEventListener('click', (e) => {
            const id = e.target.dataset.currentId;
            if (id) app.toggleSave(id);
        });
    },

    switchTab: (tabId) => {
        // Nav Styling
        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.toggle('active', n.dataset.target === tabId);
        });

        // Content Visibility
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.remove('active');
        });
        document.getElementById(`tab-${tabId}`).classList.add('active');

        // Logic hooks
        if (tabId === 'map') app.renderMap();
        if (tabId === 'profile') app.renderProfile();
    },

    renderInterests: () => {
        const container = document.getElementById('interests-chips');
        container.innerHTML = '';
        INTERESTS_OPTS.forEach(int => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = int;
            chip.addEventListener('click', () => {
                chip.classList.toggle('selected');
                if (chip.classList.contains('selected')) {
                    app.state.selectedInterests.push(int);
                } else {
                    app.state.selectedInterests = app.state.selectedInterests.filter(i => i !== int);
                }
            });
            container.appendChild(chip);
        });
    },

    renderProfile: () => {
        const container = document.getElementById('profile-prefs');
        container.innerHTML = '';
        if (app.state.selectedInterests.length === 0) {
            container.innerHTML = '<span style="color: grey; font-size: 13px;">Sin intereses seleccionados</span>';
            return;
        }
        app.state.selectedInterests.forEach(int => {
            const chip = document.createElement('div');
            chip.className = 'chip selected'; // Non-interactive here essentially
            chip.style.cursor = 'default';
            chip.textContent = int;
            container.appendChild(chip);
        });
    },

    // ALGORITHM
    scoreEvent: (event) => {
        let score = 0;
        // Interest match (+3)
        const hasInterest = event.tags.some(t => app.state.selectedInterests.includes(t));
        if (hasInterest) score += 3;

        // Time match (+2)
        if (event.timeOfDay === app.state.timeOfDay) score += 2;

        // Local Gem (+2)
        if (event.isLocalGem) score += 2;

        // Distance penalty ( - dist/500 )
        score -= (event.distanceM / 500);

        return score;
    },

    runDiscovery: () => {
        // Calculate scores
        const scoredEvents = EVENTS.map(e => ({
            ...e,
            score: app.scoreEvent(e)
        })).sort((a, b) => b.score - a.score);

        const top3 = scoredEvents.slice(0, 3);
        const rejected = scoredEvents[3]; // The 4th one

        // Render Results View
        document.getElementById('radar-setup').classList.add('hidden');
        document.getElementById('radar-setup').classList.remove('active');

        const resultsView = document.getElementById('radar-results');
        resultsView.classList.remove('hidden');
        resultsView.classList.add('active');

        // AR View
        const arView = document.getElementById('ar-view');
        if (app.state.arMode) {
            arView.classList.remove('hidden');
            resultsView.classList.add('ar-active-view'); // Add styling hook
            app.renderARMarkers(top3);
        } else {
            arView.classList.add('hidden');
            resultsView.classList.remove('ar-active-view');
        }

        // Render Cards
        const listEl = document.getElementById('results-list');
        listEl.innerHTML = '';
        top3.forEach(item => {
            listEl.appendChild(app.createCard(item));
        });

        // Editorial Rejection
        const edBlock = document.getElementById('editorial-rejection');
        if (rejected) {
            edBlock.innerHTML = `
                <strong>Criterio Editorial:</strong>
                Descartamos "${rejected.title}" (${rejected.category}) porque aunque coincide con tus gustos, queda un poco lejos para esta ${app.state.timeOfDay} y creemos que hoy prefieres algo más céntrico.
            `;
        } else {
            edBlock.innerHTML = '';
        }

        // Update map mock pins data
        app.currentResults = top3;
    },

    createCard: (item) => {
        const div = document.createElement('div');
        div.className = 'card';
        const isSaved = app.isSaved(item.id);

        div.innerHTML = `
            <div class="card-header">
                <div class="card-title">${item.title} <span class="badge">${item.category}</span></div>
            </div>
            <div class="card-meta">
                <span>📍 ${item.distanceM}m</span>
                <span>⏰ ${item.time}</span>
                <span>💰 ${item.priceRange}</span>
            </div>
            <div class="card-context">"${item.editorialNote}"</div>
            <div class="card-actions">
                <button class="card-btn primary btn-detail" data-id="${item.id}">Ver detalle</button>
                <button class="card-btn action btn-save" data-save-btn="${item.id}" data-id="${item.id}">
                    ${isSaved ? 'Guardado' : 'Guardar'}
                </button>
            </div>
        `;

        // Dynamic save style
        if (isSaved) {
            div.querySelector('.btn-save').style.background = '#FF9500';
            div.querySelector('.btn-save').style.color = '#fff';
        }

        div.querySelector('.btn-detail').addEventListener('click', () => app.openDetail(item));
        div.querySelector('.btn-save').addEventListener('click', () => app.toggleSave(item.id));
        return div;
    },

    renderARMarkers: (items) => {
        const container = document.getElementById('ar-markers');
        container.innerHTML = '';

        // Position markers randomly-ish
        const positions = [
            { left: '20%', top: '40%' },
            { left: '50%', top: '50%' },
            { left: '80%', top: '45%' },
        ];

        items.forEach((item, idx) => {
            const pos = positions[idx];
            const el = document.createElement('div');
            el.className = 'ar-marker';
            el.style.left = pos.left;
            el.style.top = pos.top;
            el.innerHTML = `
                <span>${item.title}</span>
                <small>${item.distanceM}m</small>
            `;
            // Add interaction
            el.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent other clicks
                app.openDetail(item);
            });
            container.appendChild(el);
        });
    },

    openDetail: (item) => {
        const modal = document.getElementById('details-modal');
        document.getElementById('modal-title').textContent = item.title;
        document.getElementById('modal-category').textContent = item.category;
        document.getElementById('modal-time').textContent = item.time;
        document.getElementById('modal-price').textContent = item.priceRange;
        document.getElementById('modal-description').textContent = item.editorialNote + " Un espacio que captura la esencia de la ciudad. Recomendado especialmente si buscas experiencias auténticas lejos del turismo masivo.";

        // Set image
        const imgPlaceholder = modal.querySelector('.modal-image-placeholder');
        if (item.image) {
            imgPlaceholder.style.backgroundImage = `url('${item.image}')`;
            imgPlaceholder.style.backgroundSize = 'cover';
            imgPlaceholder.style.backgroundPosition = 'center';
        } else {
            imgPlaceholder.style.backgroundImage = 'none';
            imgPlaceholder.style.background = 'linear-gradient(135deg, #1e1e2d 0%, #2a2a40 100%)';
        }

        const saveJavaBtn = document.getElementById('modal-toggle-save');
        saveJavaBtn.dataset.currentId = item.id;

        app.updateUIButtons(item.id); // sync state

        modal.classList.remove('hidden');
    },

    updateSavedList: () => {
        const container = document.getElementById('saved-list');
        const empty = document.getElementById('empty-saved');
        container.innerHTML = '';

        if (app.state.savedIds.length === 0) {
            empty.classList.remove('hidden');
            return;
        } else {
            empty.classList.add('hidden');
        }

        app.state.savedIds.forEach(id => {
            const item = EVENTS.find(e => e.id === id);
            if (item) {
                container.appendChild(app.createCard(item));
            }
        });
    },

    renderRoutes: () => {
        const container = document.getElementById('routes-list');
        container.innerHTML = '';
        ROUTES.forEach(route => {
            const div = document.createElement('div');
            div.className = 'card route-card';

            // Get stops names
            const stopNames = route.stops.map(sid => {
                const ev = EVENTS.find(e => e.id === sid);
                return ev ? ev.title : 'Desconocido';
            });

            div.innerHTML = `
                <div class="card-header">
                    <div class="card-title">${route.title}</div>
                </div>
                <div class="card-context">${route.desc}</div>
                <div style="margin-top:10px; margin-bottom:10px;">
                    ${stopNames.map((n, i) => `<div class="route-item"><small>${i + 1}.</small> <span class="route-stop-name">${n}</span></div>`).join('')}
                </div>
                <button class="btn-secondary">Explorar Ruta</button>
             `;
            container.appendChild(div);
        });
    },

    renderMap: () => {
        const container = document.getElementById('map-pins');
        container.innerHTML = '';

        const itemsToShow = new Set();
        if (app.currentResults) app.currentResults.forEach(i => itemsToShow.add(i));
        app.state.savedIds.forEach(id => {
            const item = EVENTS.find(e => e.id === id);
            if (item) itemsToShow.add(item);
        });

        // Default logic if empty
        if (itemsToShow.size === 0) {
            itemsToShow.add(EVENTS[0]);
            itemsToShow.add(EVENTS[5]);
            itemsToShow.add(EVENTS[8]);
        }

        Array.from(itemsToShow).forEach(item => {
            const idNum = parseInt(item.id);
            // Better determinism
            const top = (20 + (idNum * 17) % 50) + '%';
            const left = (10 + (idNum * 29) % 80) + '%';

            const pinContainer = document.createElement('div');
            pinContainer.className = 'map-pin';
            pinContainer.style.top = top;
            pinContainer.style.left = left;

            pinContainer.innerHTML = `
                <div class="pin-icon"></div>
                <div class="pin-label">${item.title}</div>
            `;

            pinContainer.addEventListener('click', () => app.openDetail(item));
            container.appendChild(pinContainer);
        });

        // Render User Mock Pin separately if needed, or just let static css handle it
    }
};

// Start
document.addEventListener('DOMContentLoaded', app.init);
