#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

let viteProcess = null;
const PORT = 8080;

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}`, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startServer() {
  log('Starting Vite dev server...');
  
  // Kill any existing processes
  try {
    const { execSync } = require('child_process');
    execSync('taskkill /f /im node.exe >nul 2>&1', { stdio: 'ignore' });
  } catch (e) {
    // Ignore if no processes found
  }
  
  // Start the dev server
  viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });
  
  log(`Vite server started with PID ${viteProcess.pid}`);
  
  // Wait for server to be ready
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
    
    const isReady = await checkServer();
    if (isReady) {
      log('✅ Server is ready and responding');
      return true;
    }
    
    log(`⏳ Waiting for server... (${attempts}/${maxAttempts})`);
  }
  
  log('❌ Server failed to start within timeout period');
  return false;
}

function stopServer() {
  log('Stopping server...');
  
  if (viteProcess) {
    viteProcess.kill();
    viteProcess = null;
  }
  
  try {
    const { execSync } = require('child_process');
    execSync('taskkill /f /im node.exe >nul 2>&1', { stdio: 'ignore' });
  } catch (e) {
    // Ignore
  }
  
  log('✅ Server stopped');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  stopServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(0);
});

// Main execution
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      const started = await startServer();
      if (started) {
        log('Server is running. Press Ctrl+C to stop.');
        // Keep the process alive
        await new Promise(() => {});
      } else {
        process.exit(1);
      }
      break;
      
    case 'stop':
      stopServer();
      break;
      
    case 'restart':
      stopServer();
      await new Promise(resolve => setTimeout(resolve, 2000));
      const restarted = await startServer();
      if (restarted) {
        log('Server restarted successfully');
        await new Promise(() => {});
      } else {
        process.exit(1);
      }
      break;
      
    case 'status':
      const isRunning = await checkServer();
      if (isRunning) {
        log('✅ Server is running');
      } else {
        log('❌ Server is not running');
      }
      break;
      
    default:
      log('Usage: node server-manager.cjs [start|stop|restart|status]');
      process.exit(1);
  }
}

main().catch(err => {
  log('Error: ' + err.message);
  process.exit(1);
});