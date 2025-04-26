#!/bin/bash

# Build the app in production mode
echo "Building Angular app in production mode..."
ng build --configuration=production

# Create the server.js file for serving with correct MIME types
cat > serve-pwa.js << EOF
const express = require('express');
const path = require('path');
const app = express();

// Set correct MIME type for manifest
app.get('/assets/manifest.webmanifest', (req, res) => {
  res.set('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'dist/penndora/browser/assets/manifest.webmanifest'));
});

app.get('/manifest.webmanifest', (req, res) => {
  res.set('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'dist/penndora/browser/assets/manifest.webmanifest'));
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/penndora/browser')));

// All other routes should redirect to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/penndora/browser/index.html'));
});

const port = 8080;
app.listen(port, () => {
  console.log(\`PWA test server running at http://localhost:\${port}\`);
  console.log(\`Open Chrome DevTools > Application tab to check PWA status\`);
});
EOF

# Install express if not already installed
if ! npm list express > /dev/null 2>&1; then
  echo "Installing express..."
  npm install express --save-dev
fi

# Run the server
echo "Starting PWA test server..."
node serve-pwa.js 