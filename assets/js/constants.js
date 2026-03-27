/**
 * DB_CONSTANTS - Fonte Única de Verdade para Enums do Banco de Dados
 * SME FMM - Versão Consolidada 2026 com Suporte a Bimestres
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

    /**
     * PERIODS - Definição de períodos letivos por segmento.
     * Mapeado para os Enums do banco de dados (periodo_bimestral, periodo_trimestral, etc).
     */
    PERIODS: {
        // Ensino Fundamental (Bimestral)
        FUNDAMENTAL: [
            { id: '1_BIMESTRE', label: '1º Bimestre' },
            { id: '2_BIMESTRE', label: '2º Bimestre' },
            { id: '3_BIMESTRE', label: '3º Bimestre' },
            { id: '4_BIMESTRE', label: '4º Bimestre' },
            { id: 'ANUAL', label: 'Resultado Anual' }
        ],
        // Ensino Médio - Base Comum (Trimestral)
        MEDIO_BCC: [
            { id: '1_TRIMESTRE', label: '1º Trimestre' },
            { id: '2_TRIMESTRE', label: '2º Trimestre' },
            { id: '3_TRIMESTRE', label: '3º Trimestre' },
            { id: 'ANUAL', label: 'Resultado Anual' }
        ],
        // Ensino Médio - Área Técnica (Semestral)
        MEDIO_TEC: [
            { id: '1_SEMESTRE', label: '1º Semestre' },
            { id: '2_SEMESTRE', label: '2º Semestre' }
        ]
    },

    // Situação da Matrícula / Status Acadêmico
    STUDENT_STATUS: {
        APROVADO: 'Aprovado',
        REPROVADO: 'Reprovado',
        RECUPERACAO: 'Recuperação',
        CURSANDO: 'Cursando',
        TRANSFERIDO: 'Transferido'
    }
});

/**
 * HELPER: Retorna a configuração de períodos baseada no nível da turma e tipo de disciplina.
 * @param {string} nivel - Ex: 'EF1', 'EF2', 'EMT'
 * @param {string} tipo - Ex: 'BCC', 'Técnica'
 */
const getPeriodsByContext = (nivel, tipo) => {
    if (nivel === 'EF1' || nivel === 'EF2') return DB_CONSTANTS.PERIODS.FUNDAMENTAL;
    if (nivel === 'EMT') {
        return tipo === 'BCC' ? DB_CONSTANTS.PERIODS.MEDIO_BCC : DB_CONSTANTS.PERIODS.MEDIO_TEC;
    }
    return [];
};

window.DB_CONSTANTS = DB_CONSTANTS;
window.getPeriodsByContext = getPeriodsByContext;