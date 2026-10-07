(function () {
  const state = { provider: null, alunos: [], catalogos: null, turma: [], padraoDificuldades: [], padraoPropostas: [] };
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const values = (value) => String(value || '').match(/\d+/g)?.map(Number) || [];
  const periodLabel = (value) => String(value || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

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
      fillSelect($('turma'), state.turma.map((item) => ({ value:item.id, label:item.nome })), 'Selecione');
      fillSelect($('periodo'), contextos.periodos.map((item) => ({ value:item, label:periodLabel(item) })));
      fillSelect($('ano'), contextos.anosLetivos.map((item) => ({ value:item, label:item })));
      renderPattern();
      $('turma').disabled = $('periodo').disabled = $('ano').disabled = false;
      $('load').disabled = false;
      setStatus('Selecione a turma e carregue os alunos.');
    } catch (error) { setStatus(error.message, true); }
  }
  function fillSelect(select, options, placeholder) {
    select.innerHTML = (placeholder ? `<option value="">${placeholder}</option>` : '') + options.map((item) => `<option value="${esc(item.value)}">${esc(item.label)}</option>`).join('');
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
  function renderStudents() {
    if (!state.alunos.length) {
      $('students').innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum aluno encontrado para os filtros selecionados.</td></tr>';
      return;
    }
    $('students').innerHTML = state.alunos.map((aluno) => {
      const difficulties = values(aluno.dificuldades), proposals = values(aluno.propostas);
      const lowGrades = [...(aluno.notasBasicas || []), ...(aluno.notasTecnicas || [])]
        .filter((item) => item.nota !== null && item.nota !== undefined && item.nota !== ''
          && Number.isFinite(Number(item.nota)) && Number(item.nota) < 6)
        .map((item) => `${item.disciplina}: ${Number(item.nota).toFixed(1)}`).join(' · ');
      return `<tr data-ra="${esc(aluno.ra)}"><td><span class="student">${esc(aluno.nome_completo)}</span><span class="ra">RA ${esc(aluno.ra)}</span><span class="grades">${esc(lowGrades)}</span></td><td><div class="student-checks">${checkboxes(state.catalogos.dificuldades || [], `difficulty-${aluno.ra}`, difficulties)}</div></td><td><div class="student-checks">${checkboxes(state.catalogos.propostas || [], `proposal-${aluno.ra}`, proposals)}</div></td><td><textarea class="${difficulties.includes(19) ? '' : 'hidden'}" data-item19>${esc(aluno.item19 || '')}</textarea></td></tr>`;
    }).join('');
    document.querySelectorAll('input[name^="difficulty-"]').forEach((input) => input.addEventListener('change', updateItem19));
  }
  function updateItem19(event) { event.target.closest('tr').querySelector('[data-item19]').classList.toggle('hidden', !selected(event.target.name).includes(19)); }
  function invalidateLoadedStudents() {
    state.alunos = [];
    $('students').innerHTML = '<tr><td colspan="4" class="empty-state">Carregue os alunos da turma selecionada para preencher as fichas.</td></tr>';
    $('save').disabled = true;
    $('apply-pattern').disabled = true;
    setStatus('Os filtros foram alterados. Carregue os alunos novamente antes de editar ou salvar.');
  }

  ['turma', 'periodo', 'ano'].forEach((id) => $(id).addEventListener('change', invalidateLoadedStudents));

  $('load').addEventListener('click', async () => {
    if (!$('turma').value) return setStatus('Selecione uma turma.', true);
    state.alunos = [];
    $('students').innerHTML = '<tr><td colspan="4" class="empty-state">Carregando alunos...</td></tr>';
    $('load').disabled = true;
    $('save').disabled = true;
    $('apply-pattern').disabled = true;
    setStatus('Carregando alunos...');
    try {
      state.alunos = await state.provider.getAlunosParaPreenchimento($('turma').value, { periodo:$('periodo').value, anoLetivo:Number($('ano').value) });
      renderStudents();
      $('save').disabled = $('apply-pattern').disabled = state.alunos.length === 0;
      setStatus(`${state.alunos.length} aluno(s) carregado(s). As fichas deste período e ano serão atualizadas ou criadas ao salvar.`);
    } catch (error) {
      $('students').innerHTML = `<tr><td colspan="4" class="empty-state error">${esc(error.message)}</td></tr>`;
      setStatus(error.message, true);
    } finally {
      $('load').disabled = false;
    }
  });
  $('apply-pattern').addEventListener('click', () => {
    state.padraoDificuldades = selected('pattern-difficulty'); state.padraoPropostas = selected('pattern-proposal');
    state.alunos.forEach((aluno) => { aluno.dificuldades = state.padraoDificuldades.join(', '); aluno.propostas = state.padraoPropostas.join(', '); });
    renderStudents(); setStatus('Padrão aplicado. Ajuste individualmente quando necessário.');
  });
  $('save').addEventListener('click', async () => {
    $('save').disabled = true;
    $('apply-pattern').disabled = true;
    try {
      const alunos = state.alunos.map((aluno) => { const row = document.querySelector(`tr[data-ra="${CSS.escape(aluno.ra)}"]`); return { ra:aluno.ra, dificuldades:selected(`difficulty-${aluno.ra}`), propostas:selected(`proposal-${aluno.ra}`), item19:row.querySelector('[data-item19]').value.trim() }; });
      await state.provider.salvarPreenchimento({ idTurma:$('turma').value, periodo:$('periodo').value, anoLetivo:Number($('ano').value), padraoDificuldades:state.padraoDificuldades, padraoPropostas:state.padraoPropostas, alunos });
      setStatus('Fichas salvas com sucesso.', false, true);
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      $('save').disabled = state.alunos.length === 0;
      $('apply-pattern').disabled = state.alunos.length === 0;
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
