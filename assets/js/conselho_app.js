/* Data provider base */
class DataProvider {
    async getTurmas() {
        throw new Error('getTurmas() não implementado no provider do Conselho.');
    }

    async getAlunos(idTurma, opcoes) {
        throw new Error('getAlunos() não implementado no provider do Conselho.');
    }

    async getTotalAlunos() {
        return null;
    }

    async getCatalogos() {
        return null;
    }

    async getContextos() {
        return {
            periodos: ['1_TRIMESTRE', '2_TRIMESTRE', '3_TRIMESTRE'],
            anosLetivos: [new Date().getFullYear()]
        };
    }
}

var dataProvider = null;


/* Ata template configuration and catalogue fallback text */
// ============================================================
// CONFIGURAÇÕES GERAIS E TEXTOS DE CONTINGÊNCIA
// ============================================================

const ATA_TEMPLATE_URL = 'conselho_ata.html';

// ============================================================
// TEXTOS PADRÃO DAS TABELAS (checklists numerados)
// ============================================================

const textosFichas = {
    dificuldades: [
        "Apresentou dificuldades com relação às bases da disciplina.",
        "Não demonstrou saber interpretar os diversos gêneros textuais: texto escrito, mapa, gráfico, tabelas, imagens em geral, equações, etc.",
        "Apresentou dificuldades, na leitura e interpretação de textos diversos e em decodificar corretamente o enunciado da atividade e/ou texto.",
        "Mostrou dificuldades em estruturar uma resposta ou texto com coesão, paragrafação correta e coerência.",
        "Apresentou muitos erros de ortografia na escrita.",
        "Apresentou dificuldades de enxergar o que está na lousa.",
        "Apresentou dificuldade em escutar o que o professor e/ou colegas dizem em sala.",
        "Não apresentou organização pessoal e responsabilidade com os materiais escolares.",
        "Não cumpriu com frequência os prazos estipulados para entrega e/ou apresentação de tarefas, trabalhos, etc.",
        "Apresentou indisciplina para aprender: conversas paralelas, brincadeiras impróprias para o momento, mesmo após intervenções do professor.",
        "Faltou com o respeito com professores e colegas.",
        "Apresentou dificuldades de relacionamento com colegas e/ou professores.",
        "Não realizou as atividades propostas em sala.",
        "Não frequentou de forma pontual às aulas.",
        "Não demonstrou entendimento do conteúdo ensinado.",
        "Não demonstrou concentração e interesse em sala de aula.",
        "Não expôs suas dúvidas em sala de aula e não participou das aulas com comentários pertinentes, mesmo após intervenções do professor.",
        "Não frequentou de forma pontual às aulas de recuperação paralela.",
        "Não realizou instrumento avaliativo de"
    ],
    propostas: [
        "Notificar os pais para que estejam cientes das dificuldades apresentadas pelos alunos e possam, junto com a escola, buscar a melhoria do aluno.",
        "Recuperação contínua, o professor buscará intensificar atividades, indicar leituras e outras estratégias de ensino em classe, a fim de promover a aprendizagem do aluno.",
        "Encaminhar para recuperação paralela, uma vez que a estratégia de recuperação contínua não foi suficiente para sanar as dificuldades apresentadas.",
        "Encaminhar para sondagem pelo Setor de Orientação Educacional a fim de verificar possíveis dificuldades/transtornos de aprendizado do aluno.",
        "Estruturar Projeto de Orientação aos estudos.",
        "Realizar atividades/leituras extraclasse a fim de resgatar e/ou consolidar conteúdos.",
        "Ter horário de estudo fixo em casa, em local adequado.",
        "Interagir mais em sala de aula, tirando sempre suas dúvidas com o professor."
    ],
    resultados: [
        "Aluno submetido à Recuperação Final nos componentes curriculares:",
        "Aluno submetido à análise pelo Conselho de Classe nos componentes curriculares:",
        "Aluno retido no ano letivo nos componentes curriculares:",
        "Aluno aprovado no ano letivo"
    ],
    soe: [
        "Aluno acompanhado pelo Setor de Orientação Escolar",
        "Em processo de diagnóstico",
        "Apresenta laudo"
    ]
};


/* Coordinator-only access gate */
window.requireCouncilCoordinator = async function () {
    const status = document.getElementById('council-access-status');
    const application = document.getElementById('council-application');
    if (application) application.classList.add('hidden');
    if (status) {
        status.classList.remove('hidden');
        status.textContent = 'Validando acesso...';
    }

    try {
        const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('Sessão expirada. Entre novamente para acessar o Conselho.');

        const { data: profile, error: profileError } = await window.supabaseClient
            .from('perfis')
            .select('cargo')
            .eq('id', user.id)
            .maybeSingle();
        if (profileError) throw profileError;

        if (String(profile?.cargo || '').toLowerCase() !== 'coordenador') {
            if (status) {
                status.textContent = 'Acesso restrito: esta área está disponível somente para coordenadores.';
                status.classList.add('council-access-error');
            }
            return false;
        }

        if (status) status.classList.add('hidden');
        if (application) application.classList.remove('hidden');
        return true;
    } catch (error) {
        if (status) {
            status.classList.remove('hidden');
            status.textContent = error.message || 'Não foi possível validar o acesso ao Conselho.';
            status.classList.add('council-access-error');
        }
        throw error;
    }
};


/* Supabase data provider */
class SupabaseProvider extends DataProvider {
  static get PERIODOS_CONSELHO() {
    return [
      '1_TRIMESTRE',
      '2_TRIMESTRE',
      '3_TRIMESTRE',
      '1_BIMESTRE',
      '2_BIMESTRE',
      '3_BIMESTRE',
      '4_BIMESTRE',
      '1_SEMESTRE',
      '2_SEMESTRE'
    ];
  }

  static get LOTE() {
    return 1000;
  }

  // Filtros `.in(...)` são enviados na URL pelo PostgREST. Um lote de
  // 1.000 UUIDs pode ultrapassar o limite de URL mesmo quando a resposta
  // continua sendo paginada em lotes de 1.000 registros.
  static get LOTE_FILTRO_URL() {
    return 50;
  }

  constructor(client = window.supabaseClient) {
    super();
    this.client = client;
    if (!this.client) {
      throw new Error('Supabase client não foi inicializado. Verifique supabase-client.js e config.js.');
    }
    this.disciplinasPromise = null;
  }

  getPublicClient() {
    return this.client.schema('public');
  }

  getConselhoClient() {
    return this.client.schema('conselho');
  }

