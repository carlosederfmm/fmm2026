/**
 * Componente de Sidebar Reutilizável SME FMM 2026 - Versão Unificada 3.1
 * Correção: Data Integrity + Guard Clauses para evitar erros de 'undefined'
 */
const SidebarComponent = {
    styles: `
        .sidebar-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .sidebar-collapsed .sidebar-text, 
        .sidebar-collapsed .sidebar-category, 
        .sidebar-collapsed .chevron-icon,
        .sidebar-collapsed .sidebar-category-header span { 
            display: none !important; 
        }
        .sidebar-collapsed .sidebar-item { justify-content: center !important; padding: 12px 0 !important; }
        .sidebar-collapsed .logo-full { display: none !important; }
        .sidebar-collapsed .logo-short { display: block !important; }
        
        .category-content { 
            overflow: hidden; 
            transition: max-height 0.3s ease-out; 
            background: rgba(0,0,0,0.05);
        }
        .category-content.open { max-height: 1000px; }
        .sidebar-item-active { 
            background-color: rgba(255, 255, 255, 0.08); 
            border-right: 4px solid #c8d400; 
            color: #ffffff !important; 
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    `,

    menuItems: {
        principal: [
            { label: 'Dashboard', icon: 'pie-chart', link: 'coordenador/principal/dashboard_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Dashboard', icon: 'pie-chart', link: 'orientador/dashboard_orientador.html', roles: ['orientador'] },
            { label: 'Dashboard', icon: 'pie-chart', link: 'secretaria/dashboard_secretaria.html', roles: ['secretaria'] },
            { label: 'Dashboard', icon: 'pie-chart', link: 'inspetor/dashboard_inspetor.html', roles: ['inspetor'] },
            { label: 'Tarefas (Scrum)', icon: 'check-square', link: 'coordenador/principal/tarefas_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Requerimentos', icon: 'inbox', link: 'coordenador/principal/requerimentos.html', roles: ['coordenador', 'diretor'], badge: true },
            { label: 'Meu Perfil', icon: 'user-circle', link: 'coordenador/principal/perfil_coordenador.html', roles: ['coordenador', 'diretor', 'orientador', 'secretaria', 'inspetor'] }
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
        if (path.includes('/notas/') || path.includes('/pedagogico/') || path.includes('/administrativo/') || path.includes('/principal/')) {
            return '../../';
        }
        if (path.includes('/professor/') || path.includes('/orientador/') || path.includes('/secretaria/') || path.includes('/inspetor/') || path.includes('/inspetoria/') || (path.includes('/coordenador/') && !path.includes('/', path.indexOf('/coordenador/') + 13))) {
            return '../';
        }
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

    filterItemsByRole: function(items, role) {
        if (!items) return [];
        return items.filter(item => item.roles && item.roles.includes(role));
    },

    injectStyles: function() {
        if (document.getElementById('sidebar-dynamic-styles')) return;
        const styleTag = document.createElement('style');
        styleTag.id = 'sidebar-dynamic-styles';
        styleTag.innerHTML = this.styles;
        document.head.appendChild(styleTag);
    },

    render: async function(containerId) {
        this.injectStyles(); 
        const prefix = this.getRelativePrefix();
        const container = document.getElementById(containerId);
        if (!container) return;

        let userRole = 'professor'; 
        try {
            if (window.supabaseClient) {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (user) {
                    const { data: profile } = await window.supabaseClient.from('perfis').select('*').eq('id', user.id).maybeSingle();
                    if (profile) {
                        userRole = profile.cargo?.toLowerCase() || 'professor';
                        this.updateUserUI(profile);
                    }
                }
            }
        } catch (e) { console.warn("Erro ao carregar perfil do utilizador.", e); }

        const activePage = window.location.pathname.split('/').pop();
        let navHTML = '';

        if (userRole === 'professor') {
            navHTML += this.buildSimpleCategory('Portal do Docente', this.filterItemsByRole(this.menuItems.docente, userRole), activePage, prefix);
        } else if (userRole === 'secretaria' || userRole === 'inspetor') {
            const items = [
                ...this.filterItemsByRole(this.menuItems.principal, userRole),
                ...this.filterItemsByRole(this.menuItems.pedagogico, userRole)
            ];
            navHTML += `<div class="py-4">` + items.map(i => this.buildLink(i, activePage, prefix)).join('') + `</div>`;
        } else if (userRole === 'orientador') {
             const items = [
                ...this.filterItemsByRole(this.menuItems.principal, userRole),
                ...this.filterItemsByRole(this.menuItems.pedagogico, userRole)
            ];
            navHTML += this.buildSimpleCategory('Serviço de Orientação', items, activePage, prefix);
        } else {
            const principalItems = this.filterItemsByRole(this.menuItems.principal, userRole);
            const admItems = this.filterItemsByRole(this.menuItems.administrativo, userRole);
            const pedItems = this.filterItemsByRole(this.menuItems.pedagogico, userRole);
            const notasItems = this.filterItemsByRole(this.menuItems.notas, userRole);

            if (principalItems.length) navHTML += this.buildAccordion('Principal', 'cat-principal', 'layout', principalItems, activePage, prefix);
            if (admItems.length) navHTML += this.buildAccordion('Administrativo', 'cat-adm', 'settings', admItems, activePage, prefix);
            if (pedItems.length) navHTML += this.buildAccordion('Pedagógico', 'cat-ped', 'heart-handshake', pedItems, activePage, prefix);
            if (notasItems.length) navHTML += this.buildAccordion('Notas', 'cat-notas', 'bar-chart-3', notasItems, activePage, prefix);
        }

        container.innerHTML = `
            <div class="flex flex-col h-full overflow-hidden bg-[#003c5b]">
                <div class="p-6 h-24 border-b border-white/5 flex items-center justify-center relative flex-shrink-0">
                    <img src="${prefix}assets/logo-fmm-white.png" alt="FMM" class="logo-full h-10 object-contain" 
                         onerror="this.src='https://ui-avatars.com/api/?name=FMM&background=003c5b&color=fff&size=128'">
                    <div class="logo-short font-black text-2xl text-[#c8d400] hidden">M</div>
                    <button onclick="SidebarComponent.toggleSidebar()" class="absolute -right-3 top-20 bg-[#c8d400] text-[#003c5b] rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-[60]">
                        <i id="sidebar-toggle-icon" data-lucide="chevron-left" class="w-4 h-4"></i>
                    </button>
                </div>
                <nav class="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    ${navHTML}
                </nav>
                <div class="p-4 border-t border-white/5 flex-shrink-0">
                    <button onclick="SidebarComponent.logout()" class="sidebar-item w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all group">
                        <i data-lucide="log-out" class="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform"></i>
                        <span class="sidebar-text ml-3 font-bold">Sair</span>
                    </button>
                </div>
            </div>
        `;
        
        if (window.lucide) lucide.createIcons();
        this.restoreSidebarState();
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

    buildAccordion: function(title, id, iconName, items, activePage, prefix) {
        if (!items || !items.length) return '';
        const isActive = items.some(i => i.link && i.link.includes(activePage));
        const contentClass = isActive ? 'category-content open' : 'category-content';
        const iconRotate = isActive ? 'rotate-180' : '';
        const initialHeight = isActive ? 'none' : '0';

        return `
            <div class="category-group">
                <button onclick="SidebarComponent.toggleCategory('${id}')" class="sidebar-category-header w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all border-b border-white/5 text-left group">
                    <div class="flex items-center gap-3">
                        <i data-lucide="${iconName}" class="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"></i>
                        <span class="sidebar-text text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-white transition-colors">${title}</span>
                    </div>
                    <i data-lucide="chevron-down" class="chevron-icon w-3.5 h-3.5 text-slate-500 transition-transform ${iconRotate}" id="icon-${id}"></i>
                </button>
                <div id="${id}" class="${contentClass}" style="max-height: ${initialHeight}">
                    ${items.map(item => this.buildLink(item, activePage, prefix)).join('')}
                </div>
            </div>
        `;
    },

    buildLink: function(item, activePage, prefix) {
        // Guard Clause: Verifica se item.link existe antes de chamar includes()
        const isActive = item.link && item.link.includes(activePage);
        const activeClass = isActive ? 'sidebar-item-active text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5';
        
        return `
            <a href="${prefix}${item.link || '#'}" class="sidebar-item flex items-center px-8 py-3 text-[13px] ${activeClass} transition-all relative">
                <i data-lucide="${item.icon}" class="w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#c8d400]' : ''}"></i>
                <span class="sidebar-text ml-3">${item.label}</span>
                ${item.badge ? `<span class="absolute right-4 w-2 h-2 rounded-full bg-red-500 sidebar-text"></span>` : ''}
            </a>
        `;
    },

    toggleCategory: function(id) {
        const target = document.getElementById(id);
        const icon = document.getElementById(`icon-${id}`);
        const body = document.body;
        
        if (body.classList.contains('sidebar-collapsed')) this.toggleSidebar();
        if (!target) return;
        
        if (target.classList.contains('open')) {
            target.classList.remove('open');
            target.style.maxHeight = '0';
            if (icon) icon.classList.remove('rotate-180');
            this.saveCategoryState(id, false);
        } else {
            target.classList.add('open');
            target.style.maxHeight = target.scrollHeight + "px";
            if (icon) icon.classList.add('rotate-180');
            this.saveCategoryState(id, true);
        }
    },

    toggleSidebar: function() {
        const body = document.body;
        const icon = document.getElementById('sidebar-toggle-icon');
        const sidebar = document.getElementById('sidebar-container');
        
        body.classList.toggle('sidebar-collapsed');
        
        if (sidebar) {
            sidebar.style.width = body.classList.contains('sidebar-collapsed') ? '80px' : '288px';
        }

        if (icon && window.lucide) {
            const isCollapsed = body.classList.contains('sidebar-collapsed');
            icon.setAttribute('data-lucide', isCollapsed ? 'chevron-right' : 'chevron-left');
            lucide.createIcons();
        }
    },

    logout: async function() {
        if (confirm("Deseja realmente encerrar a sessão?")) {
            const prefix = this.getRelativePrefix();
            if (window.supabaseClient) await window.supabaseClient.auth.signOut();
            sessionStorage.clear();
            localStorage.removeItem('sidebarState');
            window.location.href = prefix + "index.html";
        }
    },

    saveCategoryState: function(id, isOpen) {
        const state = JSON.parse(localStorage.getItem('sidebarState') || '{}');
        state[id] = isOpen;
        localStorage.setItem('sidebarState', JSON.stringify(state));
    },

    restoreSidebarState: function() {
        const state = JSON.parse(localStorage.getItem('sidebarState') || '{}');
        const body = document.body;
        const activePage = window.location.pathname.split('/').pop();

        if (body.classList.contains('sidebar-collapsed')) {
            const sidebar = document.getElementById('sidebar-container');
            if (sidebar) sidebar.style.width = '80px';
            const icon = document.getElementById('sidebar-toggle-icon');
            if (icon) icon.setAttribute('data-lucide', 'chevron-right');
        }

        const categories = ['cat-principal', 'cat-adm', 'cat-ped', 'cat-notas'];
        categories.forEach(id => {
            const content = document.getElementById(id);
            const icon = document.getElementById(`icon-${id}`);
            if (!content) return;

            const hasActivePage = Array.from(content.querySelectorAll('a')).some(a => {
                const href = a.getAttribute('href');
                return href && href.includes(activePage);
            });
            
            if (hasActivePage || state[id]) {
                content.classList.add('open');
                content.style.maxHeight = "none";
                if (icon) icon.classList.add('rotate-180');
            } else {
                content.classList.remove('open');
                content.style.maxHeight = '0';
            }
        });
        
        if (window.lucide) lucide.createIcons();
    }
};

window.SidebarComponent = SidebarComponent;