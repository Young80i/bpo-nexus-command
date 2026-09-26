#!/usr/bin/env node

// Reliable server monitoring script
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Server configuration
const PORT = 8080;
const SERVER_URL = `http://localhost:${PORT}`;
let viteProcess = null;
let monitoringInterval = null;
let isServerReady = false;

// Function to check if server is responding
function checkServerStatus() {
  return new Promise((resolve) => {
    const req = http.get(SERVER_URL, (res) => {
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

// Function to start the dev server
async function startDevServer() {
  try {
    console.log('🔄 Starting Vite dev server...');
    
    // Kill any existing node processes on port 8080
    const { execSync } = require('child_process');
    try {
      execSync('taskkill /f /im node.exe >nul 2>&1', { stdio: 'ignore' });
    } catch (e) {
      // Process might not exist, that's fine
    }
    
    // Start npm run dev
    viteProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      detached: true,
      cwd: process.cwd(),
    });
    
    // Store the process PID for later cleanup
    const pid = viteProcess.pid;
    console.log(`🚀 Vite server started with PID: ${pid}`);
    
    // Wait for server to be ready
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!isServerReady && attempts < maxAttempts) {
      attempts++;
      const isReady = await checkServerStatus();
      
      if (isReady) {
        isServerReady = true;
        console.log('✅ Server is ready and responding');
        
        // Log the response for verification
        const http = require('http');
        http.get(SERVER_URL, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (data.includes('BPO Nexus') || data.includes('vite')) {
              console.log('✅ Server response contains expected content');
            } else {
              console.log('⚠️ Server response does not contain expected content');
            }
          });
        });
        break;
      }
      
      console.log(`⏳ Waiting for server... (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (!isServerReady) {
      console.log('❌ Server failed to start within timeout period');
      process.exit(1);
    }
    
    // Set up continuous monitoring
    monitoringInterval = setInterval(async () => {
      const isHealthy = await checkServerStatus();
      if (!isHealthy && isServerReady) {
        console.log('⚠️ Server became unavailable');
        isServerReady = false;
      } else if (isHealthy && !isServerReady) {
        console.log('🔄 Server recovered');
        isServerReady = true;
      }
    }, 15000); // Check every 15 seconds
    
    console.log('📊 Server monitoring active');
    
  } catch (error) {
    console.error('❌ Failed to start dev server:', error.message);
    process.exit(1);
  }
}

// Function to stop the server
function stopServer() {
  console.log('\\n🛑 Stopping server...');
  
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  
  if (viteProcess) {
    viteProcess.kill('SIGTERM');
    viteProcess = null;
  }
  
  // Additional cleanup
  try {
    require('child_process').execSync('taskkill /f /im node.exe >nul 2>&1', { stdio: 'ignore' });
  } catch (e) {
    // Ignore errors during cleanup
  }
  
  console.log('✅ Server stopped');
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);

// Start the server
startDevServer();