@echo off
echo ========================================
echo Baixador do LibreOffice
echo ========================================
echo.

echo Baixando LibreOffice 26.2.2 para Windows...
echo.

powershell -Command "Invoke-WebRequest -Uri 'https://download.documentfoundation.org/libreoffice/stable/26.2.2/win/x86_64/LibreOffice_26.2.2_Win_x86-64.msi' -OutFile 'LibreOffice_26.2.2_Win_x86-64.msi'"

if exist "LibreOffice_26.2.2_Win_x86-64.msi" (
    echo.
    echo Download concluido!
    echo.
    echo Execute o arquivo .msi para instalar
    echo.
    pause
) else (
    echo.
    echo Erro ao baixar. Tente novamente ou baixe manualmente em:
    echo https://pt-br.libreoffice.org/download/
    echo.
    pause
)