// Função para formatar números
function formatNumber(value, decimals = 2) {
    if (Number.isInteger(value)) {
        return value.toString();
    }
    return value.toFixed(decimals);
}

// Variáveis globais
let entriesFi = [];
let entryH = document.getElementById('entry-h');
let entryLiInicial = document.getElementById('entry-li-inicial');
let varQ = document.getElementById('var-q');
let varK = document.getElementById('var-k');
let varD = document.getElementById('var-d');
let varP = document.getElementById('var-p');
let entryPercentis = document.getElementById('entry-percentis');
let tabelaBody = document.getElementById('tabela-body');
let medidasContainer = document.getElementById('medidas-container');
let separatrizesContainer = document.getElementById('separatrizes-container');

// Event listeners
document.getElementById('btn-confirmar-k').addEventListener('click', calcularFri);
document.getElementById('btn-calcular').addEventListener('click', exibirResultados);
document.getElementById('btn-copiar').addEventListener('click', copiarTabela);

function calcularFri() {
    const k = parseInt(document.getElementById('entry-k').value);
    
    if (isNaN(k) || k <= 0) {
        alert('O valor de k deve ser maior que zero!');
        return;
    }
    
    // Mostrar o frame de frequências
    document.getElementById('frame-fi').classList.remove('hidden');
    
    // Limpar inputs anteriores
    const fiInputsContainer = document.getElementById('fi-inputs-container');
    fiInputsContainer.innerHTML = '';
    entriesFi = [];
    
    // Criar inputs para fi
    for (let i = 1; i <= k; i++) {
        const fiItem = document.createElement('div');
        fiItem.className = 'fi-item';
        
        const label = document.createElement('label');
        label.textContent = `Digite o valor de fi${i}:`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        input.placeholder = `fi${i}`;
        
        fiItem.appendChild(label);
        fiItem.appendChild(input);
        fiInputsContainer.appendChild(fiItem);
        
        entriesFi.push(input);
    }
}

function copiarTabela() {
    const tabela = document.getElementById('tabela-resultados');
    if (!tabela) {
        alert('Nenhuma tabela para copiar!');
        return;
    }
    
    let dados = [];
    // Cabeçalhos
    const headers = Array.from(tabela.querySelectorAll('th')).map(th => th.textContent);
    dados.push(headers.join('\t'));
    
    // Linhas
    const linhas = tabela.querySelectorAll('tbody tr');
    linhas.forEach(linha => {
        const valores = Array.from(linha.querySelectorAll('td')).map(td => td.textContent);
        dados.push(valores.join('\t'));
    });
    
    const textoCopiado = dados.join('\n');
    
    // Copiar para área de transferência
    navigator.clipboard.writeText(textoCopiado)
        .then(() => alert('Tabela copiada para a área de transferência!'))
        .catch(err => alert('Erro ao copiar tabela: ' + err));
}

function calcularSeparatrix(k, divisor, dados, somatoriaFi, h) {
    const posicao = (k * somatoriaFi) / divisor;
    let classeSeparatrix = null;
    let FiAnterior = 0;
    
    for (let i = 0; i < dados.length; i++) {
        if (dados[i].Fi >= posicao) {
            classeSeparatrix = dados[i];
            if (i > 0) {
                FiAnterior = dados[i-1].Fi;
            }
            break;
        }
    }
    
    if (classeSeparatrix) {
        return classeSeparatrix.li + ((posicao - FiAnterior) / classeSeparatrix.fi) * h;
    }
    return 0;
}

