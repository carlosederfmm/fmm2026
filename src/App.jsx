function App() {
  const { useEffect, useRef } = React;
  const emailRef = useRef(null);
  const passRef = useRef(null);
  const mobileEmailRef = useRef(null);
  const mobilePassRef = useRef(null);
  const submitDesktopRef = useRef(null);
  const submitMobileRef = useRef(null);

  useEffect(() => {
    // Initialize icons (lucide) after render
    if (window.lucide) window.lucide.createIcons();

    // Expose showToast globally for other legacy modules if needed
    window.showToast = showToast;

    // Register service worker similar to original behavior
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('PWA Service Worker Ativo'))
          .catch(err => console.log('Erro SW:', err));
      });
    }
  }, []);

  function showToast(text, type = 'info') {
    const toast = document.getElementById('toast');
    const iconContainer = document.getElementById('toastIconContainer');
    const toastText = document.getElementById('toastText');
    if (!toast || !iconContainer || !toastText) return;

    toastText.innerText = text;
    if (type === 'error') {
      iconContainer.innerHTML = '<i data-lucide="alert-circle" class="w-5 h-5"></i>';
      iconContainer.className = "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-red-500/20 text-red-500";
    } else {
      iconContainer.innerHTML = '<i data-lucide="check-circle" class="w-5 h-5"></i>';
      iconContainer.className = "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-fmm-lime/20 text-fmm-lime";
    }

    toast.classList.remove('hidden');
    toast.style.display = 'flex';
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      toast.classList.add('hidden');
      toast.style.display = 'none';
    }, 4000);
  }

  async function handleAuth(e, email, password, btn) {
    e && e.preventDefault();
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Aguarde...';

    try {
      const { data: authData, error: authError } = await window.supabaseClient.auth.signInWithPassword({ email, password });
      if (authError) throw new Error('E-mail ou senha incorretos.');

      const { data: perfil, error: perfError } = await window.supabaseClient
        .from('perfis').select('cargo').eq('id', authData.user.id).maybeSingle();

      if (perfError || !perfil) throw new Error('Perfil não localizado.');

      const destinos = {
        'diretor': 'coordenador/operacional/dashboard_coordenador.html',
        'coordenador': 'coordenador/operacional/dashboard_coordenador.html',
        'professor': 'professor/dashboard_professor.html',
        'orientador': 'orientador/dashboard_orientador.html',
        'secretaria': 'secretaria/dashboard_secretaria.html',
        'inspetor': 'inspetor/dashboard_inspetor.html',
        'counselor': 'counselor/dashboard_counselor.html'
      };

      const cargo = perfil.cargo ? perfil.cargo.toLowerCase() : '';
      const urlDestino = destinos[cargo] || 'coordenador/operacional/dashboard_coordenador.html';

      showToast('Acesso autorizado!');
      setTimeout(() => window.location.href = urlDestino, 800);

    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = originalContent;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function onSubmitDesktop(e) {
    const email = emailRef.current.value;
    const pass = passRef.current.value;
    const btn = submitDesktopRef.current;
    handleAuth(e, email, pass, btn);
  }

  function onSubmitMobile(e) {
    const email = mobileEmailRef.current.value;
    const pass = mobilePassRef.current.value;
    const btn = submitMobileRef.current;
    handleAuth(e, email, pass, btn);
  }

  return (
    <>
      {/* Desktop viewport */}
      <div id="desktop-container" className="hidden md:flex bg-fmm-dark min-h-screen items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-fmm-blue rounded-full filter blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fmm-lime rounded-full filter blur-[120px] opacity-10 translate-x-1/2 translate-y-1/2"></div>

        <div className="w-full max-w-md z-10 animate-slide-up">
          <div className="glass-effect p-10 rounded-[40px] shadow-2xl border border-white/20">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="bg-fmm-dark p-4 rounded-3xl mb-4 shadow-xl border border-white/5">
                <img src="assets/logo-fmm-white.png" alt="FMM Logo" className="h-10" onError={(e)=> e.currentTarget.src='https://ui-avatars.com/api/?name=FMM&background=003c5b&color=fff&size=128'} />
              </div>
              <h1 className="text-2xl font-bold text-fmm-dark tracking-tight">Bem-vindo de volta</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">SME Matias Machline 2026</p>
            </div>

            <form id="loginFormDesktop" className="space-y-5" onSubmit={onSubmitDesktop}>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">E-mail Institucional</label>
                <div className="relative group">
                  <i data-lucide="mail" className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-fmm-blue transition-colors"></i>
                  <input type="email" id="loginEmail" ref={emailRef} required placeholder="usuario@fmm.org.br" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-fmm-blue transition-all font-medium" />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                  <a href="#" className="text-[10px] font-black text-fmm-blue uppercase tracking-widest hover:underline">Esqueci a senha</a>
                </div>
                <div className="relative group">
                  <i data-lucide="lock" className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-fmm-blue transition-colors"></i>
                  <input type="password" id="loginPassword" ref={passRef} required placeholder="••••••••" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-fmm-blue transition-all font-medium" />
                </div>
              </div>

              <div className="flex items-center justify-between px-2 text-left">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" id="keepConnected" className="w-4 h-4 rounded border-slate-200 text-fmm-blue focus:ring-fmm-blue transition-all" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-slate-600 transition-colors">Manter conectado</span>
                </label>
              </div>

              <button type="submit" id="submitBtnDesktop" ref={submitDesktopRef} className="w-full bg-fmm-blue hover:bg-fmm-dark text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-fmm-blue/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4 uppercase tracking-widest">
                <span>Entrar no Sistema</span>
                <i data-lucide="arrow-right" className="w-4 h-4"></i>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Acesso Restrito a Colaboradores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile viewport */}
      <div id="mobile-container" className="block md:hidden bg-white dark:bg-background-dark text-slate-900 dark:text-white mobile-height">
        <div className="max-w-md mx-auto min-h-scree">
          <div className="relative w-full h-[45vh] overflow-hidden">
            <img alt="tela_inicial" className="w-full h-full object-cover" src="assets/tela_inicial.JPG" />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <div className="relative -mt-12 flex-1 bg-background-light dark:bg-slate-900 rounded-t-[40px] px-8 pt-8 pb-10 shadow-2xl flex flex-col items-center">
            <div className="bg-secondary rounded-2xl px-6 py-3 mb-8 flex items-center justify-center gap-3">
              <img alt="Logo FMM" className="h-8" src="assets/logo-fmm-white.png" />
            </div>
            <div className="text-center mb-8">
              <h1 className="text-secondary dark:text-blue-400 text-3xl font-bold mb-1">Bem-vindo de Volta</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Acesse sua conta institucional</p>
            </div>
            <form id="loginFormMobile" className="w-full space-y-5 text-left" onSubmit={onSubmitMobile}>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 ml-1 tracking-widest uppercase">E-mail Institucional</label>
                <div className="relative">
                  <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail_outline</span>
                  <input id="mobileEmail" ref={mobileEmailRef} className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary shadow-sm" placeholder="usuario@fmm.org.br" type="email" required />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">Senha</label>
                  <a className="text-[10px] font-bold text-primary dark:text-blue-400 tracking-tight hover:underline" href="#">Recuperar Senha</a>
                </div>
                <div className="relative">
                  <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_open</span>
                  <input id="mobilePassword" ref={mobilePassRef} className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary shadow-sm" placeholder="digite sua senha" type="password" required />
                </div>
              </div>
              <button id="submitBtnMobile" ref={submitMobileRef} className="w-full h-14 bg-primary hover:bg-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 mt-4 uppercase tracking-widest" type="submit">
                <span>Acessar Sistema</span>
                <span className="material-icons-outlined text-xl">login</span>
              </button>
            </form>
            <div className="mt-auto pt-10 text-center space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-600 tracking-widest uppercase">Acesso restrito ao staff acadêmico</p>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400/80 dark:text-slate-700">Sistema de Gestão Escolar © FMM 2026</p>
                <p className="text-[10px] text-slate-400/80 dark:text-slate-700">Equipe de Inteligência Educacional</p>
              </div>
            </div>
          </div>
          <div className="h-1.5 w-32 bg-slate-300 dark:bg-slate-700 mx-auto rounded-full mb-2"></div>
        </div>
      </div>

      {/* Toast (global) */}
      <div id="toast" className="hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900 text-white p-5 rounded-3xl shadow-2xl flex items-center gap-4 animate-slide-up z-[100] border border-white/10">
        <div id="toastIconContainer" className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <i id="toastIcon" className="w-5 h-5"></i>
        </div>
        <div className="flex flex-col text-left">
          <span id="toastTitle" className="text-[10px] font-black uppercase tracking-widest opacity-60">Mensagem do Sistema</span>
          <p id="toastText" className="text-xs font-bold"></p>
        </div>
      </div>
    </>
  );
}

export default App;
