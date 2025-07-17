const montoInput = document.getElementById('monto');
const monedaSelect = document.getElementById('moneda');
const btnConvertir = document.getElementById('convertir');
const resultadoDiv = document.getElementById('resultado');
const errorDiv = document.getElementById('error');
const ctx = document.getElementById('chart').getContext('2d');
let chart;

btnConvertir.addEventListener('click', async () => {
    const monto = parseFloat(montoInput.value);
    const moneda = monedaSelect.value;
    errorDiv.textContent = '';
    if (isNaN(monto) || monto <= 0) {
        errorDiv.textContent = 'Ingresa un monto válido.';
        return;
    }
    try {
        // Obtener datos actuales
        const res = await fetch('https://mindicador.cl/api');
        const data = await res.json();
        const valor = data[moneda].valor;
        const converted = (monto / valor).toFixed(2);
        resultadoDiv.textContent = `Resultado: ${converted} ${moneda}`;
        // Obtener historial
        const resHist = await fetch(`https://mindicador.cl/api/${moneda}`);
        const histData = await resHist.json();
        const series = histData.serie.slice(0, 10).reverse();
        const labels = series.map(item => new Date(item.fecha).toLocaleDateString());
        const values = series.map(item => item.valor);
        // Renderizar gráfico
        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: `Historial ${moneda} (últimos 10 días)`,
                    data: values,
                    fill: false,
                    tension: 0.1
                }]
            }
        });
    } catch (err) {
        console.error(err);
        errorDiv.textContent = 'Error al obtener datos. Usando datos locales.';
        // Fallback local JSON
        try {
            const local = await fetch('mindicador.json');
            const localData = await local.json();
            const val = localData[moneda].valor;
            const conv = (monto / val).toFixed(2);
            resultadoDiv.textContent = `Resultado (local): ${conv} ${moneda}`;
        } catch (e) {
            errorDiv.textContent = 'No se pudo cargar el archivo local.';
        }
    }
});
