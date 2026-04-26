document.addEventListener('DOMContentLoaded', function() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    var fileInput = document.getElementById('fileInput');
    var fileNameDisplay = document.getElementById('fileNameDisplay');
    var dropZone = document.getElementById('dropZone');
    var modal = document.getElementById('progressModal');
    var progressBar = document.getElementById('progressBar');
    var percentText = document.getElementById('percentText');
    var statusText = document.getElementById('statusText');
    var renderZone = document.getElementById('conversion-render-zone');
    var toolCards = document.querySelectorAll('.tool-card');

    var currentFiles = null;

    // Evento de clique no dropZone
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });

// Evento de mudança no input
    fileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    });

    // Drag and drop
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });

    function handleFiles(files) {
        if (!files || files.length === 0) return;
        
        var maxSize = 10 * 1024 * 1024;
        for (var i = 0; i < files.length; i++) {
            if (files[i].size > maxSize) {
                alert("O ficheiro é muito grande!");
                return;
            }
        }
        
        currentFiles = files;
        var fileNames = Array.from(files).map(function(f) { return f.name; }).join(', ');
        fileNameDisplay.innerHTML = '<span style="color: #10b981;">✅ Selecionado: ' + fileNames + '</span>';
        dropZone.style.borderColor = "#10b981";
    }

    // Tool cards
    toolCards.forEach(function(card) {
        card.addEventListener('click', function() {
            if (!currentFiles || currentFiles.length === 0) {
                alert("Por favor, selecione um arquivo primeiro!");
                return;
            }
            var action = card.getAttribute('data-action');
            executeConversion(action);
        });
    });

async function executeConversion(action) {
        showModal();
        var progress = 0;
        var fileName = currentFiles[0].name.split('.')[0];

        var interval = setInterval(function() {
            if (progress < 90) {
                progress += Math.random() * 10;
                updateUI(progress);
            }
        }, 400);

        try {
            switch (action) {
                case 'pdf-to-epub':
                    await convertPdfToEpub(currentFiles[0], fileName);
                    break;
                case 'pdf-to-img':
                    await convertPdfToImg(currentFiles[0], fileName);
                    break;
                case 'img-to-pdf':
                    await convertImgToPdf(currentFiles, fileName);
                    break;
                case 'docx-to-pdf':
                    await convertDocxToPdf(currentFiles[0], fileName);
                    break;
                case 'xlsx-to-pdf':
                    await convertXlsxToPdf(currentFiles[0], fileName);
                    break;
                case 'jpg-to-png':
                    await convertJpgToPng(currentFiles[0], fileName);
                    break;
                case 'png-to-jpg':
                    await convertPngToJpg(currentFiles[0], fileName);
                    break;
                case 'webp-to-jpg':
                    await convertWebpToJpg(currentFiles[0], fileName);
                    break;
                case 'webp-to-png':
                    await convertWebpToPng(currentFiles[0], fileName);
                    break;
                case 'heic-to-jpg':
                    await convertHeicToJpg(currentFiles[0], fileName);
                    break;
                case 'heic-to-png':
                    await convertHeicToPng(currentFiles[0], fileName);
                    break;
                case 'epub-to-pdf':
                    await convertEpubToPdf(currentFiles[0], fileName);
                    break;
                case 'pdf-to-docx':
                    alert("A extração de PDF para Word requer processamento via servidor.");
                    break;
                default:
                    console.log("Ação não reconhecida");
            }
            
            clearInterval(interval);
            updateUI(100);
            statusText.innerHTML = 'Concluído com sucesso! 100%';
            setTimeout(hideModal, 1000);

} catch (error) {
            console.error(error);
            clearInterval(interval);
            hideModal();
            alert("Erro ao converter o arquivo: " + error.message);
        }
    }

    function showModal() {
        modal.style.display = 'flex'; 
        statusText.innerHTML = 'Iniciando conversão... <span id="percentText">0%</span>';
    }

    function hideModal() { 
        modal.style.display = 'none'; 
        updateUI(0);
    }

    function updateUI(val) {
        var p = Math.min(Math.round(val), 100);
        progressBar.style.width = p + '%';
    }

    function fileToDataURL(file) {
        return new Promise(function(resolve) {
            var reader = new FileReader();
            reader.onload = function(e) { resolve(e.target.result); };
            reader.readAsDataURL(file);
        });
    }

    function downloadBlob(blob, name) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    }

    // --- Conversion Functions ---

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

