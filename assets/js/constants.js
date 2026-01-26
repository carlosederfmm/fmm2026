/**
 * DB_CONSTANTS - Fonte Única de Verdade para Enums do Banco de Dados
 * SME FMM - Sprint 2 | Integridade de Dados
 * * As chaves e valores aqui definidos correspondem exatamente às restrições (CHECK/ENUM)
 * existentes no PostgreSQL (Supabase).
 */

const DB_CONSTANTS = Object.freeze({
    // Cargos e Papéis do Staff
    ROLES: {
        DIRETOR: 'diretor',
        COORDENADOR: 'coordenador',
        PROFESSOR: 'professor',
        ORIENTADOR: 'orientador',
        INSPETOR: 'inspetor'
    },

    // Níveis de Ensino
    LEVELS: {
        EF1: 'EF1',
        EF2: 'EF2',
        EMT: 'EMT'
    },

    // Períodos Acadêmicos (BCC/Regular)
    ACADEMIC_PERIODS_BCC: {
        TRIMESTRE_1: '1_TRIMESTRE',
        TRIMESTRE_2: '2_TRIMESTRE',
        TRIMESTRE_3: '3_TRIMESTRE'
    },

    // Períodos Acadêmicos (Área Técnica)
    ACADEMIC_PERIODS_TEC: {
        SEMESTRE_1: '1_SEMESTRE',
        SEMESTRE_2: '2_SEMESTRE'
    },

    // Situação da Matrícula e Resultado Final
    STUDENT_STATUS: {
        APROVADO: 'APROVADO',
        REPROVADO: 'REPROVADO',
        RECUPERACAO: 'RECUPERACAO',
        CURSANDO: 'CURSANDO',
        TRANSFERIDO: 'TRANSFERIDO'
    },

    // Origem do Aluno (Convênios)
    STUDENT_ORIGIN: {
        FMM: 'FMM',
        SEDUC: 'Seduc',
        SEMED: 'Semed'
    },

    // Tipos de Atendimento Pedagógico (Prontuário)
    PEDAGOGICAL_TYPES: {
        COMPORTAMENTAL: 'Comportamental',
        ACADEMICO: 'Acadêmico',
        FAMILIAR: 'Familiar',
        SAUDE: 'Saúde',
        OUTRO: 'Outro'
    },

    // Status de Gestão de Tarefas (Scrum)
    SCRUM_STATUS: {
        TODO: 'todo',
        DOING: 'doing',
        REVIEW: 'review',
        DONE: 'done'
    },

    // Siglas de Atividades Administrativas (Grade Horária)
    EXTRA_ACTIVITIES: {
        PLAN: 'PLAN',
        CLUBE: 'CLUBE',
        APROF: 'APROF',
        FORM: 'FORM',
        REF: 'REF'
    }
});

// Exportação para uso via script tag global (ou ES6 modules se preferir)
window.DB_CONSTANTS = DB_CONSTANTS;