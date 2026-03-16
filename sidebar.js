/**
 * Componente de Sidebar Reutilizável SME FMM 2026 - Versão 5.1 (Correção Hub Mobile)
 */
const SidebarComponent = {
    styles: `
        .sidebar-transition { transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
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
        .bottom-nav {
            position: fixed; bottom: 0; left: 0; right: 0; height: 65px;
            background: #ffffff; display: flex; justify-content: space-around;
            align-items: center; border-top: 1px solid #e2e8f0; z-index: 100;
            padding-bottom: env(safe-area-inset-bottom);
            box-shadow: 0 -4px 10px rgba(0,0,0,0.03);
        }
        .nav-item {
            display: flex; flex-direction: column; align-items: center; gap: 4px;
            color: #94a3b8; font-size: 9px; font-weight: 800; text-transform: uppercase;
            letter-spacing: 0.05em; transition: all 0.2s; background: none; border: none; cursor: pointer; text-decoration: none;
        }
        .nav-item.active { color: #00638f; }
        .nav-item i, .nav-item svg { width: 20px; height: 20px; }

        .category-content { overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(0,0,0,0.05); }
        .category-content.open { max-height: 1000px; }
        .sidebar-item-active { background-color: rgba(255, 255, 255, 0.08); border-right: 4px solid #c8d400; color: #ffffff !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

        /* Estilos do Hub Mobile */
        #mobile-menu-hub {
            position: fixed; inset: 0; background: rgba(0, 60, 91, 0.95);
            backdrop-filter: blur(10px); z-index: 200; display: none;
            flex-direction: column; padding: 2rem;
        }
        #mobile-menu-hub.active { display: flex; animation: fadeInHub 0.3s ease-out; }
        @keyframes fadeInHub { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    `,

    bottomNavConfig: {
        'coordenador': [
            { label: 'Início', icon: 'home', link: 'coordenador/operacional/dashboard_coordenador.html' },
            { label: 'Provas', icon: 'clipboard-list', link: 'coordenador/provas/requerimentos.html' },
            { label: 'Sanções', icon: 'shield-alert', link: 'coordenador/disciplina/sancoes_coordenador.html' },
            { label: 'Audit', icon: 'clipboard-check', link: 'coordenador/operacional/auditoria_coordenador.html' }
        ],
        'diretor': [
            { label: 'Início', icon: 'home', link: 'coordenador/operacional/dashboard_coordenador.html' },
            { label: 'Alunos', icon: 'users', link: 'coordenador/secretaria/alunos_coordenador.html' },
            { label: 'Sanções', icon: 'shield-alert', link: 'coordenador/disciplina/sancoes_coordenador.html' },
            { label: 'Geral', icon: 'grid', link: 'coordenador/resultados/mapa_coordenador.html' }
        ],
        'secretaria': [
            { label: 'Início', icon: 'home', link: 'secretaria/dashboard_secretaria.html' },
            { label: 'E-mails', icon: 'mail', link: 'secretaria/emails_secretaria.html' },
            { label: 'Atrasos', icon: 'clock', link: 'coordenador/disciplina/atrasos_coordenador.html' },
            { label: 'Saídas', icon: 'log-out', link: 'coordenador/disciplina/saidas_coordenador.html' }
        ],
        'inspetor': [
            { label: 'Início', icon: 'home', link: 'inspetor/dashboard_inspetor.html' },
            { label: 'Sanções', icon: 'shield-alert', link: 'inspetor/sancoes_inspetor.html' },
            { label: 'Meu Perfil', icon: 'user-circle', link: 'inspetor/perfil_inspetor.html' }
        ],
        'professor': [
            { label: 'Início', icon: 'home', link: 'professor/dashboard_professor.html' },
            { label: 'Chamada', icon: 'calendar-check', link: 'professor/presenca_professor.html' },
            { label: 'Notas', icon: 'graduation-cap', link: 'professor/notas_professor.html' },
            { label: 'Individual', icon: 'user-search', link: 'professor/individual_professor.html' }
        ]
    },

    menuItems: {
        inspetor_exclusivo: [
            { label: 'Dashboard', icon: 'pie-chart', link: 'inspetor/dashboard_inspetor.html', roles: ['inspetor'] },
            { label: 'Sanções', icon: 'shield-alert', link: 'inspetor/sancoes_inspetor.html', roles: ['inspetor'] },
            { label: 'Meu Perfil', icon: 'user-circle', link: 'inspetor/perfil_inspetor.html', roles: ['inspetor'] }
        ],
        secretaria_exclusivo: [
            { label: 'Dashboard', icon: 'pie-chart', link: 'secretaria/dashboard_secretaria.html', roles: ['secretaria'] },
            { label: 'E-mails', icon: 'mail', link: 'secretaria/emails_secretaria.html', roles: ['secretaria'] },
            { label: 'Atrasos', icon: 'clock', link: 'coordenador/disciplina/atrasos_coordenador.html', roles: ['secretaria'] },
            { label: 'Saídas', icon: 'log-out', link: 'coordenador/disciplina/saidas_coordenador.html', roles: ['secretaria'] },
            { label: 'Meu Perfil', icon: 'user-circle', link: 'coordenador/operacional/perfil_coordenador.html', roles: ['secretaria'] }
        ],
        operacional: [
            { label: 'Dashboard', icon: 'pie-chart', link: 'coordenador/operacional/dashboard_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Tarefas (Scrum)', icon: 'check-square', link: 'coordenador/operacional/tarefas_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Auditoria de Diários', icon: 'clipboard-check', link: 'coordenador/operacional/auditoria_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Meu Perfil', icon: 'user-circle', link: 'coordenador/operacional/perfil_coordenador.html', roles: ['coordenador', 'diretor'] }
        ],
        provas: [
            { label: 'Gabaritos', icon: 'check-square', link: 'coordenador/provas/gabaritos_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Requerimentos', icon: 'inbox', link: 'coordenador/provas/requerimentos.html', roles: ['coordenador', 'diretor'] },
            { label: 'Listas de Assinatura', icon: 'printer', link: 'coordenador/provas/listas_coordenador.html', roles: ['coordenador', 'diretor'] }
        ],
        secretaria: [
            { label: 'Ficha de Alunos', icon: 'users-2', link: 'coordenador/secretaria/alunos_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Enturmação', icon: 'user-plus', link: 'coordenador/secretaria/enturmacao_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Turmas', icon: 'library', link: 'coordenador/secretaria/turmas_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Professores', icon: 'graduation-cap', link: 'coordenador/secretaria/professor_coordenador.html', roles: ['diretor', 'coordenador'] }
        ],
        disciplina: [
            { label: 'Sanções', icon: 'shield-alert', link: 'coordenador/disciplina/sancoes_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Fila de Chamados', icon: 'bell-plus', link: 'coordenador/disciplina/chamados_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Atrasos', icon: 'clock', link: 'coordenador/disciplina/atrasos_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Saídas Antecipadas', icon: 'log-out', link: 'coordenador/disciplina/saidas_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Atendimentos', icon: 'message-square', link: 'coordenador/disciplina/atendimentos_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Orientação', icon: 'heart-handshake', link: 'coordenador/disciplina/orientacao_coordenador.html', roles: ['diretor', 'coordenador'] }
        ],
        resultados: [
            { label: 'Mapa de Notas', icon: 'grid', link: 'coordenador/resultados/mapa_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Boletim Individual', icon: 'user', link: 'coordenador/resultados/boletim_coordenador.html', roles: ['diretor', 'coordenador'] }
        ],
        sistema: [
            { label: 'Grade Horária', icon: 'calendar-range', link: 'coordenador/sistema/grade_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Disciplinas', icon: 'book-open', link: 'coordenador/sistema/disciplinas_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Usuários / Staff', icon: 'shield-check', link: 'coordenador/sistema/usuarios_coordenador.html', roles: ['diretor', 'coordenador'] }
        ],
        docente: [
            { label: 'Dashboard', icon: 'layout-dashboard', link: 'professor/dashboard_professor.html', roles: ['professor'] },
            { label: 'Presença', icon: 'calendar-check', link: 'professor/presenca_professor.html', roles: ['professor'] },
            { label: 'Lançar Notas', icon: 'graduation-cap', link: 'professor/notas_professor.html', roles: ['professor'] },
            { label: 'Gabaritos', icon: 'clipboard-list', link: 'professor/gabaritos_professor.html', roles: ['professor'] },
            { label: 'Gestão Individual', icon: 'user-search', link: 'professor/individual_professor.html', roles: ['professor'] },
            { label: 'Conteúdo de Aula', icon: 'book-text', link: 'professor/conteudo_professor.html', roles: ['professor'] },
            { label: 'Neurodivergentes', icon: 'brain', link: 'professor/alunos_neurodivergentes.html', roles: ['professor'] },
            { label: 'Meu Perfil', icon: 'user-circle', link: 'professor/perfil_professor.html', roles: ['professor'] }
        ]
    },

    getRelativePrefix: function() {
        const path = window.location.pathname;
        if (path.includes('/coordenador/')) return '../../';
        const paperFolders = ['/professor/', '/orientador/', '/inspetor/', '/secretaria/'];
        if (paperFolders.some(folder => path.includes(folder))) {
            return '../';
        }
        return './';
    },

    updateUserUI: function(profile) {
        if (!profile) return;
        const initialsEl = document.getElementById('userInitials');
        if (initialsEl && profile.nome_completo) {
            const names = profile.nome_completo.split(' ').filter(n => n.length > 2);
            let initials = names.length >= 2 ? (names[0][0] + names[names.length - 1][0]).toUpperCase() : (names[0] ? names[0][0].toUpperCase() : "?");
            initialsEl.innerText = initials;
        }
    },

    toggleMobileHub: function() {
        const hub = document.getElementById('mobile-menu-hub');
        if (hub) hub.classList.toggle('active');
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
        } catch (e) { console.warn("Supabase auth failed in sidebar."); }

        const activePage = window.location.pathname.split('/').pop();
        let navHTML = '';

        if (userRole === 'professor') {
            navHTML += this.buildSimpleCategory('Portal do Docente', this.filterItemsByRole(this.menuItems.docente, userRole), activePage, prefix);
        } else if (userRole === 'secretaria') {
            navHTML += this.buildSimpleCategory('Acessos Secretaria', this.filterItemsByRole(this.menuItems.secretaria_exclusivo, userRole), activePage, prefix);
        } else if (userRole === 'inspetor') {
            navHTML += this.buildSimpleCategory('Acessos Inspetoria', this.filterItemsByRole(this.menuItems.inspetor_exclusivo, userRole), activePage, prefix);
        } else if (['coordenador', 'diretor'].includes(userRole)) {
            navHTML += this.buildAccordion('Operacional', 'cat-oper', 'layout', this.filterItemsByRole(this.menuItems.operacional, userRole), activePage, prefix);
            navHTML += this.buildAccordion('Provas', 'cat-exam', 'clipboard-list', this.filterItemsByRole(this.menuItems.provas, userRole), activePage, prefix);
            navHTML += this.buildAccordion('Secretaria', 'cat-sec', 'users', this.filterItemsByRole(this.menuItems.secretaria, userRole), activePage, prefix);
            navHTML += this.buildAccordion('Disciplina', 'cat-disc', 'shield-alert', this.filterItemsByRole(this.menuItems.disciplina, userRole), activePage, prefix);
            navHTML += this.buildAccordion('Resultados', 'cat-res', 'bar-chart-3', this.filterItemsByRole(this.menuItems.resultados, userRole), activePage, prefix);
            navHTML += this.buildAccordion('Sistema', 'cat-sys', 'settings', this.filterItemsByRole(this.menuItems.sistema, userRole), activePage, prefix);
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
                        <span class="sidebar-text ml-3 font-bold">Encerrar Sessão</span>
                    </button>
                </div>
            </div>
        `;

        const config = this.bottomNavConfig[userRole] || this.bottomNavConfig['professor'];
        const bottomNav = document.createElement('div');
        bottomNav.className = 'bottom-nav';
        bottomNav.innerHTML = config.map(item => {
            const isActive = activePage && item.link.includes(activePage);
            return `<a href="${prefix}${item.link}" class="nav-item ${isActive ? 'active' : ''}"><i data-lucide="${item.icon}"></i><span>${item.label}</span></a>`;
        }).join('') + `<button onclick="SidebarComponent.toggleMobileHub()" class="nav-item"><i data-lucide="more-horizontal"></i><span>Menu</span></button>`;
        
        const existingNav = document.querySelector('.bottom-nav');
        if (existingNav) existingNav.remove();
        document.body.appendChild(bottomNav);

        // Renderização do Hub Mobile
        let hub = document.getElementById('mobile-menu-hub');
        if (!hub) {
            hub = document.createElement('div');
            hub.id = 'mobile-menu-hub';
            document.body.appendChild(hub);
        }
        hub.innerHTML = `
            <div class="flex justify-between items-center mb-10">
                <img src="${prefix}assets/logo-fmm-white.png" class="h-8">
                <button onclick="SidebarComponent.toggleMobileHub()" class="p-2 bg-white/10 rounded-full text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto space-y-2">
                ${navHTML}
            </div>
            <div class="pt-6 border-t border-white/10 mt-6">
                <button onclick="SidebarComponent.logout()" class="w-full flex items-center p-4 bg-red-500/20 text-red-400 rounded-2xl font-bold uppercase text-xs tracking-widest gap-3">
                    <i data-lucide="log-out" class="w-5 h-5"></i> Encerrar Sessão
                </button>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    },

    buildSimpleCategory: function(title, items, activePage, prefix) {
        return `<div class="py-2"><h4 class="px-8 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">${title}</h4>${items.map(item => this.buildLink(item, activePage, prefix)).join('')}</div>`;
    },

    buildLink: function(item, activePage, prefix) {
        const isActive = activePage && item.link && item.link.includes(activePage);
        const activeClass = isActive ? 'sidebar-item-active text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5';
        return `<a href="${prefix}${item.link || '#'}" class="sidebar-item flex items-center px-8 py-3 text-[13px] ${activeClass} transition-all relative text-left">
            <i data-lucide="${item.icon}" class="w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#c8d400]' : ''}"></i>
            <span class="sidebar-text ml-3 text-left">${item.label}</span>
        </a>`;
    },

    buildAccordion: function(title, id, iconName, items, activePage, prefix) {
        if (!items.length) return '';
        const isActive = activePage && items.some(i => i.link.includes(activePage));
        return `<div class="category-group border-b border-white/5"><button onclick="SidebarComponent.toggleCategory('${id}')" class="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 group text-left"><div class="flex items-center gap-3"><i data-lucide="${iconName}" class="w-4 h-4 text-slate-400 group-hover:text-white"></i><span class="sidebar-text text-[10px] font-black text-slate-300 uppercase tracking-widest">${title}</span></div><i data-lucide="chevron-down" class="chevron-icon w-3.5 h-3.5 text-slate-500 transition-transform ${isActive ? 'rotate-180' : ''}" id="icon-${id}"></i></button><div id="${id}" class="category-content ${isActive ? 'open' : ''}" style="max-height: ${isActive ? 'none' : '0'}">${items.map(item => this.buildLink(item, activePage, prefix)).join('')}</div></div>`;
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

    logout: async function() {
        if (confirm("Deseja realmente encerrar a sessão?")) {
            if (window.supabaseClient) await window.supabaseClient.auth.signOut();
            window.location.href = this.getRelativePrefix() + "index.html";
        }
    },

    filterItemsByRole: function(items, role) { return items ? items.filter(item => item.roles && item.roles.includes(role)) : []; }
};

window.SidebarComponent = SidebarComponent;