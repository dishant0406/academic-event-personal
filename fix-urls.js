const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, search, replacement) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(search)) {
    const updated = content.split(search).join(replacement);
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

// 1. Replace backend localhost URLs in app directory
walkDir('./app', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    replaceInFile(filePath, 'http://localhost:5000', 'https://academic-event-7bk1.vercel.app');
  }
});

// 2. Replace frontend localhost URLs in backend emails
const emailServicePath = './backend/utils/emailService.js';
if (fs.existsSync(emailServicePath)) {
  replaceInFile(emailServicePath, 'http://localhost:3000', 'https://academic-event-frontend.vercel.app');
}

console.log("All URLs fixed.");
