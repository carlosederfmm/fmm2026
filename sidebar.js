/**
 * Componente de Sidebar Reutilizável SME FMM 2026 - Versão 4.2 (PWA Stable)
 * Mobile: Bottom Navigation Bar + Hub Menu (Anti-duplication)
 * Desktop: Sidebar Clássica
 */
const SidebarComponent = {
    styles: `
        .sidebar-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        
        /* Ocultar sidebar no mobile e mostrar no desktop */
        @media (max-width: 767px) {
            #sidebar-container { display: none !important; }
            .mobile-nav-active { padding-bottom: 70px !important; }
        }

        @media (min-width: 768px) {
            .bottom-nav { display: none !important; }
            .sidebar-collapsed .sidebar-text, .sidebar-collapsed .chevron-icon { display: none !important; }
            .sidebar-collapsed .logo-full { display: none !important; }
            .sidebar-collapsed .logo-short { display: block !important; }
        }

        /* Estilo da Barra Inferior (Bottom Nav) */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 65px;
            background: #ffffff;
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            z-index: 100;
            padding-bottom: env(safe-area-inset-bottom);
            box-shadow: 0 -4px 10px rgba(0,0,0,0.03);
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: #94a3b8;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: all 0.2s;
            background: none;
            border: none;
            cursor: pointer;
            text-decoration: none;
        }

        .nav-item.active { color: #00638f; }
        .nav-item i, .nav-item svg { width: 20px; height: 20px; }

        /* Full Screen Menu Hub (PWA Style) */
        #mobile-menu-hub {
            position: fixed;
            inset: 0;
            background: #003c5b;
            z-index: 200;
            transform: translateY(100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }

        #mobile-menu-hub.open { transform: translateY(0); }

        .category-content { overflow: hidden; transition: max-height 0.3s ease-out; background: rgba(0,0,0,0.05); }
        .category-content.open { max-height: 1000px; }
        .sidebar-item-active { background-color: rgba(255, 255, 255, 0.08); border-right: 4px solid #c8d400; color: #ffffff !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    `,

    bottomNavConfig: {
        'coordenador': [
            { label: 'Início', icon: 'home', link: 'coordenador/principal/dashboard_coordenador.html' },
            { label: 'Alunos', icon: 'users', link: 'coordenador/administrativo/alunos_coordenador.html' },
            { label: 'Sanções', icon: 'shield-alert', link: 'coordenador/pedagogico/sancoes_coordenador.html' },
            { label: 'Tarefas', icon: 'check-square', link: 'coordenador/principal/tarefas_coordenador.html' }
        ],
        'diretor': [
            { label: 'Início', icon: 'home', link: 'coordenador/principal/dashboard_coordenador.html' },
            { label: 'Alunos', icon: 'users', link: 'coordenador/administrativo/alunos_coordenador.html' },
            { label: 'Sanções', icon: 'shield-alert', link: 'coordenador/pedagogico/sancoes_coordenador.html' },
            { label: 'Usuários', icon: 'shield-check', link: 'coordenador/administrativo/usuarios_coordenador.html' }
        ],
        'professor': [
            { label: 'Início', icon: 'home', link: 'professor/dashboard_professor.html' },
            { label: 'Chamada', icon: 'calendar-check', link: 'professor/presenca_professor.html' },
            { label: 'Notas', icon: 'graduation-cap', link: 'professor/notas_professor.html' },
            { label: 'Perfil', icon: 'user-circle', link: 'professor/perfil_professor.html' }
        ],
        'inspetor': [
            { label: 'Dashboard', icon: 'home', link: 'inspetor/dashboard_inspetor.html' },
            { label: 'Sanções', icon: 'shield-alert', link: 'inspetor/sancoes_inspetor.html' },
            { label: 'Meu Perfil', icon: 'user-circle', link: 'inspetor/perfil_inspetor.html' }
        ]
    },

    menuItems: {
        principal: [
            { label: 'Dashboard', icon: 'pie-chart', link: 'coordenador/principal/dashboard_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Dashboard', icon: 'pie-chart', link: 'orientador/dashboard_orientador.html', roles: ['orientador'] },
            { label: 'Dashboard', icon: 'pie-chart', link: 'secretaria/dashboard_secretaria.html', roles: ['secretaria'] },
            { label: 'Dashboard', icon: 'pie-chart', link: 'inspetor/dashboard_inspetor.html', roles: ['inspetor'] },
            { label: 'Tarefas (Scrum)', icon: 'check-square', link: 'coordenador/principal/tarefas_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Requerimentos', icon: 'inbox', link: 'coordenador/principal/requerimentos.html', roles: ['coordenador', 'diretor'], badge: true },
            { label: 'Meu Perfil', icon: 'user-circle', link: 'coordenador/principal/perfil_coordenador.html', roles: ['coordenador', 'diretor', 'orientador', 'secretaria'] },
            { label: 'Meu Perfil', icon: 'user-circle', link: 'inspetor/perfil_inspetor.html', roles: ['inspetor'] }
        ],
        administrativo: [
            { label: 'Usuários / Staff', icon: 'shield-check', link: 'coordenador/administrativo/usuarios_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Professores', icon: 'graduation-cap', link: 'coordenador/administrativo/professor_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Alunos', icon: 'users-2', link: 'coordenador/administrativo/alunos_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Disciplinas', icon: 'book-open', link: 'coordenador/administrativo/disciplinas_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Turmas', icon: 'library', link: 'coordenador/administrativo/turmas_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Enturmação', icon: 'user-plus', link: 'coordenador/administrativo/enturmacao_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Grade Horária', icon: 'calendar-range', link: 'coordenador/administrativo/grade_coordenador.html', roles: ['diretor', 'coordenador'] }
        ],
        pedagogico: [
            { label: 'Sanções', icon: 'shield-alert', link: 'coordenador/pedagogico/sancoes_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Sanções', icon: 'shield-alert', link: 'orientador/sancoes_orientador.html', roles: ['orientador'] },
            { label: 'Sanções', icon: 'shield-alert', link: 'inspetor/sancoes_inspetor.html', roles: ['inspetor'] },
            { label: 'Prontuários', icon: 'clipboard-list', link: 'orientador/atendimento_orientador.html', roles: ['orientador'] },
            { label: 'Atendimentos', icon: 'message-square', link: 'coordenador/pedagogico/atendimentos_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Fila de Chamados', icon: 'bell', link: 'orientador/chamados_orientador.html', roles: ['orientador'] },
            { label: 'Chamados', icon: 'bell-plus', link: 'coordenador/pedagogico/chamados_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Saídas', icon: 'log-out', link: 'coordenador/pedagogico/saidas_coordenador.html', roles: ['diretor', 'coordenador', 'secretaria'] },
            { label: 'Atrasos', icon: 'clock', link: 'coordenador/pedagogico/atrasos_coordenador.html', roles: ['diretor', 'coordenador', 'secretaria'] }
        ],
        notas: [
            { label: 'Boletim Individual', icon: 'user', link: 'coordenador/notas/boletim_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Mapa Geral', icon: 'grid', link: 'coordenador/notas/mapa_coordenador.html', roles: ['diretor', 'coordenador'] }
        ],
        docente: [
            { label: 'Dashboard', icon: 'layout-dashboard', link: 'professor/dashboard_professor.html', roles: ['professor'] },
            { label: 'Presença', icon: 'calendar-check', link: 'professor/presenca_professor.html', roles: ['professor'] },
            { label: 'Lançar Notas', icon: 'graduation-cap', link: 'professor/notas_professor.html', roles: ['professor'] },
            { label: 'Gestão Individual', icon: 'user-search', link: 'professor/individual_professor.html', roles: ['professor'] },
            { label: 'Conteúdo de Aula', icon: 'book-text', link: 'professor/conteudo_professor.html', roles: ['professor'] },
            { label: 'Neurodivergentes', icon: 'brain', link: 'professor/alunos_neurodivergentes.html', roles: ['professor'] },
            { label: 'Meu Perfil', icon: 'user-circle', link: 'professor/perfil_professor.html', roles: ['professor'] }
        ]
    },

    getRelativePrefix: function() {
        const path = window.location.pathname;
        if (path.includes('/notas/') || path.includes('/pedagogico/') || path.includes('/administrativo/') || path.includes('/principal/')) return '../../';
        if (path.includes('/professor/') || path.includes('/orientador/') || path.includes('/secretaria/') || path.includes('/inspetor/')) return '../';
        return './';
    },

    updateUserUI: function(profile) {
        if (!profile) return;
        const nameEl = document.getElementById('userName');
        const roleEl = document.getElementById('userRoleLabel');
        const initialsEl = document.getElementById('userInitials');

        if (nameEl) nameEl.innerText = profile.nome_completo || 'Utilizador';
        if (roleEl) {
            const roleLabels = {
                'diretor': 'Diretor Académico',
                'coordenador': 'Coordenador Académico',
                'orientador': 'Orientador Pedagógico',
                'professor': 'Docente',
                'secretaria': 'Secretaria Académica',
                'inspetor': 'Inspetor de Alunos'
            };
            roleEl.innerText = roleLabels[profile.cargo?.toLowerCase()] || profile.cargo || 'Colaborador';
        }

        if (initialsEl && profile.nome_completo) {
            const names = profile.nome_completo.split(' ').filter(n => n.length > 2);
            let initials = names.length >= 2 ? (names[0][0] + names[names.length - 1][0]).toUpperCase() : (names[0] ? names[0][0].toUpperCase() : "?");
            initialsEl.innerText = initials;
        }
    },

    buildSimpleCategory: function(title, items, activePage, prefix) {
        if (!items || !items.length) return '';
        return `
            <div class="mb-6">
                <p class="sidebar-category px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 sidebar-text">${title}</p>
                ${items.map(item => this.buildLink(item, activePage, prefix)).join('')}
            </div>
        `;
    },

    render: async function(containerId) {
        if (!document.getElementById('sidebar-dynamic-styles')) {
            const styleTag = document.createElement('style');
            styleTag.id = 'sidebar-dynamic-styles';
            styleTag.innerHTML = this.styles;
            document.head.appendChild(styleTag);
        }

        const prefix = this.getRelativePrefix();
        const container = document.getElementById(containerId);
        if (!container) return;

        let userRole = 'professor'; 

        try {
            if (window.supabaseClient) {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (user) {
                    const { data } = await window.supabaseClient.from('perfis').select('*').eq('id', user.id).maybeSingle();
                    if (data) {
                        userRole = data.cargo?.toLowerCase() || 'professor';
                        this.updateUserUI(data);
                    }
                }
            }
        } catch (e) { console.warn("Supabase fetch failed."); }

        const activePage = window.location.pathname.split('/').pop();
        
        let navHTML = '';
        if (userRole === 'professor') {
            navHTML += this.buildSimpleCategory('Portal do Docente', this.filterItemsByRole(this.menuItems.docente, userRole), activePage, prefix);
        } else if (userRole === 'secretaria' || userRole === 'inspetor' || userRole === 'orientador') {
            const items = [...this.filterItemsByRole(this.menuItems.principal, userRole), ...this.filterItemsByRole(this.menuItems.pedagogico, userRole)];
            navHTML += `<div class="py-4">` + items.map(i => this.buildLink(i, activePage, prefix)).join('') + `</div>`;
        } else {
            navHTML += this.buildAccordion('Principal', 'cat-principal', 'layout', this.filterItemsByRole(this.menuItems.principal, userRole), activePage, prefix);
            navHTML += this.buildAccordion('Administrativo', 'cat-adm', 'settings', this.filterItemsByRole(this.menuItems.administrativo, userRole), activePage, prefix);
            navHTML += this.buildAccordion('Pedagógico', 'cat-ped', 'heart-handshake', this.filterItemsByRole(this.menuItems.pedagogico, userRole), activePage, prefix);
            navHTML += this.buildAccordion('Notas', 'cat-notas', 'bar-chart-3', this.filterItemsByRole(this.menuItems.notas, userRole), activePage, prefix);
        }

        container.innerHTML = `
            <div class="flex flex-col h-full overflow-hidden bg-[#003c5b]">
                <div class="p-6 h-24 border-b border-white/5 flex items-center justify-center relative flex-shrink-0">
                    <img src="${prefix}assets/logo-fmm-white.png" alt="FMM" class="logo-full h-10 object-contain">
                    <button onclick="SidebarComponent.toggleSidebar()" class="absolute -right-3 top-20 bg-[#c8d400] text-[#003c5b] rounded-full p-1 shadow-lg z-[60]">
                        <i id="sidebar-toggle-icon" data-lucide="chevron-left" class="w-4 h-4"></i>
                    </button>
                </div>
                <nav class="flex-1 overflow-y-auto py-4 custom-scrollbar">${navHTML}</nav>
                <div class="p-4 border-t border-white/5">
                    <button onclick="SidebarComponent.logout()" class="sidebar-item w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                        <i data-lucide="log-out" class="w-5 h-5 flex-shrink-0"></i>
                        <span class="sidebar-text ml-3 font-bold">Sair</span>
                    </button>
                </div>
            </div>
        `;

        const existingNav = document.querySelector('.bottom-nav');
        const existingHub = document.getElementById('mobile-menu-hub');
        if (existingNav) existingNav.remove();
        if (existingHub) existingHub.remove();

        const config = this.bottomNavConfig[userRole] || this.bottomNavConfig['professor'];
        const bottomNav = document.createElement('div');
        bottomNav.className = 'bottom-nav';
        
        let bottomHTML = config.map(item => {
            const isActive = activePage && item.link.includes(activePage);
            return `<a href="${prefix}${item.link}" class="nav-item ${isActive ? 'active' : ''}"><i data-lucide="${item.icon}"></i><span>${item.label}</span></a>`;
        }).join('');

        bottomHTML += `<button onclick="SidebarComponent.toggleMobileHub()" class="nav-item"><i data-lucide="more-horizontal"></i><span>Menu</span></button>`;
        bottomNav.innerHTML = bottomHTML;
        document.body.appendChild(bottomNav);
        document.body.classList.add('mobile-nav-active');

        const hub = document.createElement('div');
        hub.id = 'mobile-menu-hub';
        hub.innerHTML = `
            <div class="p-8 flex justify-between items-center border-b border-white/10">
                <img src="${prefix}assets/logo-fmm-white.png" class="h-8">
                <button onclick="SidebarComponent.toggleMobileHub()" class="p-2 text-white/50"><i data-lucide="x" class="w-8 h-8"></i></button>
            </div>
            <div class="flex-1 p-6 space-y-8 custom-scrollbar">
                <div class="grid grid-cols-2 gap-4">${this.getAllItemsForRole(userRole).map(item => `<a href="${prefix}${item.link}" class="bg-white/5 p-4 rounded-3xl flex flex-col items-center gap-3 text-center transition-active"><div class="w-12 h-12 bg-[#c8d400]/10 rounded-2xl flex items-center justify-center text-[#c8d400]"><i data-lucide="${item.icon}" class="w-6 h-6"></i></div><span class="text-[10px] font-black text-white uppercase tracking-widest">${item.label}</span></a>`).join('')}</div>
                <button onclick="SidebarComponent.logout()" class="w-full py-4 bg-red-500/20 text-red-400 rounded-3xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2"><i data-lucide="log-out" class="w-4 h-4"></i> Encerrar Sessão</button>
            </div>`;
        document.body.appendChild(hub);
        if (window.lucide) lucide.createIcons();
    },

    getAllItemsForRole: function(role) {
        let items = [];
        Object.values(this.menuItems).forEach(cat => { items = items.concat(cat.filter(i => i.roles && i.roles.includes(role))); });
        return items.filter((v, i, a) => a.findIndex(t => (t.link === v.link)) === i);
    },

    filterItemsByRole: function(items, role) { return items ? items.filter(item => item.roles && item.roles.includes(role)) : []; },

    buildLink: function(item, activePage, prefix) {
        const isActive = activePage && item.link && item.link.includes(activePage);
        const activeClass = isActive ? 'sidebar-item-active text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5';
        return `<a href="${prefix}${item.link || '#'}" class="sidebar-item flex items-center px-8 py-3 text-[13px] ${activeClass} transition-all relative"><i data-lucide="${item.icon}" class="w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#c8d400]' : ''}"></i><span class="sidebar-text ml-3">${item.label}</span></a>`;
    },

    buildAccordion: function(title, id, iconName, items, activePage, prefix) {
        if (!items.length) return '';
        const isActive = activePage && items.some(i => i.link.includes(activePage));
        return `<div class="category-group border-b border-white/5"><button onclick="SidebarComponent.toggleCategory('${id}')" class="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 group text-left"><div class="flex items-center gap-3"><i data-lucide="${iconName}" class="w-4 h-4 text-slate-400 group-hover:text-white"></i><span class="sidebar-text text-[10px] font-black text-slate-300 uppercase tracking-widest">${title}</span></div><i data-lucide="chevron-down" class="chevron-icon w-3.5 h-3.5 text-slate-500 ${isActive ? 'rotate-180' : ''}" id="icon-${id}"></i></button><div id="${id}" class="category-content ${isActive ? 'open' : ''}" style="max-height: ${isActive ? 'none' : '0'}">${items.map(item => this.buildLink(item, activePage, prefix)).join('')}</div></div>`;
    },

    toggleCategory: function(id) {
        const target = document.getElementById(id), icon = document.getElementById(`icon-${id}`);
        if (!target) return;
        const isOpen = target.classList.contains('open');
        target.classList.toggle('open');
        target.style.maxHeight = isOpen ? '0' : target.scrollHeight + "px";
        if (icon) icon.classList.toggle('rotate-180');
    },

    toggleSidebar: function() {
        document.body.classList.toggle('sidebar-collapsed');
        const isCollapsed = document.body.classList.contains('sidebar-collapsed'), icon = document.getElementById('sidebar-toggle-icon'), sidebar = document.getElementById('sidebar-container');
        if (sidebar) sidebar.style.width = isCollapsed ? '80px' : '288px';
        if (icon) { icon.setAttribute('data-lucide', isCollapsed ? 'chevron-right' : 'chevron-left'); lucide.createIcons(); }
    },

    toggleMobileHub: function() {
        const hub = document.getElementById('mobile-menu-hub');
        if (hub) hub.classList.toggle('open');
        if (window.lucide) lucide.createIcons();
    },

    logout: async function() {
        if (confirm("Deseja realmente encerrar a sessão?")) {
            if (window.supabaseClient) await window.supabaseClient.auth.signOut();
            window.location.href = this.getRelativePrefix() + "index.html";
        }
    },

    restoreSidebarState: function() {} 
};

window.SidebarComponent = SidebarComponent;