function exibirResultados() {
    try {
        const fi = entriesFi.map(entry => parseFloat(entry.value));
        const somatoriaFi = fi.reduce((sum, val) => sum + val, 0);
        const h = parseFloat(entryH.value);
        const liInicial = parseFloat(entryLiInicial.value);
        
        // Validar entradas
        if (fi.some(isNaN) || isNaN(h) || isNaN(liInicial)) {
            throw new Error('Todos os valores devem ser números válidos!');
        }
        
        // Mostrar frame de resultados
        document.getElementById('frame-resultados').classList.remove('hidden');
        
        // Limpar resultados anteriores
        tabelaBody.innerHTML = '';
        medidasContainer.innerHTML = '';
        separatrizesContainer.innerHTML = '';
        
        // Preencher tabela
        let somatoriaFiXi = 0;
        let somatoriaFiXi2 = 0;
        let somatoriaFiYi = 0;
        let somatoriaFiYi2 = 0;
        let frequenciaAcumulada = 0;
        let frequenciaAcumuladaFi = 0;
        const dados = [];
        
        // Encontrar a classe de referência para yi (classe com maior frequência)
        const maxFi = Math.max(...fi);
        const classeReferenciaIndex = fi.indexOf(maxFi);
        const xiReferencia = liInicial + classeReferenciaIndex * h + h/2;
        
        for (let i = 0; i < fi.length; i++) {
            const li = liInicial + i * h;
            const ls = li + h;
            const xi = (li + ls) / 2;
            const intervalo = `${formatNumber(li)} - ${formatNumber(ls)}`;
            
            const fiXi = fi[i] * xi;
            somatoriaFiXi += fiXi;
            
            const xi2 = xi ** 2;
            const fiXi2 = fi[i] * xi2;
            somatoriaFiXi2 += fiXi2;
            
            // Cálculo de yi (desvio em relação à classe de referência)
            const yi = (xi - xiReferencia) / h;
            const fiYi = fi[i] * yi;
            somatoriaFiYi += fiYi;
            
            const yi2 = yi ** 2;
            const fiYi2 = fi[i] * yi2;
            somatoriaFiYi2 += fiYi2;
            
            const fri = fi[i] / somatoriaFi;
            const percentFri = fri * 100;
            const grausFri = fri * 360;
            
            frequenciaAcumulada += fri;
            const percentFai = frequenciaAcumulada * 100;
            const grausFai = frequenciaAcumulada * 360;
            
            frequenciaAcumuladaFi += fi[i];
            
            // Adicionar linha na tabela
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i+1}</td>
                <td>${intervalo}</td>
                <td>${formatNumber(xi)}</td>
                <td>${formatNumber(fi[i])}</td>
                <td>${formatNumber(fiXi)}</td>
                <td>${fri.toFixed(3)}</td>
                <td>${percentFri.toFixed(2)}%</td>
                <td>${grausFri.toFixed(2)}°</td>
                <td>${formatNumber(frequenciaAcumuladaFi)}</td>
                <td>${frequenciaAcumulada.toFixed(3)}</td>
                <td>${percentFai.toFixed(2)}%</td>
                <td>${grausFai.toFixed(2)}°</td>
                <td>${formatNumber(xi2)}</td>
                <td>${formatNumber(fiXi2)}</td>
                <td>${formatNumber(yi)}</td>
                <td>${formatNumber(fiYi)}</td>
                <td>${formatNumber(yi2)}</td>
                <td>${formatNumber(fiYi2)}</td>
            `;
            tabelaBody.appendChild(row);
            
            dados.push({
                li: li,
                fi: fi[i],
                Fi: frequenciaAcumuladaFi,
                xi: xi
            });
        }
        
        // Linha da somatória
        const sumRow = document.createElement('tr');
        sumRow.innerHTML = `
            <td></td>
            <td></td>
            <td></td>
            <td>${formatNumber(somatoriaFi)}</td>
            <td>${formatNumber(somatoriaFiXi)}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>${formatNumber(somatoriaFiXi2)}</td>
            <td></td>
            <td>${formatNumber(somatoriaFiYi)}</td>
            <td></td>
            <td>${formatNumber(somatoriaFiYi2)}</td>
        `;
        tabelaBody.appendChild(sumRow);
        
        // Cálculo das medidas básicas
        const ME = somatoriaFiXi / somatoriaFi;
        
        // Moda
        const classeModal = dados.reduce((max, obj) => (obj.fi > max.fi ? obj : max), dados[0]);
        const indexModal = dados.indexOf(classeModal);
        const fiModal = classeModal.fi;
        const fAnterior = indexModal > 0 ? dados[indexModal-1].fi : 0;
        const fPosterior = indexModal < dados.length-1 ? dados[indexModal+1].fi : 0;
        const D1 = fiModal - fAnterior;
        const D2 = fiModal - fPosterior;
        const MO = D1 + D2 !== 0 ? classeModal.li + (D1/(D1+D2)) * h : classeModal.li;
        
        // Cálculo da Mediana (MD)
        const posicaoMediana = somatoriaFi / 2;
        let classeMediana = null;
        let FiAnteriorMediana = 0;

        for (let i = 0; i < dados.length; i++) {
            if (dados[i].Fi >= posicaoMediana) {
                classeMediana = dados[i];
                if (i > 0) {
                    FiAnteriorMediana = dados[i-1].Fi;
                }
                break;
            }
        }

        let MD = 0;
        if (classeMediana) {
            MD = classeMediana.li + ((posicaoMediana - FiAnteriorMediana) / classeMediana.fi) * h;
        }
        
        // Exibir medidas básicas
        medidasContainer.innerHTML = `
            <div class="measure">MÉDIA (ME) = ${formatNumber(ME)}</div>
            <div class="measure">MODA (MO) = ${formatNumber(MO)}</div>
            <div class="measure">MEDIANA (MD) = ${formatNumber(MD)}</div>
        `;
        
        // Cálculo das separatrizes selecionadas
        if (varQ.checked) {
            const frameQ = document.createElement('div');
            frameQ.className = 'sep-group';
            frameQ.innerHTML = '<div class="frame-title">Quartis:</div><div class="sep-items" id="quartis-items"></div>';
            separatrizesContainer.appendChild(frameQ);
            
            const quartisItems = document.getElementById('quartis-items');
            for (let q of [1, 2, 3]) {
                const valor = calcularSeparatrix(q, 4, dados, somatoriaFi, h);
                const item = document.createElement('div');
                item.className = 'sep-item';
                item.textContent = `Q${q} = ${formatNumber(valor)}`;
                quartisItems.appendChild(item);
            }
        }
        
        if (varK.checked) {
            const frameK = document.createElement('div');
            frameK.className = 'sep-group';
            frameK.innerHTML = '<div class="frame-title">Quintis:</div><div class="sep-items" id="quintis-items"></div>';
            separatrizesContainer.appendChild(frameK);
            
            const quintisItems = document.getElementById('quintis-items');
            for (let k of [1, 2, 3, 4]) {
                const valor = calcularSeparatrix(k, 5, dados, somatoriaFi, h);
                const item = document.createElement('div');
                item.className = 'sep-item';
                item.textContent = `K${k} = ${formatNumber(valor)}`;
                quintisItems.appendChild(item);
            }
        }
        
        if (varD.checked) {
            const frameD = document.createElement('div');
            frameD.className = 'sep-group';
            frameD.innerHTML = '<div class="frame-title">Decis:</div><div class="sep-items" id="decis-items"></div>';
            separatrizesContainer.appendChild(frameD);
            
            const decisItems = document.getElementById('decis-items');
            for (let d = 1; d <= 9; d++) {
                const valor = calcularSeparatrix(d, 10, dados, somatoriaFi, h);
                const item = document.createElement('div');
                item.className = 'sep-item';
                item.textContent = `D${d} = ${formatNumber(valor)}`;
                decisItems.appendChild(item);
            }
        }
        
        if (varP.checked) {
            let percentis = [10, 25, 50, 75, 90];
            
            // Percentis personalizados
            if (entryPercentis.value) {
                const personalizados = entryPercentis.value.split(',')
                    .map(p => parseInt(p.trim()))
                    .filter(p => !isNaN(p) && p >= 1 && p <= 99);
                percentis = [...percentis, ...personalizados];
            }
            
            // Remover duplicados e ordenar
            percentis = [...new Set(percentis)].sort((a, b) => a - b);
            
            if (percentis.length > 0) {
                const frameP = document.createElement('div');
                frameP.className = 'sep-group';
                frameP.innerHTML = '<div class="frame-title">Percentis:</div><div class="sep-items" id="percentis-items"></div>';
                separatrizesContainer.appendChild(frameP);
                
                const percentisItems = document.getElementById('percentis-items');
                for (let p of percentis) {
                    const valor = calcularSeparatrix(p, 100, dados, somatoriaFi, h);
                    const item = document.createElement('div');
                    item.className = 'sep-item';
                    item.textContent = `P${p} = ${formatNumber(valor)}`;
                    percentisItems.appendChild(item);
                }
            }
        }
        
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}