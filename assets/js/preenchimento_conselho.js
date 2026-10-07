(function () {
  const state = { provider: null, alunos: [], catalogos: null, turma: [], padraoDificuldades: [], padraoPropostas: [], importRows: null, previewToken: 0 };
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const values = (value) => String(value || '').match(/\d+/g)?.map(Number) || [];
  const periodLabel = (value) => String(value || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  const importHeaders = [
    { key:'ra', label:'RA' },
    { key:'periodo', label:'Período' },
    { key:'dificuldades', label:'Dificuldades' },
    { key:'propostas', label:'Propostas' },
    { key:'descricaodoitem19', label:'Descrição do Item 19' }
  ];

  async function init() {
    try {
      await window.supabaseProviderReady;
      state.provider = window.dataProvider;
      const [turmas, catalogos, contextos] = await Promise.all([
        state.provider.getTurmas(),
        state.provider.getCatalogos(),
        state.provider.getContextos()
      ]);
      state.turma = turmas;
      state.catalogos = catalogos;
      fillSelect($('etapa'), [
        { value:'EMT', label:'EMT' },
        { value:'EF', label:'EF1 + EF2' }
      ], 'Todos');
      fillTurmaSelect();
      fillSelect($('periodo'), contextos.periodos.map((item) => ({ value:item, label:periodLabel(item) })));
      fillSelect($('ano'), contextos.anosLetivos.map((item) => ({ value:item, label:item })));
      fillSelect($('matricula-filtro'), [
        { value:'CURSANDO', label:'Cursando' },
        { value:'', label:'Todos' }
      ]);
      fillSelect($('notas-filtro'), [
        { value:'', label:'Todos' },
        { value:'ABAIXO_MEDIA', label:'Abaixo da média' }
      ]);
      $('matricula-filtro').value = 'CURSANDO';
      renderPattern();
      $('etapa').disabled = $('turma').disabled = $('periodo').disabled = $('ano').disabled = $('matricula-filtro').disabled = $('notas-filtro').disabled = false;
      $('load').disabled = false;
      setStatus('Carregue os alunos; por padrão, serão exibidas apenas matrículas Cursando.');
    } catch (error) { setStatus(error.message, true); }
  }
  function fillSelect(select, options, placeholder) {
    select.innerHTML = (placeholder ? `<option value="">${placeholder}</option>` : '') + options.map((item) => `<option value="${esc(item.value)}">${esc(item.label)}</option>`).join('');
  }
  function fillTurmaSelect() {
    const turmas = turmasDaEtapa();
    const selectedTurma = $('turma').value;
    fillSelect($('turma'), turmas.map((item) => ({ value:item.id, label:item.nome })), 'Todos');
    if (turmas.some((item) => String(item.id) === selectedTurma)) $('turma').value = selectedTurma;
  }
  function turmasDaEtapa() {
    const etapa = $('etapa').value;
    return state.turma.filter((turma) => {
      const nivel = String(turma.nivel || '').toUpperCase();
      return !etapa || (etapa === 'EF' ? nivel.startsWith('EF') : nivel.startsWith(etapa));
    });
  }
  function checkboxes(items, name, selected = []) {
    return Array.from(items, (text, index) => text
      ? `<label class="check-option" title="${esc(text)}"><input type="checkbox" name="${name}" value="${index + 1}" ${selected.includes(index + 1) ? 'checked' : ''}><span>${index + 1}</span></label>`
      : '').join('');
  }
  function renderPattern() {
    $('pattern-difficulties').innerHTML = checkboxes(state.catalogos.dificuldades || [], 'pattern-difficulty', state.padraoDificuldades);
    $('pattern-proposals').innerHTML = checkboxes(state.catalogos.propostas || [], 'pattern-proposal', state.padraoPropostas);
  }
  function selected(name) { return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => Number(input.value)); }
  function setImportStatus(message, error = false, success = false) {
    $('import-status').textContent = message;
    $('import-status').className = `status w-full mb-0 ${error ? 'error' : success ? 'success' : ''}`;
  }
  function clearImportFile() {
    state.previewToken++;
    state.importRows = null;
    $('council-import-file').value = '';
    $('remove-import-file').disabled = true;
    $('validate-import').disabled = true;
    $('apply-import').disabled = true;
    $('import-preview').innerHTML = '';
    $('import-preview').classList.add('hidden');
    setImportStatus(state.alunos.length
      ? 'Selecione uma planilha Excel ou CSV para visualizar os cabeçalhos.'
      : 'Carregue os alunos antes de importar. Cabeçalhos obrigatórios: RA, Período, Dificuldades, Propostas e Descrição do Item 19.');
  }
  function renderImportPreview(headers) {
    const occurrences = new Map();
    headers.forEach((header) => {
      const normalized = normalizeHeader(header);
      if (normalized) occurrences.set(normalized, (occurrences.get(normalized) || 0) + 1);
    });
    const detected = new Set(headers.map(normalizeHeader).filter(Boolean));
    const missing = importHeaders.filter((header) => !detected.has(header.key));
    const cells = headers.map((header) => {
      const normalized = normalizeHeader(header);
      const required = importHeaders.find((item) => item.key === normalized);
      const duplicate = normalized && occurrences.get(normalized) > 1;
      const className = !normalized || duplicate ? 'header-invalid'
        : required ? 'header-valid' : 'header-extra';
      const title = duplicate ? 'Cabeçalho duplicado' : required ? 'Coluna obrigatória reconhecida' : normalized ? 'Coluna extra' : 'Cabeçalho vazio';
      return `<th class="${className}" title="${title}">${esc(String(header ?? '').trim() || 'Coluna sem título')}</th>`;
    });
    missing.forEach((header) => cells.push(`<th class="header-invalid" title="Coluna obrigatória ausente">Faltando: ${esc(header.label)}</th>`));
    const preview = $('import-preview');
    preview.innerHTML = `<table aria-label="Prévia dos cabeçalhos importados"><thead><tr>${cells.join('')}</tr></thead></table><p class="import-preview-caption p-3">Cabeçalho detectado. Verde: coluna obrigatória reconhecida; vermelho: cabeçalho vazio ou coluna obrigatória ausente; cinza: coluna extra.</p>`;
    preview.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
    return { missing, hasDuplicates:[...occurrences.values()].some((count) => count > 1) };
  }
  function normalizeHeader(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  function normalizeRa(value) {
    return String(value ?? '').trim().replace(/\s/g, '').replace(/\.0$/, '');
  }
  function normalizePeriod(value) {
    return String(value ?? '').trim().toUpperCase().replace(/\s+/g, '_');
  }
  function notaNumerica(valor) {
    if (valor === null || valor === undefined || valor === '') return null;
    const numero = Number(String(valor).trim().replace(',', '.'));
    return Number.isFinite(numero) ? numero : null;
  }
  function temNotaAbaixoDaMedia(aluno) {
    return [...(aluno.notasBasicas || []), ...(aluno.notasTecnicas || [])]
      .some((item) => {
        const nota = notaNumerica(item.nota);
        return nota !== null && nota < 6;
      });
  }
  function alunosVisiveis() {
    const matriculaFiltro = $('matricula-filtro').value;
    const notasFiltro = $('notas-filtro').value;
    return state.alunos.filter((aluno) => {
      const cursando = String(aluno.statusMatricula || '').trim().toUpperCase() === 'CURSANDO';
      return (!matriculaFiltro || cursando)
        && (notasFiltro !== 'ABAIXO_MEDIA' || temNotaAbaixoDaMedia(aluno));
    });
  }
  function persistDisplayedEdits() {
    document.querySelectorAll('#students tr[data-ra]').forEach((row) => {
      const aluno = state.alunos.find((item) => String(item.ra) === row.dataset.ra);
      if (!aluno) return;
      aluno.dificuldades = selected(`difficulty-${aluno.ra}`).join(', ');
      aluno.propostas = selected(`proposal-${aluno.ra}`).join(', ');
      aluno.item19 = row.querySelector('[data-item19]').value.trim();
    });
  }
  function parseImportedItems(value, catalog, columnName, rowNumber) {
    const text = String(value ?? '').trim();
    if (!text) return [];
    if (!/^[\d\s,;|/]+$/.test(text)) throw new Error(`Linha ${rowNumber}: ${columnName} deve conter números dos itens separados por vírgula, ponto e vírgula ou barra.`);
    const itemNumbers = text.match(/\d+/g).map(Number);
    const invalid = itemNumbers.find((item) => item < 1 || item > catalog.length || !catalog[item - 1]);
    if (invalid !== undefined) throw new Error(`Linha ${rowNumber}: item ${invalid} não existe no catálogo de ${columnName.toLowerCase()}.`);
    return [...new Set(itemNumbers)];
  }
  function validateImportRows(rows) {
    if (!state.alunos.length) throw new Error('Carregue os alunos antes de conferir a planilha.');
    if (!rows.length || !Array.isArray(rows[0])) throw new Error('A primeira linha da planilha precisa conter os cabeçalhos das colunas.');
    const required = importHeaders.map((header) => header.key);
    const headerIndexes = new Map();
    rows[0].forEach((header, index) => {
      const normalized = normalizeHeader(header);
      if (normalized && headerIndexes.has(normalized)) throw new Error(`Cabeçalho duplicado após normalização: "${header}".`);
      if (normalized) headerIndexes.set(normalized, index);
    });
    const missing = required.filter((header) => !headerIndexes.has(header));
    if (missing.length) throw new Error(`Colunas obrigatórias ausentes: ${missing.map((header) => ({
      ra:'RA', periodo:'Período', dificuldades:'Dificuldades', propostas:'Propostas', descricaodoitem19:'Descrição do Item 19'
    })[header]).join(', ')}.`);

    const column = Object.fromEntries(required.map((header) => [header, headerIndexes.get(header)]));
    const alunosPorRa = new Map();
    alunosVisiveis().forEach((aluno) => {
      const ra = normalizeRa(aluno.ra);
      if (alunosPorRa.has(ra)) throw new Error(`O RA ${ra} aparece mais de uma vez entre os alunos carregados; a importação foi cancelada.`);
      alunosPorRa.set(ra, aluno);
    });

    const seen = new Set();
    const imported = [];
    const errors = [];
    rows.slice(1).forEach((row, index) => {
      const rowNumber = index + 2;
      if (!row || row.every((cell) => String(cell ?? '').trim() === '')) return;
      const ra = normalizeRa(row[column.ra]);
      if (!ra) {
        errors.push(`Linha ${rowNumber}: RA vazio.`);
        return;
      }
      if (seen.has(ra)) {
        errors.push(`Linha ${rowNumber}: RA ${ra} duplicado na planilha.`);
        return;
      }
      seen.add(ra);
      if (!alunosPorRa.has(ra)) {
        errors.push(`Linha ${rowNumber}: RA ${ra} não corresponde aos alunos exibidos pelos filtros atuais.`);
        return;
      }
      const periodo = normalizePeriod(row[column.periodo]);
      const periodoSelecionado = $('periodo').value;
      if (!['1_BIMESTRE', '2_BIMESTRE', '3_BIMESTRE', '4_BIMESTRE', '1_TRIMESTRE', '2_TRIMESTRE', '3_TRIMESTRE', '1_SEMESTRE', '2_SEMESTRE'].includes(periodo)) {
        errors.push(`Linha ${rowNumber}: período inválido. Use formatos como 1_BIMESTRE, 2_TRIMESTRE ou 1_SEMESTRE.`);
        return;
      }
      if (periodo !== periodoSelecionado) {
        errors.push(`Linha ${rowNumber}: o período ${periodo} não corresponde ao filtro selecionado (${periodoSelecionado}).`);
        return;
      }
      try {
        const dificuldades = parseImportedItems(row[column.dificuldades], state.catalogos.dificuldades || [], 'Dificuldades', rowNumber);
        const propostas = parseImportedItems(row[column.propostas], state.catalogos.propostas || [], 'Propostas', rowNumber);
        const item19 = String(row[column.descricaodoitem19] ?? '').trim();
        if (item19 && !dificuldades.includes(19)) {
          if (!(state.catalogos.dificuldades || [])[18]) throw new Error(`Linha ${rowNumber}: não há item 19 no catálogo de dificuldades para associar a descrição.`);
          dificuldades.push(19);
        }
        imported.push({ ra, periodo, dificuldades, propostas, item19 });
      } catch (error) {
        errors.push(error.message);
      }
    });
    if (errors.length) throw new Error(`Planilha não aprovada:\n${errors.slice(0, 8).join('\n')}${errors.length > 8 ? `\n... e mais ${errors.length - 8} erro(s).` : ''}`);
    if (!imported.length) throw new Error('A planilha não contém linhas válidas para importar.');
    return imported;
  }
  async function validateImportFile() {
    const file = $('council-import-file').files?.[0];
    const token = state.previewToken;
    state.importRows = null;
    $('apply-import').disabled = true;
    if (!file) return setImportStatus('Selecione uma planilha Excel ou CSV.', true);
    if (!window.XLSX) return setImportStatus('Não foi possível carregar o leitor de planilhas. Atualize a página e tente novamente.', true);
    $('validate-import').disabled = true;
    setImportStatus('Conferindo cabeçalhos da planilha...');
    try {
      const workbook = window.XLSX.read(await file.arrayBuffer(), { type:'array', cellText:true, cellDates:false });
      if (token !== state.previewToken) return;
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!firstSheet) throw new Error('A planilha não contém uma primeira aba para importar.');
      const rows = window.XLSX.utils.sheet_to_json(firstSheet, { header:1, defval:'', raw:false });
      if (!rows.length || !Array.isArray(rows[0])) throw new Error('A primeira linha da planilha precisa conter os cabeçalhos das colunas.');
      const previewResult = renderImportPreview(rows[0]);
      if (previewResult.missing.length) throw new Error(`Colunas obrigatórias ausentes: ${previewResult.missing.map((header) => header.label).join(', ')}.`);
      if (previewResult.hasDuplicates) throw new Error('Há cabeçalhos duplicados após a normalização.');
      if (!state.alunos.length) {
        setImportStatus('Cabeçalhos conferidos. Carregue os alunos para validar os RAs e habilitar a aplicação.', false, true);
        return;
      }
      state.importRows = validateImportRows(rows);
      $('apply-import').disabled = false;
      setImportStatus(`${state.importRows.length} linha(s) conferida(s). Cabeçalhos normalizados, período ${$('periodo').value} e RAs correspondentes à turma.`, false, true);
    } catch (error) {
      if (token !== state.previewToken) return;
      state.importRows = null;
      setImportStatus(error.message, true);
    } finally {
      if (token === state.previewToken) $('validate-import').disabled = !$('council-import-file').files?.length;
    }
  }
  async function previewImportFile() {
      const file = $('council-import-file').files?.[0];
      const token = ++state.previewToken;
      state.importRows = null;
      $('apply-import').disabled = true;
      $('remove-import-file').disabled = !file;
      $('validate-import').disabled = !file;
      $('import-preview').innerHTML = '';
      $('import-preview').classList.add('hidden');
      if (!file) return setImportStatus('Selecione uma planilha Excel ou CSV.', true);
      if (!window.XLSX) return setImportStatus('Não foi possível carregar o leitor de planilhas. Atualize a página e tente novamente.', true);
      setImportStatus('Lendo os cabeçalhos da planilha...');
      try {
        const workbook = window.XLSX.read(await file.arrayBuffer(), { type:'array', cellText:true, cellDates:false });
        if (token !== state.previewToken) return;
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) throw new Error('A planilha não contém uma primeira aba para pré-visualizar.');
        const rows = window.XLSX.utils.sheet_to_json(firstSheet, { header:1, defval:'', raw:false });
        if (!rows.length || !Array.isArray(rows[0]) || !rows[0].length) throw new Error('A primeira linha da planilha não contém cabeçalhos.');
        const { missing, hasDuplicates } = renderImportPreview(rows[0]);
        if (missing.length || hasDuplicates) {
          setImportStatus('Prévia pronta. Há cabeçalhos obrigatórios ausentes ou duplicados; corrija a planilha e confira novamente.', true);
        } else {
          setImportStatus('Prévia pronta. Os cabeçalhos obrigatórios foram reconhecidos; confira os dados para continuar.');
        }
      } catch (error) {
        if (token !== state.previewToken) return;
        $('import-preview').innerHTML = `<p class="p-3 text-sm font-bold text-red-700">${esc(error.message)}</p>`;
        $('import-preview').classList.remove('hidden');
        setImportStatus(error.message, true);
      }
  }
  function applyImport() {
    if (!state.importRows?.length) return setImportStatus('Confira uma planilha válida antes de aplicar os dados.', true);
    if (!state.alunos.length) return setImportStatus('Carregue os alunos antes de aplicar a planilha.', true);
    try {
      const alunosPorRa = new Map(alunosVisiveis().map((aluno) => [normalizeRa(aluno.ra), aluno]));
      state.importRows.forEach((row) => {
        const aluno = alunosPorRa.get(row.ra);
        if (!aluno) throw new Error(`O RA ${row.ra} não está mais entre os alunos carregados. Confira a planilha novamente.`);
        aluno.dificuldades = row.dificuldades.join(', ');
        aluno.propostas = row.propostas.join(', ');
        aluno.item19 = row.item19;
      });
      const count = state.importRows.length;
      state.importRows = null;
      $('apply-import').disabled = true;
      renderStudents();
      $('save').disabled = false;
      setImportStatus(`${count} aluno(s) aplicados à tabela. Revise os dados e clique em “Salvar fichas” para gravar.`, false, true);
    } catch (error) {
      setImportStatus(error.message, true);
    }
  }
  function renderStudents() {
    if (!state.alunos.length) {
      $('students').innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum aluno encontrado para os filtros selecionados.</td></tr>';
      return;
    }
    const exibidos = alunosVisiveis();
    if (!exibidos.length) {
      $('students').innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum aluno corresponde aos filtros de matrícula e notas.</td></tr>';
      return;
    }
    $('students').innerHTML = exibidos.map((aluno) => {
      const difficulties = values(aluno.dificuldades), proposals = values(aluno.propostas);
      const lowGrades = [...(aluno.notasBasicas || []), ...(aluno.notasTecnicas || [])]
        .map((item) => ({ ...item, notaNumerica:notaNumerica(item.nota) }))
        .filter((item) => item.notaNumerica !== null && item.notaNumerica < 6)
        .map((item) => `${item.disciplina}: ${item.notaNumerica.toFixed(1)}`).join(' · ');
      const turma = state.turma.find((item) => String(item.id) === String(aluno.id_turma));
      return `<tr data-ra="${esc(aluno.ra)}"><td><span class="student">${esc(aluno.nome_completo)}</span><span class="ra">RA ${esc(aluno.ra)}</span><span class="grades">${esc(lowGrades)}</span></td><td>${esc(turma?.nome || 'Turma não identificada')}</td><td><div class="student-checks">${checkboxes(state.catalogos.dificuldades || [], `difficulty-${aluno.ra}`, difficulties)}</div></td><td><div class="student-checks">${checkboxes(state.catalogos.propostas || [], `proposal-${aluno.ra}`, proposals)}</div></td><td><textarea class="${difficulties.includes(19) ? '' : 'hidden'}" data-item19>${esc(aluno.item19 || '')}</textarea></td></tr>`;
    }).join('');
    document.querySelectorAll('input[name^="difficulty-"]').forEach((input) => input.addEventListener('change', updateItem19));
  }
  function updateItem19(event) { event.target.closest('tr').querySelector('[data-item19]').classList.toggle('hidden', !selected(event.target.name).includes(19)); }
  function invalidateLoadedStudents() {
    state.alunos = [];
    state.importRows = null;
    $('students').innerHTML = '<tr><td colspan="5" class="empty-state">Carregue os alunos para preencher as fichas.</td></tr>';
    $('save').disabled = true;
    $('apply-pattern').disabled = true;
    $('validate-import').disabled = true;
    $('apply-import').disabled = true;
    state.previewToken++;
    $('council-import-file').value = '';
    $('remove-import-file').disabled = true;
    $('import-preview').innerHTML = '';
    $('import-preview').classList.add('hidden');
    setImportStatus('Carregue os alunos antes de importar. Cabeçalhos obrigatórios: RA, Período, Dificuldades, Propostas e Descrição do Item 19.');
    setStatus('Os filtros foram alterados. Carregue os alunos novamente antes de editar ou salvar.');
  }

  $('etapa').addEventListener('change', () => {
    fillTurmaSelect();
    invalidateLoadedStudents();
  });
  ['turma', 'periodo', 'ano'].forEach((id) => $(id).addEventListener('change', invalidateLoadedStudents));
  ['matricula-filtro', 'notas-filtro'].forEach((id) => $(id).addEventListener('change', () => {
    persistDisplayedEdits();
    state.importRows = null;
    $('apply-import').disabled = true;
    $('validate-import').disabled = !$('council-import-file').files?.length;
    renderStudents();
    const exibidos = alunosVisiveis().length;
    $('save').disabled = $('apply-pattern').disabled = exibidos === 0;
    setStatus(`${exibidos} de ${state.alunos.length} aluno(s) correspondem aos filtros.`, false, true);
  }));

  $('load').addEventListener('click', async () => {
    state.alunos = [];
    $('students').innerHTML = '<tr><td colspan="5" class="empty-state">Carregando alunos...</td></tr>';
    $('load').disabled = true;
    $('save').disabled = true;
    $('apply-pattern').disabled = true;
    $('validate-import').disabled = true;
    $('apply-import').disabled = true;
    state.importRows = null;
    setStatus('Carregando alunos...');
    try {
      const alunos = await state.provider.getAlunosParaPreenchimento($('turma').value || null, { periodo:$('periodo').value, anoLetivo:Number($('ano').value) });
      const turmasPermitidas = new Set(turmasDaEtapa().map((turma) => String(turma.id)));
      state.alunos = alunos.filter((aluno) => turmasPermitidas.has(String(aluno.id_turma)));
      renderStudents();
      $('save').disabled = $('apply-pattern').disabled = alunosVisiveis().length === 0;
      $('validate-import').disabled = !$('council-import-file').files?.length;
      const turmaLabel = $('turma').value ? `da turma ${state.turma.find((item) => String(item.id) === $('turma').value)?.nome || ''}` : $('etapa').value === 'EF' ? 'do Ensino Fundamental (EF1 + EF2)' : $('etapa').value === 'EMT' ? 'do Ensino Médio (EMT)' : 'de todas as turmas';
      setStatus(`${alunosVisiveis().length} de ${state.alunos.length} aluno(s) ${turmaLabel} correspondem aos filtros. As fichas exibidas serão atualizadas ou criadas ao salvar.`);
    } catch (error) {
      $('students').innerHTML = `<tr><td colspan="5" class="empty-state error">${esc(error.message)}</td></tr>`;
      setStatus(error.message, true);
    } finally {
      $('load').disabled = false;
    }
  });
  $('council-import-file').addEventListener('change', () => {
    previewImportFile();
  });
  $('remove-import-file').addEventListener('click', clearImportFile);
  $('validate-import').addEventListener('click', validateImportFile);
  $('apply-import').addEventListener('click', applyImport);
  $('apply-pattern').addEventListener('click', () => {
    state.padraoDificuldades = selected('pattern-difficulty'); state.padraoPropostas = selected('pattern-proposal');
    alunosVisiveis().forEach((aluno) => { aluno.dificuldades = state.padraoDificuldades.join(', '); aluno.propostas = state.padraoPropostas.join(', '); });
    renderStudents(); setStatus('Padrão aplicado. Ajuste individualmente quando necessário.');
  });
  $('save').addEventListener('click', async () => {
    $('save').disabled = true;
    $('apply-pattern').disabled = true;
    try {
      const alunosPorTurma = new Map();
      alunosVisiveis().forEach((aluno) => {
        const row = document.querySelector(`tr[data-ra="${CSS.escape(aluno.ra)}"]`);
        const idTurma = String(aluno.id_turma || '');
        if (!idTurma) throw new Error(`Não foi possível identificar a turma do aluno ${aluno.nome_completo} (RA ${aluno.ra}). Nenhuma ficha foi salva.`);
        if (!row) throw new Error(`Não foi possível ler os dados exibidos do aluno ${aluno.nome_completo} (RA ${aluno.ra}). Nenhuma ficha foi salva.`);
        const grupo = alunosPorTurma.get(idTurma) || [];
        grupo.push({ ra:aluno.ra, dificuldades:selected(`difficulty-${aluno.ra}`), propostas:selected(`proposal-${aluno.ra}`), item19:row.querySelector('[data-item19]').value.trim() });
        alunosPorTurma.set(idTurma, grupo);
      });
      for (const [idTurma, alunos] of alunosPorTurma) {
        await state.provider.salvarPreenchimento({ idTurma, periodo:$('periodo').value, anoLetivo:Number($('ano').value), padraoDificuldades:state.padraoDificuldades, padraoPropostas:state.padraoPropostas, alunos });
      }
      setStatus('Fichas salvas com sucesso.', false, true);
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      $('save').disabled = alunosVisiveis().length === 0;
      $('apply-pattern').disabled = alunosVisiveis().length === 0;
    }
  });
  function setStatus(message, error = false, success = false) { $('status').textContent = message; $('status').className = `status ${error ? 'error' : success ? 'success' : ''}`; }

  window.addEventListener('DOMContentLoaded', async () => {
    try {
      if (await window.requireCouncilCoordinator()) {
        await window.SidebarComponent.render('sidebar-container');
        await init();
      }
    } catch (error) {
      console.error('Acesso ao preenchimento do Conselho não inicializado:', error);
    }
  });
})();
