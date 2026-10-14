/**
 * MotoCare - Archivo principal de JavaScript
 * Lógica intermedia para gestionar la moto, historial y recordatorios usando localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    // === Variables y Elementos del DOM ===

    // Navegación
    const navLinks = document.querySelectorAll('.nav a');
    const sections = {
        registro: document.getElementById('registro-inicial'),
        dashboard: document.getElementById('dashboard'),
        mantenimiento: document.getElementById('mantenimiento'),
        historial: document.getElementById('historial')
    };

    // Formularios
    const formRegistro = document.getElementById('form-registro');
    const formUpdateKm = document.getElementById('form-update-km');
    const formMantenimiento = document.getElementById('form-mantenimiento');
    const formRecordatorio = document.getElementById('form-recordatorio');

    // Elementos de UI
    const motoDetailsContainer = document.getElementById('moto-details');
    const tablaHistorial = document.getElementById('tabla-historial');
    const listaAlertas = document.getElementById('lista-alertas');

    // === Datos (Estado de la aplicación) ===
    let motoData = JSON.parse(localStorage.getItem('motoData')) || null;
    let mantenimientos = JSON.parse(localStorage.getItem('mantenimientos')) || [];
    let recordatorios = JSON.parse(localStorage.getItem('recordatorios')) || [];

    // === Inicialización ===
    initApp();

    function initApp() {
        if (motoData) {
            // Si ya hay una moto registrada, ocultamos el registro y mostramos el dashboard
            showSection('dashboard');
            renderMotoDetails();
            renderHistorial();
            renderRecordatorios();
        } else {
            // Si no hay moto, mostramos el registro
            showSection('registro');
        }
    }

    // === Navegación Simple ===
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Si no hay moto registrada, no permitir navegar
            if (!motoData) {
                alert("Primero debes registrar tu motocicleta.");
                return;
            }

            // Remover clase active de todos
            navLinks.forEach(l => l.classList.remove('active'));
            // Añadir active al clickeado
            e.currentTarget.classList.add('active');

            // Mostrar sección correspondiente
            const targetId = e.currentTarget.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    function showSection(sectionId) {
        // Ocultar todas las secciones
        Object.values(sections).forEach(sec => {
            if(sec) sec.classList.add('hidden');
        });

        // Manejar el caso especial del registro inicial vs dashboard
        if(sectionId === 'registro-inicial' || sectionId === 'registro') {
            sections.registro.classList.remove('hidden');
        } else if(sections[sectionId]) {
            sections[sectionId].classList.remove('hidden');
        }
    }

    // === HU-01: Registro de Motocicleta ===
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();

        const marca = document.getElementById('marca').value;
        const modelo = document.getElementById('modelo').value;
        const ano = document.getElementById('ano').value;
        const kilometraje = parseInt(document.getElementById('kilometraje').value);

        motoData = { marca, modelo, ano, kilometraje };

        // Guardar en LocalStorage
        localStorage.setItem('motoData', JSON.stringify(motoData));

        alert("¡Moto registrada con éxito!");

        renderMotoDetails();
        showSection('dashboard');

        // Actualizar nav active
        navLinks.forEach(l => l.classList.remove('active'));
        navLinks[0].classList.add('active'); // Dashboard
    });

    // === HU-02: Actualizar Kilometraje ===
    formUpdateKm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nuevoKm = parseInt(document.getElementById('nuevo-km').value);

        if (nuevoKm < motoData.kilometraje) {
            alert("El nuevo kilometraje no puede ser menor al actual.");
            return;
        }

        motoData.kilometraje = nuevoKm;
        localStorage.setItem('motoData', JSON.stringify(motoData));

        document.getElementById('nuevo-km').value = '';
        renderMotoDetails();
        renderRecordatorios(); // Revisar si se disparó alguna alerta

        alert("Kilometraje actualizado.");
    });

    function renderMotoDetails() {
        if (!motoData) return;

        motoDetailsContainer.innerHTML = `
            <p><strong>Vehículo:</strong> ${motoData.marca} ${motoData.modelo} (${motoData.ano})</p>
            <p><strong>Kilometraje Actual:</strong> ${motoData.kilometraje.toLocaleString()} km</p>
        `;
    }

    // === HU-03, HU-04, HU-05: Registrar Mantenimiento ===
    formMantenimiento.addEventListener('submit', (e) => {
        e.preventDefault();

        const mantenimiento = {
            id: Date.now(),
            fecha: document.getElementById('mant-fecha').value,
            tipo: document.getElementById('mant-tipo').value,
            costo: parseFloat(document.getElementById('mant-costo').value),
            taller: document.getElementById('mant-taller').value || 'No especificado',
            mecanico: document.getElementById('mant-mecanico').value || 'No especificado'
        };

        mantenimientos.push(mantenimiento);
        localStorage.setItem('mantenimientos', JSON.stringify(mantenimientos));

        formMantenimiento.reset();
        renderHistorial();

        alert("Mantenimiento registrado correctamente.");
    });

    function renderHistorial() {
        tablaHistorial.innerHTML = '';

        if (mantenimientos.length === 0) {
            tablaHistorial.innerHTML = `<tr><td colspan="4" class="text-center">No hay registros de mantenimiento aún.</td></tr>`;
            return;
        }

        // Ordenar por fecha descendente
        const sortedMants = [...mantenimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        sortedMants.forEach(mant => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${mant.fecha}</td>
                <td><strong>${mant.tipo}</strong></td>
                <td>$${mant.costo.toFixed(2)}</td>
                <td>
                    <small>Taller: ${mant.taller}</small><br>
                    <small>Mecánico: ${mant.mecanico}</small>
                </td>
            `;
            tablaHistorial.appendChild(tr);
        });
    }

    // === HU-06: Sistema de Recordatorios ===
    formRecordatorio.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('rec-nombre').value;
        const kmObjetivo = parseInt(document.getElementById('rec-km').value);

        if (kmObjetivo <= motoData.kilometraje) {
            alert("El kilometraje objetivo debe ser mayor al kilometraje actual.");
            return;
        }

        recordatorios.push({
            id: Date.now(),
            nombre,
            kmObjetivo
        });

        localStorage.setItem('recordatorios', JSON.stringify(recordatorios));
        formRecordatorio.reset();
        renderRecordatorios();
    });

    function renderRecordatorios() {
        listaAlertas.innerHTML = '';

        if (recordatorios.length === 0) {
            listaAlertas.innerHTML = `<li class="alert-item empty">No hay recordatorios configurados.</li>`;
            return;
        }

        let alertasActivas = 0;

        recordatorios.forEach(rec => {
            const kmRestantes = rec.kmObjetivo - motoData.kilometraje;

            // Si el kilometraje actual superó o está a menos de 100km del objetivo
            if (kmRestantes <= 100) {
                alertasActivas++;
                const li = document.createElement('li');
                li.className = 'alert-item';

                let msj = kmRestantes <= 0
                    ? `<strong>¡URGENTE!</strong> Se alcanzó el kilometraje para: ${rec.nombre}`
                    : `<strong>Pronto:</strong> Faltan ${kmRestantes} km para: ${rec.nombre}`;

                li.innerHTML = `${msj} <button onclick="eliminarRecordatorio(${rec.id})" style="float:right; border:none; background:transparent; cursor:pointer;" title="Marcar como hecho">✅</button>`;
                listaAlertas.appendChild(li);
            }
        });

        if (alertasActivas === 0) {
             listaAlertas.innerHTML = `<li class="alert-item empty">Todo en orden. No hay alertas urgentes.</li>`;
        }
    }

    // Hacer la función global para poder llamarla desde el onclick del HTML generado
    window.eliminarRecordatorio = function(id) {
        recordatorios = recordatorios.filter(r => r.id !== id);
        localStorage.setItem('recordatorios', JSON.stringify(recordatorios));
        renderRecordatorios();
    };

});
