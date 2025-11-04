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

	// 🔹 Mostrar o crear botón de acción
	let shareBtn = document.getElementById("compartirPDF");
	if (!shareBtn) {
		shareBtn = document.createElement("button");
		shareBtn.id = "compartirPDF";
		shareBtn.textContent = "📤 Compartir o Abrir PDF";
		shareBtn.style.marginTop = "15px";
		shareBtn.style.padding = "10px 15px";
		shareBtn.style.border = "none";
		shareBtn.style.borderRadius = "8px";
		shareBtn.style.backgroundColor = "#007bff";
		shareBtn.style.color = "white";
		shareBtn.style.fontSize = "16px";
		shareBtn.style.cursor = "pointer";
		document.body.appendChild(shareBtn);
	}

	shareBtn.onclick = async () => {
		// 🌐 Si el navegador permite compartir (solo móviles con HTTPS)
		if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
			try {
				await navigator.share({
					title: "Planilla Quincenal",
					text: "Te envío mi planilla en PDF",
					files: [pdfFile],
				});
			} catch (err) {
				console.warn("Compartir cancelado o no soportado:", err);
				window.open(pdfUrl, "_blank");
			}
		} else {
			// 🖥️ En PC o sin soporte → abrir PDF en nueva pestaña
			window.open(pdfUrl, "_blank");
			alert(
				"📄 El navegador no permite compartir directamente.\nEl PDF se abrirá para que lo descargues o envíes manualmente."
			);
		}
	};
});

// Recuperar si hay datos previos
window.addEventListener("load", () => {
	const guardado = localStorage.getItem("ultimaPlanilla");
	if (guardado) tablaContainer.innerHTML = guardado;
});
