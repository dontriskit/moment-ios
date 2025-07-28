#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const configPath = path.join(__dirname, 'src', 'config', 'index.ts');

// Read the config file
let configContent = fs.readFileSync(configPath, 'utf8');

// Update the dev URLs with the local IP
configContent = configContent.replace(
  /apiUrl: 'http:\/\/[^']+'/g,
  `apiUrl: 'http://${localIP}:3000'`
);

configContent = configContent.replace(
  /apiTrpcUrl: 'http:\/\/[^']+\/api\/trpc'/g,
  `apiTrpcUrl: 'http://${localIP}:3000/api/trpc'`
);

// Write the updated config
fs.writeFileSync(configPath, configContent);

console.log(`✅ Updated local development URLs to use IP: ${localIP}`);
console.log(`   API URL: http://${localIP}:3000`);
console.log(`   tRPC URL: http://${localIP}:3000/api/trpc`);
console.log('\n📱 Make sure your phone is on the same network as your computer!');