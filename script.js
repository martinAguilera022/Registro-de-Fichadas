document.getElementById("generar").addEventListener("click", generarPlanilla);
const tablaContainer = document.getElementById("tablaContainer");

function generarPlanilla() {
	const nombre = document.getElementById("nombre").value;
	const legajo = document.getElementById("legajo").value;
	const sector = document.getElementById("sector").value;
	const fechaInput = document.getElementById("fechaInicio").value; // "YYYY-MM-DD"
	const Icono = "./IconoGranja.png";

	if (!nombre || !legajo || !sector || !fechaInput) {
		alert("Por favor, completá todos los campos.");
		return;
	}

	// 🔹 Crear fecha respetando el día exacto
	const [year, month, day] = fechaInput.split("-").map(Number);
	const fechaInicio = new Date(year, month - 1, day); // mes empieza en 0

	let tabla = `
    <h2 class="tituloFicha">Granja Tres Arroyos S.A.</h2>
    <h3 class="tituloFicha">Registro de Fichadas Manuales.</h3>
    <div class="fichaInfo">
    <div class="info">
    <p>Nombre y Apellido: ${nombre} </p>
    <p>Legajo N°: ${legajo}</p>
    <p>Sector: ${sector}</p>
    </div>
    <img class="icono" src="${Icono}">
    </div>
    <table>
      <thead>
        <tr>
          <th>Día</th>
          <th>Fecha</th>
          <th>Entrada 1</th>
          <th>Salida 1</th>
          <th>Entrada 2</th>
          <th>Salida 2</th>
          <th>Observaciones</th>
        </tr>
      </thead>
      <tbody>
  `;

	for (let i = 0; i < 15; i++) {
		const fecha = new Date(fechaInicio);
		fecha.setDate(fechaInicio.getDate() + i);
		const diaSemana = fecha.toLocaleDateString("es-AR", { weekday: "long" });
		const fechaStr = fecha.toLocaleDateString("es-AR");
		tabla += `
      <tr>
        <td>${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}</td>
        <td>${fechaStr}</td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
      </tr>
    `;
	}
	tabla += `</tbody></table>`;
	const firma = "./Firma.jpg";
	tabla += `
    <div class="firma" style="margin-top: 20px;">
        <img src="${firma}" style="height: 120px;">
        <p class="firmaText">Firma del Encargado</p>
    </div>
    `;

	tablaContainer.innerHTML = tabla;
	document.getElementById("descargarExcel").classList.remove("hidden");
	document.getElementById("descargarPDF").classList.remove("hidden");

	localStorage.setItem("ultimaPlanilla", tablaContainer.innerHTML);
}

// Descarga en Excel
document.getElementById("descargarExcel").addEventListener("click", () => {
	const tabla = document.querySelector("table");
	const wb = XLSX.utils.table_to_book(tabla, { sheet: "Planilla" });
	XLSX.writeFile(wb, "planilla_quincenal.xlsx");
});

// Descarga en PDF usando html2canvas
document.getElementById("descargarPDF").addEventListener("click", async () => {
	const { jsPDF } = window.jspdf;
	const tabla = document.querySelector("#tablaContainer");

	// Guardar ancho original
	const originalWidth = tabla.style.width;
	tabla.style.width = "1080px"; // Forzar ancho para escritorio

	// Capturar con html2canvas
	const canvas = await html2canvas(tabla, {
		scale: 2,
		useCORS: true,
		backgroundColor: "#ffffff",
	});

	// Restaurar ancho original
	tabla.style.width = originalWidth;

	const imgData = canvas.toDataURL("image/png");

	// Crear PDF
	const imgWidth = canvas.width;
	const imgHeight = canvas.height;
	const pdfWidth = 842;
	const ratio = pdfWidth / imgWidth;
	const pdfHeight = imgHeight * ratio;

	const pdf = new jsPDF({
		orientation: "l",
		unit: "pt",
		format: [pdfWidth, pdfHeight],
	});

	const margin = 20;
	const scaledWidth = pdfWidth - 2 * margin;
	const scaledHeight = pdfHeight - 2 * margin;

	pdf.addImage(imgData, "PNG", margin, margin, scaledWidth, scaledHeight);

	// Crear blob del PDF
	const pdfBlob = pdf.output("blob");
	const pdfUrl = URL.createObjectURL(pdfBlob);
	const pdfFile = new File([pdfBlob], "planilla_quincenal.pdf", {
		type: "application/pdf",
	});

	// Guardar PDF localmente
	pdf.save("planilla_quincenal.pdf");

	// Mostrar alerta con SweetAlert2
	Swal.fire({
		title: "✅ PDF descargado correctamente",
		text: "¿Deseas abrirlo o compartirlo?",
		icon: "success",
		showCancelButton: true,
		confirmButtonText: "Compartir",
		cancelButtonText: "Cerrar",
		confirmButtonColor: "#2e7d32",
	}).then(async (result) => {
		if (result.isConfirmed) {
			if (navigator.share) {
				try {
					await navigator.share({
						title: "Planilla Quincenal",
						text: "Te envío la planilla quincenal generada.",
						files: [pdfFile],
					});
				} catch (error) {
					console.log("Compartir cancelado o no disponible");
					window.open(pdfUrl, "_blank");
				}
			} else {
				window.open(pdfUrl, "_blank");
			}
		}
	});
});

// Recuperar si hay datos previos
window.addEventListener("load", () => {
	const guardado = localStorage.getItem("ultimaPlanilla");
	if (guardado) tablaContainer.innerHTML = guardado;
});
