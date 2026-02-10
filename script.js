document.addEventListener('DOMContentLoaded', () => {
    // Configuração do Worker do PDF.js (necessário para ler PDFs)
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // Elementos da Interface
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const dropZone = document.getElementById('dropZone');
    const modal = document.getElementById('progressModal');
    const progressBar = document.getElementById('progressBar');
    const percentText = document.getElementById('percentText');
    const statusText = document.getElementById('statusText');
    const renderZone = document.getElementById('conversion-render-zone');

    let currentFile = null;

    // --- Lógica de Upload ---

    dropZone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleFile(e.target.files[0]);

    dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); };
    dropZone.ondragleave = () => dropZone.classList.remove('drag-over');
    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFile(e.dataTransfer.files[0]);
    };

    function handleFile(file) {
        if (!file) return;
        currentFile = file;
        fileNameDisplay.innerHTML = `<span style="color: #10b981;">✅ Selecionado: ${file.name}</span>`;
        dropZone.style.borderColor = "#10b981";
        dropZone.style.background = "#f0fff4";
    }

    // --- Gerenciamento de Conversão ---

    document.querySelectorAll('.tool-card').forEach(card => {
        card.onclick = async () => {
            if (!currentFile) {
                alert("Por favor, selecione um arquivo primeiro!");
                return;
            }
            const action = card.dataset.action;
            executeConversion(action);
        };
    });

    async function executeConversion(action) {
        showModal();
        let progress = 0;
        const fileName = currentFile.name.split('.')[0];

        // Animação da barra de progresso
        const interval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 10;
                updateUI(progress);
            }
        }, 400);

        try {
            switch (action) {
                case 'pdf-to-epub':
                    await convertPdfToEpub(currentFile, fileName);
                    break;
                case 'pdf-to-img':
                    await convertPdfToImg(currentFile, fileName);
                    break;
                case 'img-to-pdf':
                    await convertImgToPdf(currentFile, fileName);
                    break;
                case 'docx-to-pdf':
                    await convertDocxToPdf(currentFile, fileName);
                    break;
                case 'xlsx-to-pdf':
                    await convertXlsxToPdf(currentFile, fileName);
                    break;
                case 'pdf-to-docx':
                    alert("A extração de PDF para Word requer processamento via servidor para manter a formatação original.");
                    break;
                default:
                    console.log("Ação não reconhecida");
            }
            
            // Finalização
            clearInterval(interval);
            updateUI(100);
            statusText.innerHTML = `Concluído com sucesso! 100%`;
            setTimeout(hideModal, 1000);

        } catch (error) {
            console.error(error);
            clearInterval(interval);
            hideModal();
            alert("Erro ao converter o arquivo. Verifique o formato.");
        }
    }

    // --- Motores de Conversão Específicos ---

    async function convertPdfToEpub(file, name) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += `<h2>Página ${i}</h2><p>` + content.items.map(s => s.str).join(" ") + "</p>";
        }
        const blob = new Blob([`<html><body>${fullText}</body></html>`], { type: 'application/epub+zip' });
        downloadBlob(blob, `${name}.epub`);
    }

    async function convertImgToPdf(file, name) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const dataUrl = await fileToDataURL(file);
        doc.addImage(dataUrl, 'JPEG', 10, 10, 190, 0);
        doc.save(`${name}.pdf`);
    }

    async function convertDocxToPdf(file, name) {
        renderZone.innerHTML = "";
        const arrayBuffer = await file.arrayBuffer();
        await docx.renderAsync(arrayBuffer, renderZone);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        await doc.html(renderZone, {
            callback: (d) => d.save(`${name}.pdf`),
            x: 15, y: 15, width: 560, windowWidth: 800
        });
    }

    async function convertXlsxToPdf(file, name) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const html = XLSX.utils.sheet_to_html(workbook.Sheets[workbook.SheetNames[0]]);
        renderZone.innerHTML = html;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'pt', 'a4');
        await doc.html(renderZone, {
            callback: (d) => d.save(`${name}.pdf`),
            x: 10, y: 10, width: 750, windowWidth: 1000
        });
    }

    async function convertPdfToImg(file, name) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const link = document.createElement('a');
        link.download = `${name}.jpg`;
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
    }

    // --- Funções Auxiliares (UI e Arquivos) ---

    function showModal() { 
        modal.style.display = 'flex'; 
        statusText.innerHTML = `Iniciando conversão... <span id="percentText">0%</span>`;
    }

    function hideModal() { 
        modal.style.display = 'none'; 
        updateUI(0);
    }

    function updateUI(val) {
        const p = Math.min(Math.round(val), 100);
        progressBar.style.width = p + '%';
        const pSpan = document.getElementById('percentText');
        if (pSpan) pSpan.innerText = p + '%';
    }

    function fileToDataURL(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    function downloadBlob(blob, name) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    }
});