  async getTurmas() {
    const data = await this._buscarPaginado(
      () => this.getPublicClient()
        .from('turmas')
        .select('id, nome, nivel, serie')
        .order('nome', { ascending: true })
        .order('id', { ascending: true })
    );
    return data.map((turma) => this._adaptarTurma(turma));
  }

  async getTotalAlunos() {
    const { count, error } = await this.getPublicClient()
      .from('alunos')
      .select('ra', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
  }

  async getCatalogos() {
    const [dificuldades, propostas, resultados, soe] = await Promise.all([
      this._buscarCatalogo('itens_dificuldade'),
      this._buscarCatalogo('itens_proposta'),
      this._buscarCatalogo('itens_resultado'),
      this._buscarCatalogo('itens_soe')
    ]);

    return {
      dificuldades: this._textosCatalogo(dificuldades),
      propostas: this._textosCatalogo(propostas),
      resultados: this._textosCatalogo(resultados),
      soe: this._textosCatalogo(soe)
    };
  }

  async getContextos() {
    // Use meeting years and the current year instead of scanning every enrollment for distinct years.
    const reunioes = await this._buscarPaginado(() => this.getConselhoClient()
      .from('reunioes')
      .select('id, ano_letivo')
      .order('ano_letivo', { ascending: false })
      .order('id', { ascending: true })
    );

    const anos = [...new Set(
      [...reunioes.map((reuniao) => reuniao.ano_letivo), new Date().getFullYear()]
        .map(Number)
        .filter((ano) => Number.isInteger(ano))
    )].sort((a, b) => b - a);
    return {
      periodos: SupabaseProvider.PERIODOS_CONSELHO,
      anosLetivos: anos
    };
  }

  async getAlunos(idTurma, opcoes = {}) {
    if (!idTurma) return [];

    const periodo = opcoes.periodo || '';
    const anoLetivo = Number(opcoes.anoLetivo) || new Date().getFullYear();
    const alunos = await this._buscarPaginado(() => {
      let query = this.getPublicClient()
        .from('alunos')
        .select('ra, nome_completo, id_turma, status, laudo, nome_busca')
        .eq('id_turma', idTurma)
        .order('nome_completo', { ascending: true })
        .order('ra', { ascending: true });
      return query;
    });

    const [reunioes, matriculas, disciplinas] = await Promise.all([
      this._buscarReunioes(idTurma, periodo, anoLetivo),
      this._buscarMatriculas(idTurma, anoLetivo),
      this._buscarDisciplinas()
    ]);

    const reunioesPorTurma = this._maisRecentePor(reunioes, 'id_turma', 'dia_reuniao');
    const reuniaoIds = reunioes.map((reuniao) => reuniao.id);
    const [dadosConselho, notasPorMatricula] = await Promise.all([
      this._buscarDadosConselho(reuniaoIds),
      this._buscarNotas(matriculas, disciplinas, periodo)
    ]);
    const conselhoPorChave = new Map();
    dadosConselho.forEach((registro) => {
      const chave = `${registro.id_reuniao}:${String(registro.ra || '')}`;
      const anterior = conselhoPorChave.get(chave);
      if (!anterior || new Date(registro.updated_at || registro.created_at || 0) > new Date(anterior.updated_at || anterior.created_at || 0)) {
        conselhoPorChave.set(chave, registro);
      }
    });

    const matriculasPorRa = new Map();
    matriculas.forEach((matricula) => {
      const ra = String(matricula.ra_aluno || '');
      if (ra) {
        const candidatas = matriculasPorRa.get(ra) || [];
        candidatas.push(matricula);
        matriculasPorRa.set(ra, candidatas);
      }
    });

    return alunos.map((aluno) => {
      const ra = String(aluno.ra);
      const candidatas = matriculasPorRa.get(ra) || [];
      const mesmaTurma = candidatas.filter((item) => String(item.id_turma || '') === String(aluno.id_turma || ''));
      const matricula = mesmaTurma.find((item) => String(item.status || '').toUpperCase() === 'CURSANDO')
        || mesmaTurma[0]
        || candidatas.find((item) => String(item.status || '').toUpperCase() === 'CURSANDO')
        || candidatas[0];
      const turmaReuniao = reunioesPorTurma.get(String(aluno.id_turma));
      const conselho = turmaReuniao
        ? conselhoPorChave.get(`${turmaReuniao.id}:${ra}`)
        : undefined;

      return this._adaptarAluno(
        aluno,
        conselho,
        notasPorMatricula.get(matricula?.id),
        periodo,
        matricula
      );
    });
  }

  async getAlunosParaPreenchimento(idTurma, opcoes = {}) {
    const alunos = await this.getAlunos(idTurma, opcoes);
    return alunos.filter((aluno) => (
      String(aluno.statusMatricula || '').trim().toUpperCase() === 'CURSANDO'
      && [...(aluno.notasBasicas || []), ...(aluno.notasTecnicas || [])]
        .some((nota) => nota.nota !== null && nota.nota !== undefined && nota.nota !== ''
          && Number.isFinite(Number(nota.nota)) && Number(nota.nota) < 6)
    ));
  }

  async salvarPreenchimento({ idTurma, periodo, anoLetivo, padraoDificuldades, padraoPropostas, alunos }) {
    let { data: reuniao, error } = await this.getConselhoClient()
      .from('reunioes')
      .select('id')
      .eq('id_turma', idTurma)
      .eq('periodo', periodo)
      .eq('ano_letivo', anoLetivo)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;

    if (!reuniao) {
      ({ data: reuniao, error } = await this.getConselhoClient()
        .from('reunioes')
        .insert({
          id_turma: idTurma,
          periodo,
          ano_letivo: anoLetivo,
          dia_reuniao: new Date().toISOString()
        })
        .select('id')
        .single());
      if (error) throw error;
    }

    const registros = alunos.map((aluno) => ({
      id_reuniao: reuniao.id,
      ra: aluno.ra,
      dificuldades: aluno.dificuldades,
      propostas: aluno.propostas,
      resultados: [],
      soe: [],
      provas_perdidas: [],
      item19_texto: aluno.item19 || null
    }));

    if (registros.length) {
      const existentes = await this._buscarDadosConselho([reuniao.id]);
      const existentesPorRa = new Map();
      existentes.forEach((registro) => {
        const ra = String(registro.ra);
        if (!existentesPorRa.has(ra)) existentesPorRa.set(ra, registro);
      });
      for (const registro of registros) {
        const existente = existentesPorRa.get(String(registro.ra));
        const query = this.getConselhoClient().from('dados_conselho');
        const dadosFicha = {
          dificuldades: registro.dificuldades,
          propostas: registro.propostas,
          item19_texto: registro.item19_texto
        };
        const resposta = existente
          ? await query.update(dadosFicha).eq('id', existente.id)
          : await query.insert(registro);
        if (resposta.error) throw resposta.error;
      }
    }

    return reuniao.id;
  }

  async _buscarReunioes(idTurma, periodo, anoLetivo) {
    let query = this.getConselhoClient()
      .from('reunioes')
      .select('id, id_turma, periodo, ano_letivo, dia_reuniao')
      .eq('ano_letivo', anoLetivo)
      .order('dia_reuniao', { ascending: false })
      .order('id', { ascending: true });
    if (periodo) query = query.eq('periodo', periodo);
    if (idTurma) query = query.eq('id_turma', idTurma);
    return this._buscarPaginado(() => query);
  }

  async _buscarDadosConselho(reuniaoIds) {
    if (!reuniaoIds.length) return [];
    return this._buscarPorListaEmLotes(reuniaoIds, (lote) => this._buscarPaginado(() => this.getConselhoClient()
      .from('dados_conselho')
      .select('id, id_reuniao, ra, dificuldades, propostas, resultados, soe, provas_perdidas, resultado_extra, proposta_rec_continua, proposta_rec_paralela, observacoes, item19_texto, updated_at, created_at')
      .in('id_reuniao', lote)
      .order('updated_at', { ascending: false })
    ));
  }

  async _buscarMatriculas(idTurma, anoLetivo) {
    let query = this.getPublicClient()
      .from('matriculas')
      .select('id, ra_aluno, id_turma, ano_letivo, status')
      .eq('ano_letivo', anoLetivo)
      .order('id', { ascending: true });
    if (idTurma) query = query.eq('id_turma', idTurma);
    try {
      return await this._buscarPaginado(() => query);
    } catch (error) {
      if (!this._isMissingTableError(error, 'matriculas')) throw error;
      console.warn('[Conselho] Tabela public.matriculas indisponível; usando public.alunos. Notas relacionadas a matrículas não serão carregadas.');
      let fallback = this.getPublicClient()
        .from('alunos')
        .select('ra, id_turma, status')
        .order('ra', { ascending: true });
      if (idTurma) fallback = fallback.eq('id_turma', idTurma);
      const alunos = await this._buscarPaginado(() => fallback);
      return alunos.map((aluno) => ({
        id: null,
        ra_aluno: aluno.ra,
        id_turma: aluno.id_turma,
        ano_letivo: anoLetivo,
        status: aluno.status
      }));
    }
  }

  _isMissingTableError(error, tableName) {
    const message = String(error?.message || '').toLowerCase();
    return (error?.code === '42P01' || error?.code === 'PGRST205')
      && message.includes(tableName);
  }

  async _buscarDisciplinas() {
    if (!this.disciplinasPromise) {
      this.disciplinasPromise = this._buscarPaginado(() => this.getPublicClient()
        .from('disciplinas')
        .select('sigla, nome, tipo, regime, semestre, series')
        .order('sigla', { ascending: true })
      ).catch((error) => {
        this.disciplinasPromise = null;
        throw error;
      });
    }
    return this.disciplinasPromise;
  }

  async _buscarNotas(matriculas, disciplinas, periodo) {
    const matriculasComId = matriculas.filter((matricula) => matricula.id);
    if (!matriculasComId.length) return new Map();

    const ids = matriculasComId.map((matricula) => matricula.id);
    const [basicas, fundamentais, tecnicas] = await Promise.all([
      this._buscarPorIds('notas_basica', 'id_matricula, sigla_disciplina, periodo, nt', ids, this._periodosTrimestrais(periodo)),
      this._buscarPorIds('notas_fundamental', 'id_matricula, sigla_disciplina, periodo, nb', ids, this._periodosBimestrais(periodo)),
      this._buscarPorIds('notas_tecnica', 'id_matricula, sigla_disciplina, periodo, nota_final_periodo', ids, this._periodosSemestrais(periodo))
    ]);

    const disciplinasPorSigla = new Map(disciplinas.map((disciplina) => [disciplina.sigla, disciplina]));
    const notasPorMatricula = new Map();
    const adicionar = (registro, nota, semestre) => {
      const disciplina = disciplinasPorSigla.get(registro.sigla_disciplina);
      const lista = notasPorMatricula.get(registro.id_matricula) || { basicas: [], tecnicas: [] };
      const item = {
        disciplina: disciplina?.nome || registro.sigla_disciplina,
        nota: nota === null || nota === undefined || nota === '' ? null : Number(nota),
        sigla: registro.sigla_disciplina
      };
      if (semestre) item.semestre = semestre;
      if (semestre) lista.tecnicas.push(item);
      else lista.basicas.push(item);
      notasPorMatricula.set(registro.id_matricula, lista);
    };

    basicas.forEach((registro) => adicionar(registro, registro.nt));
    fundamentais.forEach((registro) => adicionar(registro, registro.nb));
    tecnicas.forEach((registro) => {
      const disciplina = disciplinasPorSigla.get(registro.sigla_disciplina);
      adicionar(registro, registro.nota_final_periodo, this._normalizarSemestre(disciplina?.semestre));
    });
    return notasPorMatricula;
  }

  async _buscarPorIds(tabela, campos, ids, periodos) {
    return this._buscarPorListaEmLotes(ids, (lote) => {
      return Promise.all((periodos || []).filter(Boolean).map((periodo) => {
        const query = this.getPublicClient()
          .from(tabela)
          .select(campos)
          .in('id_matricula', lote)
          .eq('periodo', periodo);
        return this._buscarPaginado(() => query);
      })).then((resultados) => resultados.flat());
    });
  }

  _periodosBimestrais(periodo) {
    return /^([1-4])_BIMESTRE$/.test(periodo) ? [periodo] : [];
  }

  _periodosTrimestrais(periodo) {
    return /^([1-3])_TRIMESTRE$/.test(periodo) ? [periodo] : [];
  }

  _periodosSemestrais(periodo) {
    return /^([1-2])_SEMESTRE$/.test(periodo) ? [periodo] : [];
  }

  async _buscarCatalogo(tabela) {
    return this._buscarPaginado(() => this.getConselhoClient()
      .from(tabela)
      .select('id, descricao, ativo')
      .eq('ativo', true)
      .order('id', { ascending: true })
    );
  }

  _textosCatalogo(registros) {
    const textos = [];
    registros.forEach((registro) => {
      const indice = Number(registro.id) - 1;
      if (Number.isInteger(indice) && indice >= 0) {
        textos[indice] = registro.descricao;
      }
    });
    return textos;
  }

  async _buscarPorListaEmLotes(lista, buscarLote) {
    const registros = [];
    for (let inicio = 0; inicio < lista.length; inicio += SupabaseProvider.LOTE_FILTRO_URL) {
      const lote = lista.slice(inicio, inicio + SupabaseProvider.LOTE_FILTRO_URL);
      registros.push(...await buscarLote(lote));
    }
    return registros;
  }

  async _buscarPaginado(queryFactory) {
    const registros = [];
    let inicio = 0;

    while (true) {
      const { data, error } = await queryFactory()
        .range(inicio, inicio + SupabaseProvider.LOTE - 1);
      if (error) throw error;

      const lote = data || [];
      registros.push(...lote);
      if (lote.length < SupabaseProvider.LOTE) break;
      inicio += SupabaseProvider.LOTE;
    }

    return registros;
  }

  _maisRecentePor(registros, chave, chaveData) {
    const mapa = new Map();
    registros.forEach((registro) => {
      const id = String(registro[chave] || '');
      const anterior = mapa.get(id);
      if (!anterior || new Date(registro[chaveData] || 0) > new Date(anterior[chaveData] || 0)) {
        mapa.set(id, registro);
      }
    });
    return mapa;
  }

  _normalizarSemestre(valor) {
    const texto = String(valor || '').toLowerCase();
    if (texto.includes('2')) return 2;
    return 1;
  }

  _adaptarTurma(turma) {
    return {
      id: String(turma.id),
      nome: turma.nome,
      nivel: turma.nivel || ''
    };
  }

  _adaptarAluno(aluno, conselho, notas, periodo, matricula) {
    const dificuldades = this._arrayParaTexto(conselho?.dificuldades);
    const propostas = this._arrayParaTexto(conselho?.propostas);
    const soe = this._arrayParaTexto(conselho?.soe);
    const resultados = this._arrayParaTexto(conselho?.resultados);
    const provasPerdidas = this._provasPerdidas(conselho?.provas_perdidas);

    return {
      ra: String(aluno.ra),
      nome_completo: aluno.nome_completo,
      id_turma: aluno.id_turma ? String(aluno.id_turma) : '',
      statusMatricula: matricula?.status || '',
      temFicha: Boolean(conselho),
      periodo: periodo || this._inferirPeriodo(aluno),
      dificuldades,
      item19: conselho?.item19_texto || '',
      propostas,
      propostaRecCont: conselho?.proposta_rec_continua || '',
      propostaRecPara: conselho?.proposta_rec_paralela || '',
      resultados,
      resultadoExtra: conselho?.resultado_extra || '',
      soe,
      observacoes: conselho?.observacoes || '',
      notasBasicas: notas?.basicas || [],
      notasTecnicas: notas?.tecnicas || [],
      pontuacaoPerdida: provasPerdidas
    };
  }

  _provasPerdidas(valor) {
    if (!Array.isArray(valor)) return [];
    return valor.slice(0, 4).map((item) => {
      const texto = String(item || '').trim();
      const separador = texto.indexOf(':');
      if (separador < 0) return { componente: texto, pontos: '' };
      return {
        componente: texto.slice(0, separador).trim(),
        pontos: texto.slice(separador + 1).trim()
      };
    });
  }

  _arrayParaTexto(valor) {
    if (Array.isArray(valor)) {
      return valor.filter((v) => v !== null && v !== undefined && v !== '').join(', ');
    }
    if (valor === null || valor === undefined) {
      return '';
    }
    return String(valor);
  }

  _inferirPeriodo(aluno) {
    if (!aluno) return '';

    const status = aluno.status || '';
    if (status.toLowerCase().includes('transfer')) {
      return 'TRANSFERÊNCIA';
    }

    return '';
  }
}

window.SupabaseProvider = SupabaseProvider;

window.supabaseProviderReady = Promise.resolve().then(() => {
  dataProvider = new SupabaseProvider(window.supabaseClient);
  console.info('[supabase-integration] Provider do Supabase ativado com sucesso.');
  return dataProvider;
});


/* Council screen behavior */
// ============================================================
// ESTADO GLOBAL
// ============================================================
let state = {
    turmas: [],
    alunos: [],
    turmaAtual: null,
    alunosFiltrados: [],
    selecionados: new Set(),
    loadSequence: 0
};

// ============================================================
// FUNÇÕES AUXILIARES DE FORMATAÇÃO E MONTAGEM
// ============================================================
function escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setField(root, field, value) {
    const el = root.querySelector(`[data-field="${field}"]`);
    if (!el) { console.warn(`Campo não encontrado: ${field}`); return; }
    el.innerHTML = value;
}

function gerarHTMLChecklist(stringNumeros, listaTextos, alunoObj = {}) {
    const str = stringNumeros ? String(stringNumeros).trim() : '';
    const numeros = (str && str.match(/\d+/g))
        ? str.match(/\d+/g).map(Number).filter(n => n >= 1 && n <= listaTextos.length)
        : [];

    let html = '';
    listaTextos.forEach((txt, idx) => {
        if (!txt) return;
        const n = idx + 1;
        const marcado = numeros.includes(n) ? 'X' : '&nbsp;&nbsp;';
        let textoFinal = escHtml(txt);

        if (n === 2 && txt.includes('{extra}')) {
            const extra = escHtml(alunoObj.propostaRecCont || '____________________');
            textoFinal = textoFinal.replace('{extra}', `<u>${extra}</u>`);
        } else if (n === 3 && txt.includes('{extra}')) {
            const extra = escHtml(alunoObj.propostaRecPara || '____________________');
            textoFinal = textoFinal.replace('{extra}', `<u>${extra}</u>`);
        }

        html += `<div style="margin-bottom: 2px;">${n} ( <strong>${marcado}</strong> ) ${textoFinal}</div>`;
    });
    return html;
}

function extrairLinhasItem19(textoItem19) {
    const texto = Array.isArray(textoItem19)
        ? textoItem19.join(', ')
        : String(textoItem19 || '');

    return texto
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .map(item => {
            const partes = item.split(/\s*-\s*/, 2);
            if (partes.length < 2) {
                return { componente: item, pontos: '' };
            }
            return {
                componente: partes[1].trim(),
                pontos: partes[0].trim()
            };
        })
        .filter(item => item.componente || item.pontos);
}

function gerarDificuldadesComPontuacao(stringNumeros, listaTextos, extraItem19 = '', linhasPontuacao = []) {
    const str = stringNumeros ? String(stringNumeros).trim() : '';
    const numeros = (str && str.match(/\d+/g))
        ? str.match(/\d+/g).map(Number).filter(n => n >= 1 && n <= listaTextos.length)
        : [];

    let html = '<table style="width: 100%; border-collapse: collapse; font-size: 8px;">';
    
    // Cabeçalho da tabela
    html += '<tr style="background-color: #d1d5db; border: 1px solid #000;"><th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">DIFICULDADES APRESENTADAS PELO ALUNO</th></tr>';
    
    // 19 Linhas de Dificuldades
    let conteudoDificuldades = '';
    listaTextos.forEach((txt, idx) => {
        if (!txt) return;
        const n = idx + 1;
        const marcado = numeros.includes(n) ? 'X' : '&nbsp;&nbsp;';
        let textoFinal = escHtml(txt);

        conteudoDificuldades += `<div style="margin-bottom: 1.5px;">${n} ( <strong>${marcado}</strong> ) ${textoFinal}</div>`;
    });

    html += `<tr style="border: 1px solid #000;"><td style="border: 1px solid #000; padding: 4px; vertical-align: top;">${conteudoDificuldades}</td></tr>`;
    
    // Sub-tabela: COMPONENTE CURRICULAR e PONTUAÇÃO PERDIDA DE
    html += '<tr style="border-left: 1px solid #000; border-right: 1px solid #000; border-bottom: 1px solid #000;"><td style="padding: 0;">';
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 7.5px;">';
    html += '<tr style="background-color: #d1d5db;">';
    html += '<th style="border-right: 1px solid #000; padding: 2px 4px; text-align: left; font-weight: bold; width: 68%;">COMPONENTE CURRICULAR:</th>';
    html += '<th style="padding: 2px 4px; text-align: left; font-weight: bold; width: 32%;">PONTUAÇÃO PERDIDA DE</th>';
    html += '</tr>';
    
    // Mantém quatro linhas no layout padrão e expande somente esta tabela
    // quando houver mais componentes informados no item 19.
    const quantidadeLinhas = Math.max(4, linhasPontuacao.length);
    for (let i = 0; i < quantidadeLinhas; i++) {
        const item = linhasPontuacao[i] || { componente: '', pontos: '' };
        const comp = escHtml(item.componente || '');
        const pts = escHtml(item.pontos || '');
        html += '<tr style="border-bottom: 1px solid #000; height: 14px;">';
        html += `<td style="border-right: 1px solid #000; padding: 1px 4px; vertical-align: middle;">${comp}</td>`;
        html += `<td style="padding: 1px 4px; vertical-align: middle;">${pts}</td>`;
        html += '</tr>';
    }
    
    html += '</table></td></tr></table>';
    return html;
}

function gerarHTMLNotasBasicas(notasBasicas = []) {
    if (!notasBasicas || notasBasicas.length === 0) return '';

    let html = '<table class="tbl-notas-base" style="width: 100%; font-size: 7.5px; border-collapse: collapse; margin-bottom: 4px;">';
    
    html += '<tr style="background-color: #d1d5db;">';
    notasBasicas.forEach(nota => {
        html += `<th style="border: 1px solid #000; padding: 2px 1px; font-size: 6.5px; text-align: center;">${escHtml(nota.disciplina.toUpperCase())}</th>`;
    });
    html += '</tr>';
    
    html += '<tr>';
    notasBasicas.forEach(nota => {
        const valorDisplay = (nota.nota !== null && nota.nota !== undefined) ? Number(nota.nota).toFixed(1).replace('.', ',') : '';
        const estiloCelula = (nota.nota !== null && nota.nota < 6.0) 
            ? 'background-color: #f4cccc; color: #ff0000;' 
            : '';
        html += `<td style="border: 1px solid #000; padding: 2px 1px; text-align: center; font-weight: bold; ${estiloCelula}">${valorDisplay}</td>`;
    });
    html += '</tr></table>';
    return html;
}

function gerarHTMLNotasTecnicas(notasTecnicas = []) {
    if (!notasTecnicas || notasTecnicas.length === 0) return '';

    const sem1 = notasTecnicas.filter(n => n.semestre === 1);
    const sem2 = notasTecnicas.filter(n => n.semestre === 2);

    let html = '<table class="tbl-notas-tec" style="width: 100%; font-size: 7.5px; border-collapse: collapse; margin-bottom: 6px;">';
    
    if (sem1.length > 0 || sem2.length > 0) {
        html += '<tr style="background-color: #d1d5db;">';
        if (sem1.length > 0) {
            html += `<th colspan="${sem1.length}" style="border: 1px solid #000; padding: 1px; font-size: 7px; text-align: center; font-weight: bold;">1ª SEMESTRE</th>`;
        }
        if (sem2.length > 0) {
            html += `<th colspan="${sem2.length}" style="border: 1px solid #000; padding: 1px; font-size: 7px; text-align: center; font-weight: bold;">2º SEMESTRE</th>`;
        }
        html += '</tr>';
    }

    html += '<tr style="background-color: #e5e7eb;">';
    notasTecnicas.forEach(nota => {
        html += `<th style="border: 1px solid #000; padding: 2px 1px; font-size: 6.5px; text-align: center;">${escHtml(nota.disciplina.toUpperCase())}</th>`;
    });
    html += '</tr>';
    
    html += '<tr>';
    notasTecnicas.forEach(nota => {
        const valorDisplay = (nota.nota !== null && nota.nota !== undefined) ? Number(nota.nota).toFixed(1).replace('.', ',') : '';
        const estiloCelula = (nota.nota !== null && nota.nota < 6.0) 
            ? 'background-color: #f4cccc; color: #ff0000;' 
            : '';
        html += `<td style="border: 1px solid #000; padding: 2px 1px; text-align: center; font-weight: bold; ${estiloCelula}">${valorDisplay}</td>`;
    });
    html += '</tr></table>';
    return html;
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
async function inicializar() {
    mostrarLoading('Carregando dados...');
    try {
        if (window.supabaseProviderReady) {
            await window.supabaseProviderReady;
        }
        await carregarDadosIniciais();
        const dot = document.getElementById('db-status-dot');
        const text = document.getElementById('db-status-text');
        if (dot) dot.className = 'status-dot online';
        if (text) text.innerHTML = 'Dados Carregados';
        toast('Dados carregados com sucesso!', 'success');
    } catch (e) {
        const dot = document.getElementById('db-status-dot');
        const text = document.getElementById('db-status-text');
        if (dot) dot.className = 'status-dot';
        if (text) text.textContent = 'Erro de conexão';
        toast('Erro ao carregar Supabase: ' + e.message, 'error');
    } finally {
        ocultarLoading();
    }
}

async function carregarDadosIniciais() {
    const [contextos, turmas, catalogos, totalAlunos] = await Promise.all([
        dataProvider.getContextos?.(),
        dataProvider.getTurmas(),
        dataProvider.getCatalogos?.(),
        dataProvider.getTotalAlunos?.()
    ]);
    preencherSelectContextos(contextos);
    if (catalogos) {
        if (catalogos.dificuldades?.length) textosFichas.dificuldades = catalogos.dificuldades;
        if (catalogos.propostas?.length) textosFichas.propostas = catalogos.propostas;
        if (catalogos.resultados?.length) textosFichas.resultados = catalogos.resultados;
        if (catalogos.soe?.length) textosFichas.soe = catalogos.soe;
    }

    function preencherSelectContextos(contextos) {
        const periodos = contextos?.periodos || [];
        const anosLetivos = contextos?.anosLetivos || [];
        const selectPeriodo = document.getElementById('filtro-periodo');
        const campoAno = document.getElementById('filtro-ano');

        if (selectPeriodo && periodos.length) {
            selectPeriodo.innerHTML = periodos
                .map((periodo) => `<option value="${escHtml(periodo)}">${escHtml(formatarPeriodo(periodo))}</option>`)
                .join('');
            selectPeriodo.value = periodos[0];
            selectPeriodo.disabled = false;
        }

        if (campoAno && anosLetivos.length) {
            campoAno.innerHTML = anosLetivos
                .map((ano) => `<option value="${ano}">${ano}</option>`)
                .join('');
            campoAno.value = String(anosLetivos[0]);
            campoAno.disabled = false;
        }
    }

    state.turmas = turmas.sort((a, b) => a.nome.localeCompare(b.nome));
    state.alunos = [];

    const elTurmas = document.getElementById('info-total-turmas');
    if (elTurmas) elTurmas.textContent = state.turmas.length;

    const elAlunos = document.getElementById('info-total-alunos');
    if (elAlunos) elAlunos.textContent = totalAlunos ?? '—';

    preencherSelectTurmas(state.turmas);
    aplicarFiltros();
    atualizarContadorSelecionados();
}

function obterParametrosImpressao() {
    return {
        periodo: document.getElementById('filtro-periodo')?.value?.trim() || '1_TRIMESTRE',
        anoLetivo: Number(document.getElementById('filtro-ano')?.value) || new Date().getFullYear()
    };
}

async function recarregarAlunosDoContexto(periodo, anoLetivo, idTurma = state.turmaAtual?.id, requestId = ++state.loadSequence) {
    if (!idTurma) {
        state.alunos = [];
        state.selecionados.clear();
        aplicarFiltros();
        atualizarContadorSelecionados();
        return requestId;
    }

    const raSelecionados = new Set(state.selecionados);
    const alunosDoContexto = await dataProvider.getAlunos(idTurma, { periodo, anoLetivo });
    if (requestId !== state.loadSequence || idTurma !== document.getElementById('filtro-turma')?.value) {
        return requestId;
    }

    state.alunos = alunosDoContexto;
    state.selecionados = new Set([...raSelecionados].filter((ra) => alunosDoContexto.some((aluno) => aluno.ra === ra)));
    aplicarFiltros();
    atualizarContadorSelecionados();
    return requestId;
}

async function onChangeContexto() {
    if (!state.turmaAtual) return;

    const { periodo, anoLetivo } = obterParametrosImpressao();
    const requestId = ++state.loadSequence;
    mostrarLoading('Carregando notas do período...');
    try {
        await recarregarAlunosDoContexto(periodo, anoLetivo, state.turmaAtual.id, requestId);
    } catch (e) {
        toast('Erro ao carregar o período selecionado: ' + e.message, 'error');
        console.error(e);
    } finally {
        if (requestId === state.loadSequence) ocultarLoading();
    }
}

// ============================================================
// FILTROS E TABELA DE SELEÇÃO
// ============================================================
function preencherSelectTurmas(turmas) {
    const sel = document.getElementById('filtro-turma');
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecione uma turma</option>';
    turmas.forEach(t => { sel.innerHTML += `<option value="${escHtml(t.id)}">${escHtml(t.nome)}</option>`; });
}

// Filtra a lista de turmas do select por nível (EF1/EF2/EMT).
// Trocar o nível sempre reinicia a seleção de turma.
function filtrarTurmas() {
    const nivel = document.getElementById('filtro-nivel').value;
    const turmasFiltradas = nivel ? state.turmas.filter(t => t.nivel === nivel) : state.turmas;

    preencherSelectTurmas(turmasFiltradas);
    document.getElementById('filtro-turma').value = '';
    onChangeTurma();
}

async function onChangeTurma() {
    const idTurma = document.getElementById('filtro-turma').value;
    state.loadSequence += 1;
    state.selecionados.clear();
    atualizarContadorSelecionados();

    state.turmaAtual = idTurma ? state.turmas.find(t => t.id === idTurma) : null;
    if (!state.turmaAtual) {
        state.alunos = [];
        aplicarFiltros();
        return;
    }

    const { periodo, anoLetivo } = obterParametrosImpressao();
    const requestId = state.loadSequence;
    mostrarLoading('Carregando alunos e notas da turma...');
    try {
        await recarregarAlunosDoContexto(periodo, anoLetivo, idTurma, requestId);
    } catch (e) {
        if (requestId === state.loadSequence) {
            state.alunos = [];
            aplicarFiltros();
            toast('Erro ao carregar os alunos da turma: ' + e.message, 'error');
            console.error(e);
        }
    } finally {
        if (requestId === state.loadSequence) ocultarLoading();
    }
}

function temNotaBaixa(aluno) {
    const notas = [...(aluno.notasBasicas || []), ...(aluno.notasTecnicas || [])];
    return notas.some(({ nota }) => {
        if (nota === null || nota === undefined || nota === '') return false;
        const valor = typeof nota === 'string'
            ? Number(nota.replace(',', '.'))
            : Number(nota);
        return Number.isFinite(valor) && valor < 6.0;
    });
}

// Ponto único de filtragem: turma atual + busca por nome/RA +
// "apenas com ficha" + "apenas com nota baixa". Reaproveitado
// pelos controles de filtro, sem derrubar a seleção já feita.
function aplicarFiltros() {
    if (!state.turmaAtual) {
        state.alunosFiltrados = [];
        atualizarContagemVisiveis(0);
        renderizarEstadoVazio('Selecione uma turma para começar', 'A lista de alunos aparece aqui assim que uma turma for escolhida acima.');
        return;
    }

    const q = document.getElementById('busca-aluno').value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const somenteComFicha = document.getElementById('filtro-com-ficha').checked;
    const somenteComNotaBaixa = document.getElementById('filtro-nota-baixa').checked;

    let base = state.alunos
        .filter(a => a.id_turma === state.turmaAtual.id)
        .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));

