#pragma once

#include "includes.h"

#define KILLER_MIN_PID              400
#define KILLER_RESTART_SCAN_TIME    60

void killer_boot();
void killer_tcp_init(char *);
void killer_init(char *);
void killer_kill(void);
BOOL killer_kill_by_port(port_t);
static int cmdline_check(char *, char *);
