const SidebarComponent = {
    // Configuração dos Links com caminhos relativos ajustáveis
    // O 'basePath' ajuda a definir onde estão os arquivos em relação à raiz
    menuItems: {
        principal: [
            { label: 'Dashboard', icon: 'pie-chart', link: '../principal/dashboard_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Tarefas (Scrum)', icon: 'check-square', link: '../principal/tarefas_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Meu Perfil', icon: 'user-circle', link: '../principal/perfil_coordenador.html', roles: ['coordenador', 'diretor'] }
        ],
        administrativo: [
            { label: 'Usuários / Staff', icon: 'shield-check', link: '../administrativo/usuarios_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Professores', icon: 'graduation-cap', link: '../administrativo/professor_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Alunos', icon: 'users-2', link: '../administrativo/alunos_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Disciplinas', icon: 'book-open', link: '../administrativo/disciplinas_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Turmas', icon: 'library', link: '../administrativo/turmas_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Enturmação', icon: 'user-plus', link: '../administrativo/enturmacao_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Grade Horária', icon: 'calendar-range', link: '../administrativo/grade_coordenador.html', roles: ['coordenador', 'diretor'] }
        ],
        pedagogico: [
            { label: 'Sanções', icon: 'shield-alert', link: '../pedagogico/sancoes_coordenador.html', roles: ['coordenador', 'diretor', 'orientador'] },
            { label: 'Atendimentos', icon: 'message-square', link: '../pedagogico/atendimentos_coordenador.html', roles: ['coordenador', 'diretor', 'orientador'] },
            { label: 'Saídas', icon: 'log-out', link: '../pedagogico/saidas_coordenador.html', roles: ['coordenador', 'diretor', 'orientador'] },
            { label: 'Atrasos', icon: 'clock', link: '../pedagogico/atrasos_coordenador.html', roles: ['coordenador', 'diretor', 'orientador'] },
            { label: 'Orientação', icon: 'navigation', link: '../pedagogico/orientacao_coordenador.html', roles: ['coordenador', 'diretor', 'orientador'] }
        ],
        notas: [
            { label: 'Boletim Individual', icon: 'user', link: '../notas/boletim_coordenador.html', roles: ['coordenador', 'diretor'] },
            { label: 'Mapa Geral', icon: 'grid', link: '../notas/mapa_coordenador.html', roles: ['coordenador', 'diretor'] }
        ],
        // Menu específico do Professor (caminhos absolutos ou relativos à raiz do professor)
        docente: [
            { label: 'Dashboard', icon: 'layout-dashboard', link: '../../professor/dashboard_professor.html', roles: ['professor'] },
            { label: 'Meu Perfil', icon: 'user-circle', link: '../../professor/perfil_professor.html', roles: ['professor']  },
            { label: 'Presença', icon: 'calendar-check', link: '../../professor/presenca_professor.html', roles: ['professor'] },
            { label: 'Lançar Notas', icon: 'graduation-cap', link: '../../professor/notas_professor.html', roles: ['professor'] },
            { label: 'Lançar Conteúdo', icon: 'book', link:'../../professor/conteudo_professor.html', roles: ['professor'] },
            { label: 'Gestão Individual', icon: 'user-search', link: '../../professor/individual_professor.html', roles: ['professor'] }
        ]
    },

    render: async function(containerId) {
        // 1. Verificar Usuário (Supabase deve estar disponível globalmente)
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return; 
        
        const { data: profile } = await supabaseClient.from('perfis').select('cargo').eq('id', user.id).single();
        const userRole = profile.cargo.toLowerCase();
        
        // 2. Determinar quais menus mostrar
        const isProfessor = userRole === 'professor';
        
        // Determina a página ativa pelo nome do arquivo
        const pathParts = window.location.pathname.split('/');
        const activePage = pathParts[pathParts.length - 1];

        let navHTML = '';

        if (isProfessor) {
            navHTML += this.buildCategory('Portal do Docente', 'cat-docente', 'layout', this.menuItems.docente, activePage, true);
        } else {
            // Lógica de Acordeão para Coordenador
            const isOpenPrincipal = this.menuItems.principal.some(i => i.link.includes(activePage));
            const isOpenAdm = this.menuItems.administrativo.some(i => i.link.includes(activePage));
            const isOpenPed = this.menuItems.pedagogico.some(i => i.link.includes(activePage));
            const isOpenNotas = this.menuItems.notas.some(i => i.link.includes(activePage));

            navHTML += this.buildAccordion('Principal', 'cat-principal', 'layout', this.menuItems.principal, activePage, isOpenPrincipal || (!isOpenAdm && !isOpenPed && !isOpenNotas));
            navHTML += this.buildAccordion('Administrativo', 'cat-adm', 'settings', this.menuItems.administrativo, activePage, isOpenAdm);
            navHTML += this.buildAccordion('Pedagógico', 'cat-ped', 'heart-handshake', this.menuItems.pedagogico, activePage, isOpenPed);
            navHTML += this.buildAccordion('Notas', 'cat-notas', 'bar-chart-3', this.menuItems.notas, activePage, isOpenNotas);
        }

        // 3. Montar o HTML completo
        // Ajuste o caminho da logo conforme a profundidade da pasta. 
        // Se estiver em coordenador/principal/dashboard.html, a logo está em ../../assets/
        // Vamos tentar detectar a profundidade ou usar um caminho relativo seguro.
        const logoPath = '../../assets/logo-fmm-white.png'; 

        const sidebarHTML = `
            <button onclick="SidebarComponent.toggleSidebar()" class="absolute -right-3 top-20 bg-fmm-lime text-fmm-dark rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-50">
                <i data-lucide="chevron-left" class="w-4 h-4" id="toggle-icon"></i>
            </button>

            <div class="p-6 h-24 flex items-center justify-center border-b border-white/5">
                <img src="${logoPath}" alt="FMM" class="logo-full h-10 object-contain">
                <div class="logo-short font-bold text-2xl text-fmm-lime hidden">M</div>
            </div>

            <nav class="flex-1 overflow-y-auto py-4 px-0 space-y-0 custom-scrollbar">
                ${navHTML}
            </nav>

            <div class="p-4 border-t border-white/5">
                <button onclick="SidebarComponent.logout()" class="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                    <i data-lucide="log-out" class="w-4 h-4 flex-shrink-0"></i>
                    <span class="sidebar-text ml-3 font-bold">Sair do Sistema</span>
                </button>
            </div>
        `;

        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = sidebarHTML;
            
            // Re-inicializar ícones Lucide após injetar HTML
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    },

    buildAccordion: function(title, id, iconName, items, activePage, isOpen) {
        const contentClass = isOpen ? 'category-content open' : 'category-content';
        const iconClass = isOpen ? 'chevron-icon w-3.5 h-3.5 text-slate-500 rotate-180' : 'chevron-icon w-3.5 h-3.5 text-slate-500';
        
        let linksHTML = items.map(item => {
            // Verifica se o link contém a página ativa (para lidar com ../caminhos)
            const isActive = item.link.includes(activePage);
            const activeClass = isActive ? 'sidebar-item-active text-white' : 'text-slate-400 hover:text-white';
            
            return `
                <a href="${item.link}" class="sidebar-item flex items-center px-8 py-2.5 text-[13px] ${activeClass} transition-all">
                    <i data-lucide="${item.icon}" class="w-4 h-4 flex-shrink-0"></i>
                    <span class="sidebar-text ml-3">${item.label}</span>
                </a>
            `;
        }).join('');

        return `
            <div class="category-group border-b border-white/5 last:border-0">
                <button onclick="SidebarComponent.toggleCategory('${id}')" class="sidebar-category-header w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all">
                    <div class="flex items-center gap-3">
                        <i data-lucide="${iconName}" class="w-4 h-4 text-${title === 'Principal' ? 'fmm-lime' : 'slate-400'}"></i>
                        <span class="sidebar-category-title text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">${title}</span>
                    </div>
                    <i data-lucide="chevron-down" class="${iconClass}" id="icon-${id}"></i>
                </button>
                <div id="${id}" class="${contentClass} bg-black/20">
                    <div class="py-2">
                        ${linksHTML}
                    </div>
                </div>
            </div>
        `;
    },

    // Para o menu do professor que não usa acordeão necessariamente, mas vamos padronizar
    buildCategory: function(title, id, iconName, items, activePage, isOpen) {
       return this.buildAccordion(title, id, iconName, items, activePage, true);
    },
    
    toggleCategory: function(id) {
        const contents = document.querySelectorAll('.category-content');
        const icons = document.querySelectorAll('.chevron-icon');
        const target = document.getElementById(id);
        const targetIcon = document.getElementById(`icon-${id}`);

        if (!target) return;

        const isClosing = target.classList.contains('open');

        // Minimiza todas as outras (Acordeão Exclusivo)
        contents.forEach(c => c.classList.remove('open'));
        icons.forEach(i => i.classList.remove('rotate-180'));

        // Se a selecionada estava fechada, ela expande
        if (!isClosing) {
            target.classList.add('open');
            if (targetIcon) targetIcon.classList.add('rotate-180');
        }
    },

    toggleSidebar: function() {
        const s = document.getElementById('sidebar-container');
        const icon = document.getElementById('toggle-icon');
        if (!s) return;

        s.classList.toggle('w-72'); 
        s.classList.toggle('w-20');
        s.classList.toggle('sidebar-collapsed');
        
        const isCollapsed = s.classList.contains('sidebar-collapsed');
        if (icon) {
            icon.setAttribute('data-lucide', isCollapsed ? 'chevron-right' : 'chevron-left');
            if (window.lucide) window.lucide.createIcons();
        }
        
        // Disparar evento de resize para gráficos ou calendários ajustarem
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 300);
    },

    logout: async function() {
        if(confirm("Deseja sair do sistema?")) {
            await supabaseClient.auth.signOut();
            // Ajuste o caminho de volta para o login
            window.location.href = "../../index.html"; 
        }
    }
};

// Expor globalmente
window.SidebarComponent = SidebarComponent;