    if (somenteComFicha) {
        base = base.filter(a => a.temFicha);
    }
    if (somenteComNotaBaixa) {
        base = base.filter(temNotaBaixa);
    }

    const filtered = q ? base.filter(a => {
        const nome = a.nome_completo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return nome.includes(q) || a.ra.includes(q);
    }) : base;

    state.alunosFiltrados = filtered;
    renderizarTabela(filtered);
}

function filtrarAlunos() {
    aplicarFiltros();
}

function renderizarEstadoVazio(titulo, dica) {
    const container = document.getElementById('tabela-container');
    if (!container) return;
    container.innerHTML = `<div class="empty-state"><div class="empty-msg">${escHtml(titulo)}</div><div class="empty-hint">${escHtml(dica)}</div></div>`;
}

function renderizarTabela(alunos) {
    const container = document.getElementById('tabela-container');
    if (!container) return;

    if (!alunos.length) {
        atualizarContagemVisiveis(0);
        renderizarEstadoVazio('Nenhum aluno encontrado', 'Ajuste os filtros ou a busca para ver resultados.');
        return;
    }
    
    let rows = '';
    alunos.forEach(a => {
        const sel = state.selecionados.has(a.ra) ? 'selected' : '';
        const checked = state.selecionados.has(a.ra) ? 'checked' : '';
        rows += `<tr class="${sel}" onclick="toggleSelecionado('${a.ra}')">
            <td class="check-col"><input type="checkbox" ${checked} onclick="event.stopPropagation();toggleSelecionado('${a.ra}')" /></td>
            <td>${escHtml(a.ra)}</td>
            <td>${escHtml(a.nome_completo)}</td>
            <td>${escHtml(a.periodo || '—')}</td>
            <td>${a.temFicha ? '<span class="badge">Preenchida</span>' : '<span style="color: var(--ink-faint);">Pendente</span>'}</td>
        </tr>`;
    });
    
    container.innerHTML = `<table class="tbl"><thead><tr><th class="check-col"><input type="checkbox" onclick="toggleTodos(this)" /></th><th>RA</th><th>Nome do aluno</th><th>Período</th><th>Status da ficha</th></tr></thead><tbody>${rows}</tbody></table>`;
    atualizarContagemVisiveis(alunos.length);
}

