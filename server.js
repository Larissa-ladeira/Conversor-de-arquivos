const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const OUTPUT_DIR = path.join(__dirname, 'output');
const SCRIPTS_DIR = path.join(__dirname, 'scripts');

[OUTPUT_DIR, SCRIPTS_DIR, 'uploads'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function runPowerShellScript(scriptContent) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(SCRIPTS_DIR, 'temp_script.ps1');
        fs.writeFileSync(scriptPath, scriptContent, 'utf8');
        
        const ps = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-File', scriptPath], {
            shell: true
        });
        
        let stdout = '';
        let stderr = '';
        
        ps.stdout.on('data', (data) => { stdout += data; });
        ps.stderr.on('data', (data) => { stderr += data; });
        
        ps.on('close', (code) => {
            fs.unlink(scriptPath, () => {});
            if (code === 0) {
                resolve(stdout);
            } else {
                reject(new Error(stderr || stdout));
            }
        });
    });
}

app.post('/convert/docx-to-pdf', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const filename = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const outputPath = path.join(OUTPUT_DIR, filename + '.pdf');

    const script = `
$ErrorActionPreference = "SilentlyContinue"
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = $false

try {
    $doc = $word.Documents.Open("${inputPath.replace(/\\/g, '\\\\')}")
    $doc.SaveAs([ref]"${outputPath.replace(/\\/g, '\\\\')}", [ref]17)
    $doc.Close([ref]$false)
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    Write-Output "SUCCESS"
} catch {
    $word.Quit()
    Write-Output "ERROR: $_"
}
`;

    try {
        const result = await runPowerShellScript(script);
        
        fs.unlink(inputPath, () => {});
        
        if (result.includes('SUCCESS') && fs.existsSync(outputPath)) {
            const pdfData = fs.readFileSync(outputPath);
            fs.unlink(outputPath, () => {});
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
            res.send(pdfData);
        } else {
            console.log('Word result:', result);
            res.status(500).json({ error: 'Conversion failed', details: result });
        }
    } catch (error) {
        console.error('Error:', error.message);
        fs.unlink(inputPath, () => {});
        res.status(500).json({ error: 'Conversion failed', details: error.message });
    }
});

app.post('/convert/xlsx-to-pdf', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const filename = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const outputPath = path.join(OUTPUT_DIR, filename + '.pdf');

    const script = `
$ErrorActionPreference = "SilentlyContinue"
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $wb = $excel.Workbooks.Open("${inputPath.replace(/\\/g, '\\\\')}")
    $wb.SaveAs([ref]"${outputPath.replace(/\\/g, '\\\\')}", [ref]27)
    $wb.Close([ref]$false)
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    Write-Output "SUCCESS"
} catch {
    $excel.Quit()
    Write-Output "ERROR: $_"
}
`;

    try {
        const result = await runPowerShellScript(script);
        
        fs.unlink(inputPath, () => {});
        
        if (result.includes('SUCCESS') && fs.existsSync(outputPath)) {
            const pdfData = fs.readFileSync(outputPath);
            fs.unlink(outputPath, () => {});
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
            res.send(pdfData);
        } else {
            res.status(500).json({ error: 'Conversion failed', details: result });
        }
    } catch (error) {
        console.error('Error:', error.message);
        fs.unlink(inputPath, () => {});
        res.status(500).json({ error: 'Conversion failed', details: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Using Microsoft Word/Excel for conversion');
});