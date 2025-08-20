const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Создаем HTTP сервер для обслуживания HTML файла
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Файл не найден');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Страница не найдена');
  }
});

// Создаем WebSocket сервер
const wss = new WebSocket.Server({ server });

// Массив для хранения подключенных клиентов
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Новый клиент подключился');
  clients.add(ws);
  
  // Отправляем историю сообщений новому клиенту (если есть)
  // В данном примере просто приветствие
  
  ws.on('message', (message) => {
    try {
      const messageData = JSON.parse(message);
      console.log('Получено сообщение:', messageData);
      
      // Рассылаем сообщение всем подключенным клиентам
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(messageData));
        }
      });
    } catch (error) {
      console.error('Ошибка обработки сообщения:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Клиент отключился');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('Ошибка WebSocket:', error);
    clients.delete(ws);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в браузере`);
});