async function convertImgToPdf(files, name) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const a4Width = 210;
        const a4Height = 297;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const dataUrl = await fileToDataURL(file);
            
            const img = new Image();
            img.src = dataUrl;
            await new Promise(resolve => { img.onload = resolve; });
            
            const imgWidth = img.width;
            const imgHeight = img.height;
            
            const widthRatio = a4Width / imgWidth;
            const heightRatio = a4Height / imgHeight;
            const scale = Math.min(widthRatio, heightRatio);
            
            const finalWidth = imgWidth * scale;
            const finalHeight = imgHeight * scale;
            const x = (a4Width - finalWidth) / 2;
            const y = (a4Height - finalHeight) / 2;
            
            if (i > 0) doc.addPage();
            doc.addImage(dataUrl, 'JPEG', x, y, finalWidth, finalHeight);
        }
        doc.save(`${name}.pdf`);
    }

async function convertDocxToPdf(file, name) {
        showModal();
        
        try {
            statusText.innerHTML = 'Verificando servidor...';
            updateUI(10);
            
            var formData = new FormData();
            formData.append('file', file);
            
            statusText.innerHTML = 'Enviando arquivo...';
            updateUI(20);
            
            var response = await fetch('http://localhost:3001/convert/docx-to-pdf', {
                method: 'POST',
                body: formData
            });
            
            updateUI(60);
            
            if (!response.ok) {
                throw new Error('Server error');
            }
            
            var blob = await response.blob();
            
            updateUI(90);
            
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = name + '.pdf';
            link.click();
            
            URL.revokeObjectURL(url);
            updateUI(100);
            hideModal();
        } catch (error) {
            console.log('Server not available, using fallback:', error);
            statusText.innerText = 'Servidor indisponível. Convertendo no navegador...';
            updateUI(30);
            
            await convertDocxToPdfFallback(file, name);
        }
    }
    
