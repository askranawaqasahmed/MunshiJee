// Uninstall MunshiJee Windows Service
// Run with: node uninstall-windows-service.js

console.log('========================================');
console.log('MunshiJee - Windows Service Uninstaller');
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
  console.error('Error: node-windows is not installed');
  console.log('The service may not exist or was installed differently');
  process.exit(1);
}

const Service = require('node-windows').Service;
const path = require('path');

// Get the current directory
const projectPath = process.cwd();
const scriptPath = path.join(projectPath, 'node_modules', '.bin', 'next');

// Create a new service object
const svc = new Service({
  name: 'MunshiJee',
  script: scriptPath
});

// Listen for the "uninstall" event
svc.on('uninstall', function() {
  console.log('✓ Service uninstalled successfully!');
  console.log('');
  console.log('The MunshiJee service has been removed from Windows Services');
  console.log('');
});

// Listen for errors
svc.on('error', function(err) {
  console.error('Error:', err);
});

// Listen for "does not exist"
svc.on('doesnotexist', function() {
  console.log('⚠ Service does not exist');
  console.log('');
  console.log('The MunshiJee service is not installed');
  console.log('Nothing to uninstall');
  process.exit(1);
});

console.log('Uninstalling MunshiJee service...');
console.log('This may take a moment...');
console.log('');

// Uninstall the service
svc.uninstall();
