# Conversor de Arquivos - Servidor

## Requisitos

1. **Node.js** instalado (versão 14+)
2. **LibreOffice** instalado no sistema

## Instalação do LibreOffice

### Windows:
- Baixe em: https://www.libreoffice.org/download/download/
- Durante instalação, marque a opção "Registar extensões de ficheiro"

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install libreoffice
```

### macOS:
```bash
brew install --cask libreoffice
```

## Configuração

1. Instale as dependências do Node.js:
```bash
npm install
```

## Execução

1. Inicie o servidor:
```bash
npm start
```

2. O servidorará em: http://localhost:3001

3. Abra o conversor no navegador:
- Se for usar o conversor web local, abra o index.html diretamente no navegador ou use um servidor local como Live Server

##Nota

- O servidor converte usando LibreOffice que mantém a paginação correta do documento original
- Se o servidor não estiver iniciado, o conversor usará método alternativo (menos preciso)
- LibreOffice deve estar no PATH do sistema

## Solução de Problemas

### "libreoffice: command not found"
- Adicione o caminho do LibreOffice ao PATH do sistema
- No Windows,通常是: `C:\Program Files\LibreOffice\program`

### "Conversion failed"
- Verifique se LibreOffice está instalado corretamente
- Abra o terminal e digite `libreoffice --version` para testar