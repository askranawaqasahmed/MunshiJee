// Install MunshiJee as Windows Service
// Run with: node install-windows-service.js

const path = require('path');
const fs = require('fs');

console.log('========================================');
console.log('MunshiJee - Windows Service Installer');
console.log('========================================');
console.log('');

// Check if running on Windows
if (process.platform !== 'win32') {
  console.error('Error: This script only works on Windows');
  process.exit(1);
}

// Check if node-windows is installed
try {
  require('node-windows');
} catch (e) {
  console.log('Installing node-windows...');
  console.log('Run: npm install -g node-windows');
  console.log('Then run this script again');
  process.exit(1);
}

const Service = require('node-windows').Service;

// Get the current directory
const projectPath = process.cwd();
const scriptPath = path.join(projectPath, 'node_modules', '.bin', 'next');

console.log('Project Path:', projectPath);
console.log('Script Path:', scriptPath);
console.log('');

// Check if .next folder exists
if (!fs.existsSync(path.join(projectPath, '.next'))) {
  console.error('Error: Build not found!');
  console.error('Please run: npm run build');
  process.exit(1);
}

// Create a new service object
const svc = new Service({
  name: 'MunshiJee',
  description: 'MunshiJee Invoicing Application - Professional Invoice Management System',
  script: scriptPath,
  scriptOptions: 'start',
  workingDirectory: projectPath,
  env: [
    {
      name: "NODE_ENV",
      value: "production"
    },
    {
      name: "PORT",
      value: process.env.PORT || "3000"
    }
  ]
});

// Listen for the "install" event
svc.on('install', function() {
  console.log('✓ Service installed successfully!');
  console.log('');
  console.log('Starting service...');
  svc.start();
});

// Listen for the "start" event
svc.on('start', function() {
  console.log('✓ Service started successfully!');
  console.log('');
  console.log('========================================');
  console.log('Service Information:');
  console.log('========================================');
  console.log('Name:', svc.name);
  console.log('Status: Running');
  console.log('URL: http://localhost:' + (process.env.PORT || '3000'));
  console.log('');
  console.log('To manage the service:');
  console.log('  - Start:   net start MunshiJee');
  console.log('  - Stop:    net stop MunshiJee');
  console.log('  - Restart: net stop MunshiJee && net start MunshiJee');
  console.log('');
  console.log('To uninstall: node uninstall-windows-service.js');
  console.log('========================================');
});

// Listen for errors
svc.on('error', function(err) {
  console.error('Error:', err);
});

// Check if already installed
svc.on('alreadyinstalled', function() {
  console.log('⚠ Service is already installed');
  console.log('');
  console.log('To reinstall:');
  console.log('1. Run: node uninstall-windows-service.js');
  console.log('2. Run: node install-windows-service.js');
  process.exit(1);
});

console.log('Installing MunshiJee as Windows Service...');
console.log('This may take a moment...');
console.log('');

// Install the service
svc.install();
