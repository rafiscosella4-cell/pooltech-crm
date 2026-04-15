document.addEventListener('DOMContentLoaded', () => {
  const calcularBtn = document.getElementById('calcularBtn');
  const custoTotalInput = document.getElementById('custoTotal');
  const horasTrabalhadasInput = document.getElementById('horasTrabalhadas');
  const valorHoraInput = document.getElementById('valorHora');
  const cardResultado = document.getElementById('cardResultado');
  const precoFinalEl = document.getElementById('precoFinal');
  const precoMinimoEl = document.getElementById('precoMinimo');
  const precoIdealEl = document.getElementById('precoIdeal');
  const indicadorEl = document.getElementById('indicador');
  const chartCircle = document.getElementById('chartCircle');
  const chartLine = document.getElementById('chartLine');
  const progressFill = document.getElementById('progressFill');
  const historicoTable = document.getElementById('historicoTable');
  const historicoBody = document.getElementById('historicoBody');
  const historicoVazio = document.getElementById('historicoVazio');
  const historicoCount = document.getElementById('historicoCount');
  const limparHistoricoBtn = document.getElementById('limparHistorico');

  let historico = [];

  // Presets de profissões
  const presets = {
    diarista: { custo: 150, horas: 8, valor: 35 },
    eletricista: { custo: 200, horas: 2, valor: 80 },
    encanador: { custo: 100, horas: 3, valor: 70 },
    designer: { custo: 50, horas: 10, valor: 60 },
    mecanico: { custo: 300, horas: 4, valor: 90 }
  };

  limparHistoricoBtn.addEventListener('click', limparHistorico);

  // Listeners para botões preset
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const presetName = btn.dataset.preset;
      preencherPreset(presetName);
    });
  });

  calcularBtn.addEventListener('click', calcularPreco);

  function calcularPreco() {
    const custoTotal = parseFloat(custoTotalInput.value);
    const horasTrabalhadas = parseFloat(horasTrabalhadasInput.value);
    const valorHora = parseFloat(valorHoraInput.value);

    if (!validarInputs(custoTotal, horasTrabalhadas, valorHora)) {
      return;
    }

    const precoBase = custoTotal + (horasTrabalhadas * valorHora);
    const precoMinimo = custoTotal * 1.05;
    const precoIdeal = custoTotal + (horasTrabalhadas * valorHora * 1.2);
    const precoSugerido = precoBase * 1.2;

    historico.push({
      custo: custoTotal,
      horas: horasTrabalhadas,
      valor: valorHora,
      preco: precoSugerido,
      data: new Date()
    });

    exibirResultado(precoSugerido, precoMinimo, precoIdeal);
    desenharGraficos(precoMinimo, precoSugerido, precoIdeal);
    atualizarTablaHistorico();
    cardResultado.classList.remove('oculto');
  }

  function validarInputs(custo, horas, valor) {
    if (isNaN(custo) || isNaN(horas) || isNaN(valor)) {
      return false;
    }

    if (custo < 0 || horas < 0 || valor < 0) {
      return false;
    }

    return true;
  }

  function exibirResultado(precoFinal, precoMinimo, precoIdeal) {
    precoFinalEl.textContent = formatarMoeda(precoFinal);
    precoMinimoEl.textContent = formatarMoeda(precoMinimo);
    precoIdealEl.textContent = formatarMoeda(precoIdeal);

    const indicador = determinarIndicador(precoFinal, precoMinimo, precoIdeal);
    indicadorEl.textContent = indicador.texto;
    indicadorEl.className = `card-badge ${indicador.classe}`;

    // Aplicar cor dinâmica ao card resultado
    cardResultado.classList.remove('indicador-baixo', 'indicador-alto', 'indicador-justo');
    if (precoFinal < precoMinimo) {
      cardResultado.classList.add('indicador-baixo');
    } else if (precoFinal > precoIdeal) {
      cardResultado.classList.add('indicador-alto');
    } else {
      cardResultado.classList.add('indicador-justo');
    }

    // Atualizar barra de progresso visual
    const range = precoIdeal - precoMinimo;
    const position = Math.min(Math.max((precoFinal - precoMinimo) / range, 0), 1);
    progressFill.style.width = (position * 100) + '%';
  }

  function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  function determinarIndicador(precoFinal, precoMinimo, precoIdeal) {
    if (precoFinal < precoMinimo) {
      return { texto: '🔴 Preço Baixo', classe: 'badge-danger' };
    }

    if (precoFinal > precoIdeal) {
      return { texto: '🟡 Preço Alto', classe: 'badge-warning' };
    }

    return { texto: '🟢 Preço Justo', classe: 'badge-success' };
  }

  function desenharGraficos(precoMinimo, precoFinal, precoIdeal) {
    desenharGraficoCirculo(precoMinimo, precoFinal, precoIdeal);
    desenharGraficoLinha();
  }

  function desenharGraficoCirculo(precoMinimo, precoFinal, precoIdeal) {
    const ctx = chartCircle.getContext('2d');
    const rect = chartCircle.getBoundingClientRect();
    chartCircle.width = rect.width * window.devicePixelRatio;
    chartCircle.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const canvasWidth = rect.width;
    const canvasHeight = rect.height;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) / 2.5;

    // Valores normalizados
    const total = precoIdeal;
    const minPercent = (precoMinimo / total) * 100;
    const midPercent = ((precoFinal - precoMinimo) / total) * 100;
    const maxPercent = ((precoIdeal - precoFinal) / total) * 100;

    // Desenhar donut chart
    let startAngle = -Math.PI / 2;

    // Setor 1: Preço Mínimo (Vermelho)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + (minPercent / 100) * 2 * Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
    startAngle += (minPercent / 100) * 2 * Math.PI;

    // Setor 2: Preço Recomendado (Azul)
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + (midPercent / 100) * 2 * Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
    startAngle += (midPercent / 100) * 2 * Math.PI;

    // Setor 3: Preço Alto (Amarelo)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + (maxPercent / 100) * 2 * Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // Círculo branco no centro (donut)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fill();

    // Texto no centro
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 24px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('IDEAL', centerX, centerY - 10);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter';
    ctx.fillText('recomendado', centerX, centerY + 15);
  }

  function desenharGraficoLinha() {
    if (historico.length === 0) return;

    const ctx = chartLine.getContext('2d');
    const rect = chartLine.getBoundingClientRect();
    chartLine.width = rect.width * window.devicePixelRatio;
    chartLine.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const canvasWidth = rect.width;
    const canvasHeight = rect.height;
    const padding = 40;
    const graphWidth = canvasWidth - padding * 2;
    const graphHeight = canvasHeight - padding * 2;

    // Fundo
    ctx.fillStyle = 'rgba(0, 212, 255, 0.05)';
    ctx.fillRect(padding, padding, graphWidth, graphHeight);

    // Grade
    ctx.strokeStyle = 'rgba(52, 65, 85, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + graphWidth, y);
      ctx.stroke();
    }

    if (historico.length < 2) return;

    const maxPrice = Math.max(...historico.map(h => h.preco));
    const minPrice = Math.min(...historico.map(h => h.preco));
    const priceRange = maxPrice - minPrice || 1;

    // Desenhar linha
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    historico.forEach((item, index) => {
      const x = padding + (graphWidth / (historico.length - 1)) * index;
      const y = padding + graphHeight - ((item.preco - minPrice) / priceRange) * graphHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Desenhar pontos
    ctx.fillStyle = '#00d4ff';
    historico.forEach((item, index) => {
      const x = padding + (graphWidth / (historico.length - 1)) * index;
      const y = padding + graphHeight - ((item.preco - minPrice) / priceRange) * graphHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  function formatarData(data) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(data);
  }

  function atualizarTablaHistorico() {
    historicoBody.innerHTML = '';

    if (historico.length === 0) {
      historicoVazio.style.display = 'block';
      historicoTable.style.display = 'none';
      historicoCount.textContent = '0';
      return;
    }

    historicoVazio.style.display = 'none';
    historicoTable.style.display = 'table';

    // Mostrar últimos 10 cálculos
    const ulimos10 = historico.slice(-10).reverse();
    ulimos10.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatarData(item.data)}</td>
        <td>${formatarMoeda(item.custo)}</td>
        <td>${item.horas.toFixed(1)}h</td>
        <td>${formatarMoeda(item.valor)}</td>
        <td><strong>${formatarMoeda(item.preco)}</strong></td>
      `;
      historicoBody.appendChild(row);
    });

    historicoCount.textContent = historico.length;
  }

  function limparHistorico() {
    if (historico.length === 0) {
      alert('Nenhum histórico para limpar');
      return;
    }

    if (confirm(`Tem certeza que deseja limpar o histórico de ${historico.length} cálculos?`)) {
      historico = [];
      atualizarTablaHistorico();
      desenharGraficoLinha();
    }
  }

  function preencherPreset(presetName) {
    const preset = presets[presetName];
    if (!preset) return;

    custoTotalInput.value = preset.custo;
    horasTrabalhadasInput.value = preset.horas;
    valorHoraInput.value = preset.valor;

    // Auto-disparar cálculo
    setTimeout(() => {
      calcularPreco();
    }, 100);
  }
});
