/**
 * CONFIGURAÇÃO GLOBAL DO CLIENTE SUPABASE - SME FMM
 * Sprint 3 | Task 3.2.2: Localização de Tempo (Manaus)
 * * Centraliza a conexão e helpers de data para evitar inconsistências de fuso horário.
 */

const supabaseUrl = 'https://panxfescmzjdltthreqy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhbnhmZXNjbXpqZGx0dGhyZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNTA5NDMsImV4cCI6MjA4MjYyNjk0M30.jSZVhw2TFD52zRV4NZUGUeXKBHedWXcdH7w_fXeoGhA';

const supabaseOptions = {
    global: {
        headers: {
            'Time-Zone': 'America/Manaus' 
        }
    },
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
};

// Inicialização do Cliente
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, supabaseOptions);

/**
 * Utilitário de Tempo e Data SME FMM
 * Resolve problemas de offset entre Navegador e Banco de Dados.
 */
const ManausTime = {
    // Opções base para formatação consistente
    baseOptions: { timeZone: 'America/Manaus' },

    /**
     * Retorna a data atual ou objeto Date convertido para string YYYY-MM-DD
     * Útil para filtros de query e valores de <input type="date">
     */
    toISODate: (dateOrStr = new Date()) => {
        const d = typeof dateOrStr === 'string' ? new Date(dateOrStr) : dateOrStr;
        // Formata para local e extrai partes para evitar deslocamento UTC
        const fmt = new Intl.DateTimeFormat('fr-CA', { // fr-CA usa YYYY-MM-DD
            ...ManausTime.baseOptions,
            year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(d);
        return fmt;
    },

    /**
     * Formata para exibição simples (DD/MM/YYYY)
     */
    format: (dateOrStr) => {
        if (!dateOrStr) return '--/--/----';
        const d = typeof dateOrStr === 'string' ? new Date(dateOrStr) : dateOrStr;
        return new Intl.DateTimeFormat('pt-BR', {
            ...ManausTime.baseOptions,
            day: '2-digit', month: '2-digit', year: 'numeric'
        }).format(d);
    },

    /**
     * Formata para exibição completa (Ex: sexta-feira, 16 de janeiro de 2026)
     */
    formatFull: (dateOrStr = new Date()) => {
        const d = typeof dateOrStr === 'string' ? new Date(dateOrStr) : dateOrStr;
        return new Intl.DateTimeFormat('pt-BR', {
            ...ManausTime.baseOptions,
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        }).format(d);
    },

    /**
     * Converte timestamp do banco para objeto Date local (preservando hora)
     */
    parse: (dateStr) => {
        if (!dateStr) return null;
        // Garante que o JS interprete como o fuso de Manaus se não houver indicação
        if (!dateStr.includes('Z') && !dateStr.includes('-04')) {
            return new Date(dateStr + 'T00:00:00-04:00');
        }
        return new Date(dateStr);
    }
};

// Exportação global
window.supabaseClient = supabaseClient;
window.ManausTime = ManausTime;

console.log("SME FMM: Timezone Localizada (Manaus/pt-BR) carregada.");