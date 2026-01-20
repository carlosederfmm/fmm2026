/**
 * Componente de Sidebar Reutilizável SME FMM 2026
 * Versão Consolidada: Suporte a GitHub Pages, Multi-nível e Multi-cargo.
 */
const SidebarComponent = {
    // Configuração de todos os itens de menu do sistema
    menuItems: {
        principal: [
            { label: 'Dashboard', icon: 'pie-chart', link: 'coordenador/principal/dashboard_coordenador.html', roles: ['coordenador', 'diretor', 'orientador'] },
            { label: 'Tarefas (Scrum)', icon: 'check-square', link: 'coordenador/principal/tarefas_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Meu Perfil', icon: 'user-circle', link: 'coordenador/principal/perfil_coordenador.html', roles: ['coordenador', 'diretor', 'orientador'] }
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
            { label: 'Sanções', icon: 'shield-alert', link: 'coordenador/pedagogico/sancoes_coordenador.html', roles: ['diretor', 'coordenador', 'orientador'] },
            { label: 'Atendimentos', icon: 'message-square', link: 'coordenador/pedagogico/atendimentos_coordenador.html', roles: ['diretor', 'coordenador', 'orientador'] },
            { label: 'Saídas', icon: 'log-out', link: 'coordenador/pedagogico/saidas_coordenador.html', roles: ['diretor', 'coordenador'] },
            { label: 'Atrasos', icon: 'clock', link: 'coordenador/pedagogico/atrasos_coordenador.html', roles: ['diretor', 'coordenador'] }
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
            { label: 'Meu Perfil', icon: 'user-cog', link: 'professor/perfil_professor.html', roles: ['professor'] }
        ]
    },

    // Detecta a profundidade da pasta atual para ajustar links (GitHub Pages fix)
    getRelativePrefix: function() {
        const path = window.location.pathname;
        // Se houver duas subpastas após a raiz (ex: /coordenador/notas/)
        if (path.includes('/notas/') || path.includes('/pedagogico/') || path.includes('/administrativo/') || path.includes('/principal/')) {
            return '../../';
        }
        // Se houver uma subpasta (ex: /professor/ ou /coordenador/)
        if (path.includes('/professor/') || path.includes('/coordenador/')) {
            return '../';
        }
        return './';
    },

    render: async function(containerId) {
        const prefix = this.getRelativePrefix();
        const container = document.getElementById(containerId);
        if (!container) return;

        // 1. Obter cargo do usuário para filtrar menus
        let userRole = 'professor'; // Default seguro
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (user) {
                const { data: profile } = await window.supabaseClient.from('perfis').select('cargo').eq('id', user.id).single();
                userRole = profile?.cargo?.toLowerCase() || 'professor';
            }
        } catch (e) { console.error("Erro ao identificar cargo para sidebar."); }

        const activePage = window.location.pathname.split('/').pop();
        let navHTML = '';

        if (userRole === 'professor') {
            navHTML += this.buildSimpleCategory('Portal do Docente', this.menuItems.docente, activePage, prefix);
        } else {
            // Lógica de Coordenador/Diretor com Acordeão
            navHTML += this.buildAccordion('Principal', 'cat-principal', 'layout', this.menuItems.principal, activePage, prefix);
            navHTML += this.buildAccordion('Administrativo', 'cat-adm', 'settings', this.menuItems.administrativo, activePage, prefix);
            navHTML += this.buildAccordion('Pedagógico', 'cat-ped', 'heart-handshake', this.menuItems.pedagogico, activePage, prefix);
            navHTML += this.buildAccordion('Notas', 'cat-notas', 'bar-chart-3', this.menuItems.notas, activePage, prefix);
        }

        container.innerHTML = `
            <div class="flex flex-col h-full overflow-hidden bg-fmm-dark">
                <!-- Header Sidebar -->
                <div class="p-6 h-24 border-b border-white/5 flex items-center justify-center relative flex-shrink-0">
                    <img src="${prefix}assets/logo-fmm-white.png" alt="FMM" class="logo-full h-10 object-contain" onerror="this.src='https://ui-avatars.com/api/?name=FMM&background=003c5b&color=fff'">
                    <div class="logo-short font-black text-2xl text-fmm-lime hidden">M</div>
                    
                    <button onclick="SidebarComponent.toggleSidebar()" class="absolute -right-3 top-20 bg-fmm-lime text-fmm-dark rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-50">
                        <i id="sidebar-toggle-icon" data-lucide="chevron-left" class="w-4 h-4"></i>
                    </button>
                </div>

                <!-- Navegação -->
                <nav class="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    ${navHTML}
                </nav>

                <!-- Logout -->
                <div class="p-4 border-t border-white/5 flex-shrink-0">
                    <button onclick="SidebarComponent.logout()" class="sidebar-item w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all group">
                        <i data-lucide="log-out" class="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform"></i>
                        <span class="sidebar-text ml-3 font-bold">Sair do Sistema</span>
                    </button>
                </div>
            </div>
        `;
        
        lucide.createIcons();
    },

    buildSimpleCategory: function(title, items, activePage, prefix) {
        return `
            <div class="mb-6">
                <p class="sidebar-category px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">${title}</p>
                ${items.map(item => this.buildLink(item, activePage, prefix)).join('')}
            </div>
        `;
    },

    buildAccordion: function(title, id, iconName, items, activePage, prefix) {
        const isOpen = items.some(i => i.link.includes(activePage));
        const contentClass = isOpen ? 'category-content open' : 'category-content';
        const iconRotate = isOpen ? 'rotate-180' : '';

        return `
            <div class="category-group">
                <button onclick="SidebarComponent.toggleCategory('${id}')" class="sidebar-category-header w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all border-b border-white/5">
                    <div class="flex items-center gap-3">
                        <i data-lucide="${iconName}" class="w-4 h-4 text-slate-400"></i>
                        <span class="sidebar-text text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">${title}</span>
                    </div>
                    <i data-lucide="chevron-down" class="chevron-icon w-3.5 h-3.5 text-slate-500 transition-transform ${iconRotate}" id="icon-${id}"></i>
                </button>
                <div id="${id}" class="${contentClass}">
                    ${items.map(item => this.buildLink(item, activePage, prefix)).join('')}
                </div>
            </div>
        `;
    },

    buildLink: function(item, activePage, prefix) {
        const isActive = item.link.includes(activePage);
        const activeClass = isActive ? 'sidebar-item-active text-white' : 'text-slate-400 hover:text-white hover:bg-white/5';
        
        return `
            <a href="${prefix}${item.link}" class="sidebar-item flex items-center px-8 py-3 text-[13px] ${activeClass} transition-all">
                <i data-lucide="${item.icon}" class="w-4 h-4 flex-shrink-0"></i>
                <span class="sidebar-text ml-3 font-medium">${item.label}</span>
            </a>
        `;
    },

    toggleCategory: function(id) {
        const target = document.getElementById(id);
        const icon = document.getElementById(`icon-${id}`);
        if (!target) return;

        const isOpening = !target.classList.contains('open');
        
        // Opcional: Fecha outros acordeões (estilo sanfona)
        if (isOpening) {
            document.querySelectorAll('.category-content.open').forEach(c => {
                c.classList.remove('open');
                const otherIcon = document.getElementById(`icon-${c.id}`);
                if (otherIcon) otherIcon.classList.remove('rotate-180');
            });
        }

        target.classList.toggle('open');
        if (icon) icon.classList.toggle('rotate-180');
    },

    toggleSidebar: function() {
        const body = document.body;
        const icon = document.getElementById('sidebar-toggle-icon');
        body.classList.toggle('sidebar-collapsed');
        
        const isCollapsed = body.classList.contains('sidebar-collapsed');
        if (icon) {
            icon.setAttribute('data-lucide', isCollapsed ? 'chevron-right' : 'chevron-left');
            lucide.createIcons();
        }
    },

    logout: async function() {
        if (confirm("Deseja realmente sair do sistema?")) {
            const prefix = this.getRelativePrefix();
            if (window.supabaseClient) await window.supabaseClient.auth.signOut();
            sessionStorage.clear();
            window.location.href = prefix + "index.html";
        }
    }
};

