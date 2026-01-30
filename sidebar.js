/**
 * Componente de Sidebar Reutilizável SME FMM 2026
 * Versão Ultra-Robusta: À prova de falhas de conexão e RLS.
 */
const SidebarComponent = {
    // Configuração de todos os itens de menu
    menuItems: {
        principal: [
            { label: 'Dashboard', icon: 'pie-chart', link: 'coordenador/principal/dashboard_coordenador.html', roles: ['coordenador', 'diretor', 'orientador'] },
            { label: 'Tarefas (Scrum)', icon: 'check-square', link: 'coordenador/principal/tarefas_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Requerimentos', icon: 'inbox', link: 'coordenador/principal/requerimentos.html', roles: ['coordenador', 'diretor'], badge: true }, // NOVA TELA
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

    getRelativePrefix: function() {
        const path = window.location.pathname;
        // Ajuste conforme a estrutura de pastas do seu projeto
        // Se estivermos em uma subpasta profunda (ex: /coordenador/administrativo/)
        if (path.includes('/notas/') || path.includes('/pedagogico/') || path.includes('/administrativo/') || path.includes('/principal/')) {
            return '../../';
        }
        // Se estivermos em uma subpasta rasa (ex: /professor/ ou /coordenador/ na raiz se houver)
        if (path.includes('/professor/') || (path.includes('/coordenador/') && !path.includes('/', path.indexOf('/coordenador/') + 13))) {
            return '../';
        }
        // Raiz
        return './';
    },

    render: async function(containerId) {
        console.log("SME FMM: Renderizando Sidebar...");
        const prefix = this.getRelativePrefix();
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container #${containerId} não encontrado.`);
            return;
        }

        // 1. Tentar obter cargo, mas com timeout e fallback
        let userRole = 'professor'; 
        try {
            if (window.supabaseClient) {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (user) {
                    // Tenta pegar o perfil. Se falhar (ex: RLS bloqueando), assume professor ou carrega do cache se tiver
                    const { data: profile, error } = await window.supabaseClient
                        .from('perfis')
                        .select('cargo')
                        .eq('id', user.id)
                        .maybeSingle();
                    
                    if (!error && profile) {
                         userRole = profile.cargo?.toLowerCase() || 'professor';
                    } else {
                        console.warn("Perfil não carregado, usando role padrão ou cache.", error);
                        // Aqui poderia ter uma lógica de fallback de cache se necessário
                    }
                }
            }
        } catch (e) { 
            console.warn("Falha ao buscar cargo no banco. Usando visão padrão 'professor'.", e);
        }

        const activePage = window.location.pathname.split('/').pop();
        let navHTML = '';

        if (userRole === 'professor') {
            navHTML += this.buildSimpleCategory('Portal do Docente', this.menuItems.docente, activePage, prefix);
        } else {
            navHTML += this.buildAccordion('Principal', 'cat-principal', 'layout', this.menuItems.principal, activePage, prefix);
            navHTML += this.buildAccordion('Administrativo', 'cat-adm', 'settings', this.menuItems.administrativo, activePage, prefix);
            navHTML += this.buildAccordion('Pedagógico', 'cat-ped', 'heart-handshake', this.menuItems.pedagogico, activePage, prefix);
            navHTML += this.buildAccordion('Notas', 'cat-notas', 'bar-chart-3', this.menuItems.notas, activePage, prefix);
        }

        container.innerHTML = `
            <div class="flex flex-col h-full overflow-hidden bg-[#003c5b]">
                <div class="p-6 h-24 border-b border-white/5 flex items-center justify-center relative flex-shrink-0">
                    <img src="${prefix}assets/logo-fmm-white.png" alt="FMM" class="logo-full h-10 object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
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
        
        if (window.lucide) {
            lucide.createIcons();
        } else {
            console.error("Lucide não carregado corretamente.");
        }

        // Restaurar estado do menu (categorias abertas)
        this.restoreSidebarState();
    },

    buildSimpleCategory: function(title, items, activePage, prefix) {
        // Filtra itens baseados em roles se necessário (aqui assumimos que a lista já é filtrada pelo userRole macro)
        return `
            <div class="mb-6">
                <p class="sidebar-category px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">${title}</p>
                ${items.map(item => this.buildLink(item, activePage, prefix)).join('')}
            </div>
        `;
    },

    buildAccordion: function(title, id, iconName, items, activePage, prefix) {
        // Verifica se algum item dentro desta categoria está ativo para abrir o accordion por padrão
        const isOpen = items.some(i => i.link.includes(activePage));
        const contentClass = isOpen ? 'category-content open' : 'category-content';
        const iconRotate = isOpen ? 'rotate-180' : '';

        return `
            <div class="category-group">
                <button onclick="SidebarComponent.toggleCategory('${id}')" class="sidebar-category-header w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all border-b border-white/5 text-left group">
                    <div class="flex items-center gap-3">
                        <i data-lucide="${iconName}" class="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"></i>
                        <span class="sidebar-text text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-white transition-colors">${title}</span>
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
        const activeClass = isActive ? 'sidebar-item-active text-white bg-white/5 border-r-4 border-[#c8d400]' : 'text-slate-400 hover:text-white hover:bg-white/5';
        
        return `
            <a href="${prefix}${item.link}" class="sidebar-item flex items-center px-8 py-3 text-[13px] ${activeClass} transition-all relative">
                <i data-lucide="${item.icon}" class="w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#c8d400]' : ''}"></i>
                <span class="sidebar-text ml-3 font-medium">${item.label}</span>
                ${item.badge ? `<span class="absolute right-4 w-2 h-2 rounded-full bg-red-500 sidebar-text"></span>` : ''}
            </a>
        `;
    },

    toggleCategory: function(id) {
        const target = document.getElementById(id);
        const icon = document.getElementById(`icon-${id}`);
        
        // Se estiver colapsado, expande a sidebar primeiro para melhor UX
        const body = document.body;
        if (body.classList.contains('sidebar-collapsed')) {
            this.toggleSidebar();
        }

        if (!target) return;
        
        // Toggle classe para animação CSS
        if (target.classList.contains('open')) {
            target.classList.remove('open');
            target.style.maxHeight = null; // Para transição funcionar
            if (icon) icon.classList.remove('rotate-180');
            this.saveCategoryState(id, false);
        } else {
            target.classList.add('open');
            target.style.maxHeight = target.scrollHeight + "px"; // Define altura explícita para animação
            if (icon) icon.classList.add('rotate-180');
            this.saveCategoryState(id, true);
        }
    },

    toggleSidebar: function() {
        const body = document.body;
        const icon = document.getElementById('sidebar-toggle-icon');
        body.classList.toggle('sidebar-collapsed');
        
        if (icon && window.lucide) {
            const isCollapsed = body.classList.contains('sidebar-collapsed');
            icon.setAttribute('data-lucide', isCollapsed ? 'chevron-right' : 'chevron-left');
            lucide.createIcons();
        }
    },

    logout: async function() {
        if (confirm("Deseja realmente sair?")) {
            const prefix = this.getRelativePrefix();
            if (window.supabaseClient) await window.supabaseClient.auth.signOut();
            sessionStorage.clear();
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
        Object.keys(state).forEach(id => {
            if (state[id]) {
                const content = document.getElementById(id);
                const icon = document.getElementById(`icon-${id}`);
                if (content) {
                    content.classList.add('open');
                    content.style.maxHeight = "none"; // Deixa fluir, ou use scrollHeight se preferir animar no load
                    if (icon) icon.classList.add('rotate-180');
                }
            }
        });
    }
};

// EXPORTAÇÃO EXPLICITA PARA O OBJETO WINDOW (FIX PARA NÃO CARREGAMENTO)
window.SidebarComponent = SidebarComponent;

// Injetar estilos base caso não existam
if (!document.getElementById('sidebar-core-styles')) {
    const style = document.createElement('style');
    style.id = 'sidebar-core-styles';
    style.innerHTML = `
        .category-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
        .category-content.open { max-height: 1000px; /* Valor alto seguro */ }
        .sidebar-item-active { background-color: rgba(255, 255, 255, 0.05); }
        .sidebar-collapsed #sidebar-container { width: 80px !important; }
        .sidebar-collapsed .sidebar-text, .sidebar-collapsed .chevron-icon { display: none !important; }
        .sidebar-collapsed .logo-full { display: none; }
        .sidebar-collapsed .logo-short { display: block !important; }
        /* Ajuste fino para os ícones quando colapsado */
        .sidebar-collapsed .sidebar-item { justify-content: center; padding-left: 0; padding-right: 0; }
        .sidebar-collapsed .sidebar-category-header { justify-content: center; padding-left: 0; padding-right: 0; }
        .sidebar-collapsed .sidebar-category-header i:first-child { margin: 0; }
    `;
    document.head.appendChild(style);
}