async function convertDocxToPdfFallback(file, name) {
        console.log('Starting convertDocxToPdfFallback...');
        statusText.innerText = 'Convertendo documento...';
        updateUI(40);
        
        try {
            var arrayBuffer = await file.arrayBuffer();
            console.log('File loaded, arrayBuffer length:', arrayBuffer.byteLength);
            
            var renderContainer = document.createElement('div');
            renderContainer.style.position = 'fixed';
            renderContainer.style.left = '-9999px';
            renderContainer.style.top = '0';
            renderContainer.style.width = '595px';
            renderContainer.style.backgroundColor = '#ffffff';
            document.body.appendChild(renderContainer);
            
            await docx.renderAsync(arrayBuffer, renderContainer, null, {
                breakPages: true,
                ignoreLastRenderedPageBreak: false
            });
            
            var pages = renderContainer.querySelectorAll('.docx-page');
            console.log('Pages found:', pages.length);
            
            await new Promise(function(resolve) { setTimeout(resolve, 2000); });
            
            statusText.innerText = 'Gerando PDF...';
            updateUI(70);
            
            var pdfDoc = new window.jspdf.jsPDF('p', 'mm', 'a4');
            var pageWidthMm = 210;
            var pageHeightMm = 297;
            
            if (pages.length > 0) {
                for (var i = 0; i < pages.length; i++) {
                    var canvas = await html2canvas(pages[i], {
                        scale: 2,
                        backgroundColor: '#ffffff'
                    });
                    
                    var imgData = canvas.toDataURL('image/jpeg', 0.85);
                    
                    if (i > 0) pdfDoc.addPage();
                    pdfDoc.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm);
                }
            } else {
                var canvas = await html2canvas(renderContainer, {
                    scale: 2,
                    backgroundColor: '#ffffff'
                });
                console.log('Canvas height:', canvas.height);
                
                var imgData = canvas.toDataURL('image/jpeg', 0.85);
                pdfDoc.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm);
            }
            
            statusText.innerText = 'Finalizando...';
            updateUI(95);
            
            pdfDoc.save(name + '.pdf');
            
            document.body.removeChild(renderContainer);
            
            updateUI(100);
            hideModal();
            console.log('Conversion complete');
        } catch (error) {
            console.error('Error in convertDocxToPdfFallback:', error);
            alert('Erro: ' + error.message);
            hideModal();
        }
    }
    
    async function convertXlsxToPdf(file, name) {
        showModal();
        statusText.innerHTML = 'Enviando arquivo para conversão...';
        updateUI(10);
        
        var formData = new FormData();
        formData.append('file', file);
        
        try {
            var response = await fetch('http://localhost:3001/convert/xlsx-to-pdf', {
                method: 'POST',
                body: formData
            });
            
            updateUI(80);
            
            if (!response.ok) {
                throw new Error('Conversion failed');
            }
            
            var blob = await response.blob();
            var url = URL.createObjectURL(blob);
            
            var link = document.createElement('a');
            link.href = url;
            link.download = name + '.pdf';
            link.click();
            
            URL.revokeObjectURL(url);
            updateUI(100);
            hideModal();
        } catch (error) {
            console.error('Error:', error);
            statusText.innerText = 'Erro na conversão. Usando método alternativo.';
            updateUI(50);
            
            await convertXlsxToPdfFallback(file, name);
        }
    }
    
    async function convertXlsxToPdfFallback(file, name) {
        statusText.innerText = "Lendo dados da planilha...";
        updateUI(20);

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const html = XLSX.utils.sheet_to_html(workbook.Sheets[workbook.SheetNames[0]]);
        
        statusText.innerText = "Preparando visualização...";
        updateUI(50);

        renderZone.innerHTML = `<div id="export-container" style="padding: 30px; background: white; color: black; font-family: sans-serif;">
            <h2 style="text-align: center;">${name}</h2>
            ${html}
        </div>`;
        
        await new Promise(resolve => setTimeout(resolve, 800));

        statusText.innerText = "Gerando ficheiro PDF (pode demorar)...";
        updateUI(80);

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'pt', 'a4');
        const element = document.getElementById('export-container');

        await doc.html(element, {
            callback: function(d) {
                d.save(name + ".pdf");
                renderZone.innerHTML = "";
            },
            x: 15,
            y: 15,
            width: 780, 
            windowWidth: 1100
        });
    }
    async function convertPdfToImg(file, name) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const totalPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            const link = document.createElement('a');
            link.download = `${name}_page${pageNum}.jpg`;
            link.href = canvas.toDataURL('image/jpeg');
            link.click();
        }
    }

    async function convertJpgToPng(file, name) {
        const dataUrl = await fileToDataURL(file);
        
        // Criamos uma imagem temporária para garantir que carregue
        const img = new Image();
        img.src = dataUrl;
        
        await new Promise(resolve => {
            img.onload = resolve;
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Exporta como PNG (qualidade máxima)
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${name}.png`;
        link.href = pngUrl;
        link.click();
    }

    async function convertPngToJpg(file, name) {
        const dataUrl = await fileToDataURL(file);
        
        const img = new Image();
        img.src = dataUrl;
        
        await new Promise(resolve => {
            img.onload = resolve;
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Fundo branco (JPG não suporta transparência)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Exporta como JPG com qualidade 0.92 (bom equilíbrio)
        const jpgUrl = canvas.toDataURL('image/jpeg', 0.92);
        const link = document.createElement('a');
        link.download = `${name}.jpg`;
        link.href = jpgUrl;
        link.click();
    }

    // --- Funções Auxiliares ---

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