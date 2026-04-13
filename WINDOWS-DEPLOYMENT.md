# Windows Production Deployment Guide

## Problem: PM2 on Windows

PM2 has issues on Windows due to Unix pipe permissions. Here are better alternatives for Windows servers.

## ✅ Recommended Solutions

### Option 1: Use NSSM (Recommended)

**NSSM (Non-Sucking Service Manager)** creates Windows services from any executable.

#### 1. Download NSSM
```
https://nssm.cc/download
```

#### 2. Install as Windows Service
```cmd
# Navigate to your project
cd C:\inetpub\wwwroot\munshijee.ideageek.pk

# Install service
nssm install MunshiJee "C:\Program Files\nodejs\node.exe" "C:\inetpub\wwwroot\munshijee.ideageek.pk\node_modules\.bin\next" start

# Or if using npm
nssm install MunshiJee "C:\Program Files\nodejs\npm.cmd" start

# Set working directory
nssm set MunshiJee AppDirectory C:\inetpub\wwwroot\munshijee.ideageek.pk

# Set environment file
nssm set MunshiJee AppEnvironmentExtra :NODE_ENV=production

# Start the service
nssm start MunshiJee
```

#### 3. Manage Service
```cmd
# Start
nssm start MunshiJee

# Stop
nssm stop MunshiJee

# Restart
nssm restart MunshiJee

# Status
nssm status MunshiJee

# Remove
nssm remove MunshiJee confirm
```

---

### Option 2: Use IIS with iisnode

If you're already using IIS:

#### 1. Install iisnode
Download from: https://github.com/Azure/iisnode

#### 2. Create web.config
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>
    
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    
    <iisnode 
      nodeProcessCommandLine="&quot;C:\Program Files\nodejs\node.exe&quot;"
      debuggingEnabled="false"
      loggingEnabled="true"
      devErrorsEnabled="false"
    />
  </system.webServer>
</configuration>
```

---

### Option 3: Simple Batch File (For Testing)

Use the provided `start-windows.bat`:

```cmd
# Just double-click or run:
start-windows.bat
```

**Note:** This keeps a console window open. Close it to stop the server.

---

### Option 4: Use node-windows Package

#### 1. Install node-windows
```cmd
npm install -g node-windows
```

#### 2. Create service script
Create `install-service.js`:

```javascript
const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'MunshiJee',
  description: 'MunshiJee Invoicing Application',
  script: 'C:\\inetpub\\wwwroot\\munshijee.ideageek.pk\\node_modules\\.bin\\next',
  scriptOptions: 'start',
  env: [{
    name: "NODE_ENV",
    value: "production"
  }]
});

// Listen for the "install" event
svc.on('install', function() {
  svc.start();
  console.log('Service installed and started!');
});

// Install the service
svc.install();
```

#### 3. Install service
```cmd
node install-service.js
```

---

### Option 5: PM2 as Administrator (If you must use PM2)

#### 1. Run PowerShell as Administrator
Right-click PowerShell → "Run as Administrator"

#### 2. Start PM2
```powershell
cd C:\inetpub\wwwroot\munshijee.ideageek.pk
pm2 start npm --name "munshijee" -- start
pm2 save
pm2 startup
```

---

## 🎯 Quick Start (Simplest Method)

### Method 1: Direct Start (No Service)

```cmd
cd C:\inetpub\wwwroot\munshijee.ideageek.pk
set PORT=80
npm start
```

### Method 2: Using start-windows.bat

```cmd
# Double-click the file or run:
start-windows.bat
```

---

## 🔧 Troubleshooting

### "EPERM: operation not permitted"
- Run as Administrator
- Check antivirus/firewall
- Disable Windows Defender temporarily

### Port 80/443 Already in Use
```cmd
# Check what's using the port
netstat -ano | findstr :80

# Stop IIS if needed
iisreset /stop

# Or use a different port
set PORT=3000
npm start
```

### Service Won't Start
```cmd
# Check Node.js is in PATH
node --version

# Check npm is in PATH
npm --version

# Check the build exists
dir .next
```

---

## 📋 Production Checklist for Windows

- [ ] Node.js installed (v18+)
- [ ] Build completed (`npm run build`)
- [ ] `.env` file configured
- [ ] Database setup complete
- [ ] Port 80/443 available (or configure alternative)
- [ ] Windows Firewall configured
- [ ] Service installed (NSSM or node-windows)
- [ ] Service starts automatically
- [ ] Application accessible from browser
- [ ] Logs being written correctly

---

## 🚀 Recommended Setup for Windows Production

**Best approach:**
1. Use NSSM to create Windows service
2. Configure to start automatically
3. Set up log rotation
4. Monitor with Windows Event Viewer

**Commands:**
```cmd
# Download NSSM
# https://nssm.cc/download

# Install service
cd C:\inetpub\wwwroot\munshijee.ideageek.pk
nssm install MunshiJee "C:\Program Files\nodejs\node.exe" ".next\standalone\server.js"
nssm set MunshiJee AppDirectory C:\inetpub\wwwroot\munshijee.ideageek.pk
nssm set MunshiJee AppStdout C:\inetpub\wwwroot\munshijee.ideageek.pk\logs\stdout.log
nssm set MunshiJee AppStderr C:\inetpub\wwwroot\munshijee.ideageek.pk\logs\stderr.log
nssm start MunshiJee
```

---

## 📞 Still Having Issues?

1. Check Windows Event Viewer for errors
2. Check application logs in `logs/` folder
3. Verify `.env` configuration
4. Test with `npm start` first before creating service
5. Ensure database connection is working

---

**For Windows Server:** NSSM is the most reliable option
**For Development:** Use `start-windows.bat` or `npm start`
**For IIS Users:** Use iisnode integration
