// --- CONFIGURA ESTOS DATOS CON LOS DE TU PROYECTO SUPABASE ---
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';  // cambia por tu URL
const SUPABASE_ANON_KEY = 'public-anon-key';             // cambia por tu anon key

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Horarios disponibles: 15:00 a 19:00 en intervalos de 50 minutos
const horarios = ['15:00', '15:50', '16:40', '17:30', '18:20'];

// Obtiene la fecha de hoy y los próximos 5 días laborables (lunes a viernes)
function obtenerDiasLaborables() {
  const dias = [];
  let fecha = new Date();
  while (dias.length < 5) {
    const diaSemana = fecha.getDay(); // 0=dom, 6=sáb
    if (diaSemana >= 1 && diaSemana <= 5) { // lunes a viernes
      dias.push(new Date(fecha));
    }
    fecha.setDate(fecha.getDate() + 1);
  }
  return dias;
}

// Formatea la fecha a YYYY-MM-DD para comparación
function formatearFecha(fecha) {
  return fecha.toISOString().slice(0, 10);
}

// Carga reservas y actualiza la tabla
async function cargarReservasYMostrar() {
  const dias = obtenerDiasLaborables();

  // Consulta reservas para los próximos 5 días
  const fechasStr = dias.map(d => formatearFecha(d));
  const { data: reservas, error } = await supabase
    .from('reservas')
    .select('*')
    .in('fecha', fechasStr)
    .eq('pagado', true);

  if (error) {
    console.error('Error cargando reservas:', error);
    return;
  }

  // Crea un mapa para ver qué slots están ocupados
  // Clave: "YYYY-MM-DD|HH:mm"
  const ocupados = new Set(reservas.map(r => `${r.fecha}|${r.hora}`));

  // Construye tabla
  const tabla = document.getElementById('tabla-reservas');
  tabla.innerHTML = ''; // limpia tabla

  // Cabecera con fechas
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  trHead.appendChild(document.createElement('th')); // esquina vacía
  dias.forEach(d => {
    const th = document.createElement('th');
    th.textContent = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  tabla.appendChild(thead);

  // Cuerpo con horarios y celdas clicables
  const tbody = document.createElement('tbody');

  horarios.forEach(hora => {
    const tr = document.createElement('tr');
    const tdHora = document.createElement('td');
    tdHora.textContent = hora;
    tr.appendChild(tdHora);

    dias.forEach(dia => {
      const fechaStr = formatearFecha(dia);
      const key = `${fechaStr}|${hora}`;
      const td = document.createElement('td');

      if (ocupados.has(key)) {
        td.textContent = 'Ocupado';
        td.style.backgroundColor = '#c0392b';
        td.style.color = 'white';
      } else {
        const btn = document.createElement('button');
        btn.textContent = 'Reservar';
        btn.onclick = () => seleccionarReserva(fechaStr, hora);
        td.appendChild(btn);
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  tabla.appendChild(tbody);
}

// Variable para guardar la reserva seleccionada
let reservaSeleccionada = null;

function seleccionarReserva(fecha, hora) {
  reservaSeleccionada = { fecha, hora };
  alert(`Has seleccionado reservar el día ${fecha} a las ${hora}. Ahora completa el formulario y paga.`);
  // Aquí puedes mostrar el formulario si está oculto o activar el botón de pago.
}

// Llama a cargar reservas al cargar la página
window.addEventListener('DOMContentLoaded', cargarReservasYMostrar);
