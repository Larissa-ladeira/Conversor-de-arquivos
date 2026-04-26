from flask import Flask, request, send_file, jsonify, send_from_directory
from flask_cors import CORS
import os
import subprocess
from pathlib import Path

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / 'output'
UPLOAD_DIR = BASE_DIR / 'uploads'

OUTPUT_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)

app.config['UPLOAD_FOLDER'] = str(UPLOAD_DIR)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

def run_powershell(script):
    result = subprocess.run(
        ['powershell.exe', '-ExecutionPolicy', 'Bypass', '-Command', script],
        capture_output=True,
        text=True,
        creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, 'CREATE_NO_WINDOW') else 0
    )
    return result.stdout, result.stderr, result.returncode

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

@app.route('/convert/docx-to-pdf', methods=['POST'])
def convert_docx_to_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
    
    filename_stem = Path(file.filename).stem
    input_path = UPLOAD_DIR / file.filename
    output_path = OUTPUT_DIR / (filename_stem + '.pdf')
    file.save(str(input_path))
    
    soffice = r"C:\Program Files\LibreOffice\program\soffice.exe"
    
    result = subprocess.run(
        [soffice, '--headless', '--convert-to', 'pdf', '--outdir', str(OUTPUT_DIR), str(input_path)],
        capture_output=True,
        text=True
    )
    
    if output_path.exists():
        return send_file(output_path, mimetype='application/pdf', as_attachment=True, download_name=output_path.name)
    else:
        try:
            os.unlink(str(input_path))
        except:
            pass
        return jsonify({'error': 'Conversão falhou', 'details': result.stderr}), 500

@app.route('/convert/xlsx-to-pdf', methods=['POST'])
def convert_xlsx_to_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
    
    filename_stem = Path(file.filename).stem
    input_path = UPLOAD_DIR / file.filename
    output_path = OUTPUT_DIR / (filename_stem + '.pdf')
    file.save(str(input_path))
    
    soffice = r"C:\Program Files\LibreOffice\program\soffice.exe"
    
    result = subprocess.run(
        [soffice, '--headless', '--convert-to', 'pdf', '--outdir', str(OUTPUT_DIR), str(input_path)],
        capture_output=True,
        text=True
    )
    
    if output_path.exists():
        return send_file(output_path, mimetype='application/pdf', as_attachment=True, download_name=output_path.name)
    else:
        try:
            os.unlink(str(input_path))
        except:
            pass
        return jsonify({'error': 'Conversão falhou', 'details': result.stderr}), 500

if __name__ == '__main__':
    print('Servidor rodando em http://localhost:3001')
    print('Usando LibreOffice para conversão')
    app.run(port=3001, debug=False)