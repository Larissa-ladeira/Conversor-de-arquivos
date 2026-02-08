pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const dropdownBtn = document.getElementById('dropdownBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const selectedFormatDisplay = document.getElementById('selectedFormat');
const convertBtn = document.getElementById('convertBtn');

// --- CORREÇÃO DO DROPDOWN ---
document.addEventListener('click', (e) => {
    // Se clicar no botão ou em qualquer item dentro dele (texto, seta)
    if (dropdownBtn.contains(e.target)) {
        e.stopPropagation();
        const isVisible = dropdownMenu.style.display === 'block';
        dropdownMenu.style.display = isVisible ? 'none' : 'block';
    } 
    // Se clicar fora do menu, fecha
    else if (!dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = 'none';
    }
});

// Seleção de formato
document.querySelectorAll('.format-option').forEach(option => {
    option.addEventListener('click', function(e) {
        e.stopPropagation();
        const valor = this.getAttribute('data-ext').toUpperCase();
        selectedFormatDisplay.innerText = valor;
        
        document.querySelectorAll('.format-option').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        dropdownMenu.style.display = 'none'; // Fecha após selecionar
    });
});

// --- SELEÇÃO DE ARQUIVO ---
imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.innerText = file.name;
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => preview.src = event.target.result;
            reader.readAsDataURL(file);
        } else {
            preview.src = ""; 
        }
    }
});

// --- CONVERSÃO ---
convertBtn.addEventListener('click', async () => {
    const format = selectedFormatDisplay.innerText;
    const file = imageInput.files[0];

    if (!file) return alert("Selecione um arquivo primeiro!");

    if (format === 'EPUB') {
        if (file.type !== 'application/pdf') return alert("Selecione um PDF para gerar EPUB.");
        await convertPdfToEpub(file);
    } 
    else if (format === 'PDF') {
        if (!preview.src) return alert("Selecione uma imagem.");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.addImage(preview.src, 'JPEG', 10, 10, 190, 0); 
        doc.save("convertido.pdf");
    } 
    else {
        if (!preview.src) return alert("Selecione uma imagem.");
        const a = document.createElement('a');
        a.href = preview.src;
        a.download = `arquivo.${format.toLowerCase()}`;
        a.click();
    }
});

async function convertPdfToEpub(file) {
    const originalText = convertBtn.innerHTML;
    try {
        const reader = new FileReader();
        convertBtn.innerText = "Processando...";
        convertBtn.disabled = true;

        reader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let textContent = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += `<h2>Página ${i}</h2><p>${text.items.map(s => s.str).join(" ")}</p>`;
            }

            const epubHtml = `<html><body>${textContent}</body></html>`;
            const blob = new Blob([epubHtml], { type: 'application/epub+zip' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.split('.')[0] + ".epub";
            a.click();

            convertBtn.innerHTML = originalText;
            convertBtn.disabled = false;
        };
        reader.readAsArrayBuffer(file);
    } catch (e) {
        alert("Erro na conversão.");
        convertBtn.innerHTML = originalText;
        convertBtn.disabled = false;
    }
}