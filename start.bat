# Instalar PM2 para manter o servidor rodando
npm install -g pm2

# Iniciar o servidor
pm2 start server.js --name "conversor"

# Verificar status
pm2 status