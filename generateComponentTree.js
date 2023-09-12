const fs = require('fs');
const path = require('path');

function readDir(dir, level = 0) {
  // Prefix to format tree-like structure
  const prefix = '  '.repeat(level);
  
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      console.log(`${prefix}+ [${file}]`);
      readDir(filePath, level + 1);
    } else if (path.extname(file) === '.vue') {
      console.log(`${prefix}-- ${file}`);
    }
  });
}

// Starting directory, adjust as needed
const startDir = './src';

console.log(`Component tree for directory: ${startDir}`);
readDir(startDir);