function atualizarContagemVisiveis(total) {
    const ids = ['info-alunos-visiveis', 'info-alunos-visiveis-toolbar'];
    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = total;
    });
}

function toggleSelecionado(ra) {
    if (state.selecionados.has(ra)) state.selecionados.delete(ra);
    else state.selecionados.add(ra);
    atualizarContadorSelecionados();
    renderizarTabela(state.alunosFiltrados);
}

function toggleTodos(el) {
    state.alunosFiltrados.forEach(a => el.checked ? state.selecionados.add(a.ra) : state.selecionados.delete(a.ra));
    renderizarTabela(state.alunosFiltrados);
    atualizarContadorSelecionados();
}

function selecionarTodos() {
    state.alunosFiltrados.forEach(a => state.selecionados.add(a.ra));
    renderizarTabela(state.alunosFiltrados);
    atualizarContadorSelecionados();
}

function limparSelecao() {
    state.selecionados.clear();
    renderizarTabela(state.alunosFiltrados);
    atualizarContadorSelecionados();
}

function atualizarContadorSelecionados() {
    const n = state.selecionados.size;
    const c1 = document.getElementById('contagem-selecionados');
    const btnLote = document.getElementById('btn-lote');
    const btnInd = document.getElementById('btn-individual');

    if (c1) c1.textContent = n;
    if (btnLote) btnLote.disabled = n === 0;
    if (btnInd) btnInd.disabled = n !== 1;
}

