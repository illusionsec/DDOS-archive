# Layer7-MultiBypass: Advanced NodeJS Web Request Flooder

NodeJS-based web request flooder that sends massive amounts of requests to a URL, equipped with custom features and advanced bypasses for JS challenges. Includes proxy support. **Do not sell or distribute this tool!**

<p align="center">
  <a href="https://anonvm.wtf/">
    <img src="https://i.imgur.com/WIuFSG6.gif" alt="AnonVM">
  </a>
</p>

### Key Bypass Features:
- **Cloudflare**: Bypasses JS challenge (UAM) and partially Captcha
- **Stormwall**: Bypass
- **BlazingFast**: Bypass
- **OVH**: Bypasses UAM
- **PipeGuard**: Bypass
- **DDoS-Guard**: Bypasses JS challenge

This module is compatible with CNC controllers but can also be executed via a simple command.

### Requirements:
- **node.js**
- **proxies.txt**: File containing proxy list
- **ua.txt**: File containing user agents list

### Usage Instructions:
1. Run `npm install`
2. Execute the script with the command: 
   ```bash
   node method.js [URL] [DURATION(SECONDS)] [MODE]
   ```
   **Example**:
   ```bash
   node method.js https://example.com 120 request 5
   ```
