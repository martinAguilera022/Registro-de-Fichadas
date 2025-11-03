document.getElementById("generar").addEventListener("click", generarPlanilla);
const tablaContainer = document.getElementById("tablaContainer");

function generarPlanilla() {
	const nombre = document.getElementById("nombre").value;
	const legajo = document.getElementById("legajo").value;
	const sector = document.getElementById("sector").value;
	const fechaInicio = new Date(document.getElementById("fechaInicio").value);
	const Icono = "./IconoGranja.png";
	if (!nombre || !legajo || !sector || !fechaInicio) {
		alert("Por favor, completá todos los campos.");
		return;
	}

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

	// Forzar ancho amplio antes de capturar
	tabla.style.width = "1080px";

	// Capturar con html2canvas
	const canvas = await html2canvas(tabla, {
		scale: 2,
		useCORS: true,
		backgroundColor: "#ffffff",
	});

	// Restaurar ancho original
	tabla.style.width = originalWidth;

	const imgData = canvas.toDataURL("image/png");

	// Obtener dimensiones de la imagen
	const imgWidth = canvas.width;
	const imgHeight = canvas.height;

	// Crear PDF con ancho A4 horizontal y altura proporcional a la imagen
	const pdfWidth = 842; // A4 horizontal pt
	const ratio = pdfWidth / imgWidth;
	const pdfHeight = imgHeight * ratio;

	const pdf = new jsPDF({
		orientation: "l",
		unit: "pt",
		format: [pdfWidth, pdfHeight],
	});

	// Margen deseado
	const margin = 20; // puedes aumentar o disminuir

	// Escalar imagen considerando el margen
	const scaledWidth = pdfWidth - 2 * margin;
	const scaledHeight = pdfHeight - 2 * margin;

	// Agregar imagen al PDF con margen
	pdf.addImage(imgData, "PNG", margin, margin, scaledWidth, scaledHeight);

	pdf.save("planilla_quincenal.pdf");
});

// Recuperar si hay datos previos
window.addEventListener("load", () => {
	const guardado = localStorage.getItem("ultimaPlanilla");
	if (guardado) tablaContainer.innerHTML = guardado;
});