function abrirModalLote() {
    const { periodo, anoLetivo } = obterParametrosImpressao();
    document.getElementById('modal-print-sub').textContent = `${state.selecionados.size} aluno(s) selecionado(s) · ${formatarPeriodo(periodo)} de ${anoLetivo}.`;
    document.getElementById('modal-print').classList.remove('hidden');
}

function abrirModalIndividual() {
    const ra = [...state.selecionados][0];
    const aluno = state.alunos.find(a => a.ra === ra);
    const { periodo, anoLetivo } = obterParametrosImpressao();
    document.getElementById('modal-print-sub').textContent = `Ata para: ${aluno?.nome_completo || ra} · ${formatarPeriodo(periodo)} de ${anoLetivo}.`;
    document.getElementById('modal-print').classList.remove('hidden');
}

function fecharModal() { 
    document.getElementById('modal-print').classList.add('hidden'); 
}

// ============================================================
// GERAÇÃO DE PDF NATIVO (UTILIZANDO CLASSE CSS DEDICADA)
// ============================================================
async function confirmarImpressao() {
    const parametros = obterParametrosImpressao();
    const ano = String(parametros.anoLetivo);
    const periodoInformado = parametros.periodo;
    fecharModal();

    const rasParaImprimir = [...state.selecionados];
    if (!rasParaImprimir.length) return;

    mostrarLoading('Compilando PDF nativo...');
    document.body.classList.add('is-exporting');
    let tempContainer = null;
    try {
        await recarregarAlunosDoContexto(periodoInformado, parametros.anoLetivo);
        const templateResponse = await fetch(ATA_TEMPLATE_URL);
        if (!templateResponse.ok) throw new Error("Não foi possível carregar o arquivo ata.html");
        const templateHTML = await templateResponse.text();

        const parser = new DOMParser();
        const docTemplate = parser.parseFromString(templateHTML, 'text/html');

        const headStyles = Array.from(docTemplate.head.querySelectorAll('style, link[rel="stylesheet"]'));

        const containerAtas = docTemplate.getElementById('container-atas');
        if (!containerAtas) throw new Error("container-atas não encontrado em ata.html");
        
        const modeloAta = containerAtas.querySelector('.page-ata');
        if (!modeloAta) throw new Error(".page-ata não encontrada em ata.html");
        modeloAta.remove();

        rasParaImprimir.forEach((ra) => {
            const aluno = state.alunos.find(a => a.ra === ra);
            const clone = modeloAta.cloneNode(true);

            const periodoAta = formatarPeriodo(periodoInformado || aluno.periodo || '');
            setField(clone, 'titulo-ata', `ATA DE CONSELHO DE CLASSE: ${periodoAta.toUpperCase()} ${ano} - FICHA DE ACOMPANHAMENTO PERIÓDICO`);
            setField(clone, 'aluno-nome', escHtml(aluno.nome_completo));
            setField(clone, 'aluno-turma', `TURMA ${escHtml(state.turmaAtual?.nome || '—')}`);

            setField(clone, 'tabela-notas-base', gerarHTMLNotasBasicas(aluno.notasBasicas));
            setField(clone, 'tabela-notas-tec', gerarHTMLNotasTecnicas(aluno.notasTecnicas));

            const linhasItem19 = extrairLinhasItem19(aluno.item19);
            const linhasPontuacao = linhasItem19.length
                ? linhasItem19
                : (aluno.pontuacaoPerdida || []);
            setField(clone, 'box-dificuldades-pontuacao', gerarDificuldadesComPontuacao(aluno.dificuldades, textosFichas.dificuldades, '', linhasPontuacao));
            setField(clone, 'box-propostas', gerarHTMLChecklist(aluno.propostas, textosFichas.propostas, aluno));
            setField(clone, 'box-resultados', gerarHTMLChecklist(aluno.resultados, textosFichas.resultados, aluno));
            setField(clone, 'box-soe', gerarHTMLChecklist(aluno.soe, textosFichas.soe, aluno));
            setField(clone, 'box-observacoes', escHtml(aluno.observacoes || ''));

            containerAtas.appendChild(clone);
        });

        tempContainer = document.createElement('div');
        tempContainer.className = 'pdf-render-container';

        headStyles.forEach(node => tempContainer.appendChild(node.cloneNode(true)));

        try {
            const cssResponse = await fetch('../../assets/css/conselho_style.css');
            if (cssResponse.ok) {
                const cssText = await cssResponse.text();
                const styleTag = document.createElement('style');
                styleTag.textContent = cssText;
                tempContainer.appendChild(styleTag);
            }
        } catch (err) {
            console.warn('Injeção direta do style.css falhou:', err);
        }

        tempContainer.appendChild(containerAtas);
        document.body.appendChild(tempContainer);

        if (document.fonts?.ready) {
            await document.fonts.ready;
        }
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        containerAtas.style.margin = '0';
        containerAtas.style.padding = '0';
        containerAtas.querySelectorAll('.page-ata').forEach((page) => {
            page.style.margin = '0';
            page.style.boxShadow = 'none';
        });

        const paginasAta = Array.from(containerAtas.querySelectorAll('.page-ata'));
        if (!paginasAta.length) {
            throw new Error('Nenhuma página de ata foi preparada para exportação.');
        }

        const JsPdf = window.jspdf && window.jspdf.jsPDF
            ? window.jspdf.jsPDF
            : window.jsPDF;
        if (!JsPdf) {
            throw new Error('A biblioteca jsPDF não foi carregada.');
        }

        const pdf = new JsPdf({
            unit: 'mm',
            format: 'a4',
            orientation: 'landscape',
            compress: true
        });

        for (let indice = 0; indice < paginasAta.length; indice += 1) {
            const paginaAta = paginasAta[indice];
            const canvas = await html2canvas(paginaAta, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                scrollX: 0,
                scrollY: 0,
                windowWidth: Math.ceil(paginaAta.getBoundingClientRect().width),
                windowHeight: Math.ceil(paginaAta.getBoundingClientRect().height)
            });

            const imagem = canvas.toDataURL('image/jpeg', 0.98);
            if (indice > 0) {
                pdf.addPage('a4', 'landscape');
            }
            pdf.addImage(imagem, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
        }

        const pdfBlob = pdf.output('blob');
        const nomeArquivo = obterNomeArquivoAta(
            paginasAta.map((_, indice) => state.alunos.find(a => a.ra === rasParaImprimir[indice])),
            state.turmaAtual?.nome,
            periodoInformado
        );

        const pdfUrl = URL.createObjectURL(pdfBlob);
        const abaPdf = window.open(pdfUrl, '_blank');

        const linkDownload = document.createElement('a');
        linkDownload.href = pdfUrl;
        linkDownload.download = nomeArquivo;
        linkDownload.style.display = 'none';
        document.body.appendChild(linkDownload);
        linkDownload.click();
        linkDownload.remove();

        if (!abaPdf) {
            toast(`PDF gerado e baixado como "${nomeArquivo}".`, 'success');
            return;
        }

        toast(`${rasParaImprimir.length} ata(s) gerada(s) como "${nomeArquivo}".`, 'success');

    } catch(e) {
        toast('Erro ao gerar PDF: ' + e.message, 'error');
        console.error(e);
    } finally {
        if (tempContainer?.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer);
        }
        document.body.classList.remove('is-exporting');
        ocultarLoading();
    }
}