// Estilos dinâmicos para suportar o modo colapsado e animações
if (!document.getElementById('sidebar-dynamic-styles')) {
    const style = document.createElement('style');
    style.id = 'sidebar-dynamic-styles';
    style.innerHTML = `
        .sidebar-collapsed #sidebar-container { width: 80px !important; }
        .sidebar-collapsed .sidebar-text, 
        .sidebar-collapsed .sidebar-category,
        .sidebar-collapsed .sidebar-category-header .chevron-icon { display: none !important; }
        .sidebar-collapsed .logo-full { display: none; }
        .sidebar-collapsed .logo-short { display: block !important; }
        .sidebar-collapsed .sidebar-item { justify-content: center; padding-left: 0; padding-right: 0; }
        .sidebar-collapsed .sidebar-category-header { justify-content: center; }
        
        /* Força ícones a aparecerem quando minimizado mesmo com acordeão fechado */
        .sidebar-collapsed .category-content { 
            max-height: none !important; 
            display: flex !important; 
            flex-direction: column;
            overflow: visible !important;
        }
        .sidebar-collapsed .category-content .sidebar-item .sidebar-text { display: none !important; }
        
        .sidebar-item-active {
            background-color: rgba(200, 212, 0, 0.15) !important;
            border-left: 4px solid #c8d400 !important;
        }
    `;
    document.head.appendChild(style);
}