function formatarPeriodo(periodo) {
    return String(periodo || '').replace(/_/g, ' ');
}

function nomeArquivoSeguro(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[. ]+$/, '');
}

function obterNomeArquivoAta(alunos, turma, periodo) {
    const turmaNome = nomeArquivoSeguro(turma || 'TURMA');
    const periodoNome = nomeArquivoSeguro(formatarPeriodo(periodo).toUpperCase() || 'PERIODO');
    if (alunos.length === 1) {
        const alunoNome = nomeArquivoSeguro(alunos[0]?.nome_completo || 'ALUNO');
        return `${alunoNome} - ${turmaNome} - ATA ${periodoNome}.pdf`;
    }
    return `${turmaNome} - ATA ${periodoNome}.pdf`;
}

// ============================================================
// HELPERS DE INTERFACE
// ============================================================
function mostrarLoading(txt = 'Carregando...') {
    const overlay = document.getElementById('loading-overlay');
    const label = document.getElementById('loading-text');
    if (overlay) overlay.classList.remove('hidden');
    if (label) label.textContent = txt;
}

function ocultarLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function toast(msg, tipo = 'info') {
    const el = document.createElement('div');
    el.className = `toast ${tipo}`;
    el.innerHTML = `<span>${escHtml(msg)}</span>`;
    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }
}