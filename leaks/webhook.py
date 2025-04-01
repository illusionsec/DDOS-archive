import requests
import json
import sys
import os 
import subprocess
import time
import re
import collections
URL = 'https://discord.com/api/webhooks/894473794524151828/yOkyrO_TCQ-6Bbq4RIPQjjRvaFaHNQJdlG6XvvUgVbX8XABNb1nqmIZfRLzOkz1RrkkZ'
true = 'true'
false = 'false'
# [Getting most frequesnt eye pee
count1 = 0;
word1 = "";
maxCount1 = 0;
words1 = [];


file1 =open("/root/TCPDUMP/extra/sortedip.txt", "r")

for line in file1:
    string=line.lower().replace(',','.').replace('.','.').split(" ");
    for s in string:
        words1.append(s);
for i in range(0, len(words1)):
    count1 = 1;
    for j in range(i+1, len(words1)):
        if(words1[i] == words1[j]):
            count1 = count1 + 1;
            
    if(count1 > maxCount1):
        maxCount1 = count1;
        eyepee = words1[i];
# ]


# 6 = tcp , 17 = udp , 1 = icmp , 50 = esp , 47 = gre
# I'm retarded so for icmp it will still show "1" not "icmp" , because replacing "1" with icmp also replaced "1" in "17 (used for udp)" with ICMP
# My horrible attempt at getting most used protocol (still in progress) [
count = 0;
word = "";
maxCount = 0;
words = [];


file =open("/root/TCPDUMP/extra/sortedproto.txt", "r")

for line in file:
  # Since this script is using Tshark it uses protocol numbers , we will replace those numbers with the corresponding protocol name
    string=line.lower().replace('6','TCP').replace('17','UDP').split(" ");
    for s in string:
        words.append(s);
for i in range(0, len(words)):
    count = 1;
    for j in range(i+1, len(words)):
        if(words[i] == words[j]):
            count = count + 1;
            
    if(count > maxCount):
        maxCount = count;
        word = words[i];
# ]

# My horrible attempt at ammount of attacking ips [
filename="/root/TCPDUMP/nigga/infoforfing.txt"
linescount=0
with open (filename,'r') as files:
  for i in files:
    linescount=linescount+1
# ]

file = open(sys.argv[1], "r")
capture_file = file.read()

definitionVer = "1.0.0"
attack_types = {
  "(UDP)": "17    ",
  "(ICMP)": "1    ",
  "(ICMP Destination Unreachable)": "1,17    ",
  "(IPv4/Fragmented)": "4   ",
  "(GRE)": "47    ",
  "(IPX)": "111   ",
  "(AH)": "51   ",
  "(ESP)": "50    ",
  "(OpenVPN Amp)": "17   1194",
  "(VSE)": "17    27015",
  "(ANY DNS Query Amp)": "00ff0001",
  "(NTP Amp)": "17   123",
  "(Chargen Amp)": "17   19",
  "(MDNS Amp)": "17    5353",
  "(BitTorrent Amp)": "17    6881",
  "(CLDAP Amp)": "17   389",
  "(STUN Amp)": "17    3478",
  "(MSSQL Amp)": "17   1434",
  "(SNMP Amp)": "17    161",
  "(WSD Amp)": "17   3702",
  "(ARD Amp)": "17   3283",
  "(SSDP Amp)": "17    1900",
  "(Plex Amp)": "17    32414",
  "(DVR Amp)": "17    37810",
  "(NETBIOS Amp)": "17   137",
  "(CoAP Amp)": "17    5683",
  "(Fivem Amp)": "17   30120",
  "(Halo Amp/1)": "17   2302",
  "(Halo Amp/2)": "17   2303",
  "(Tftp Amp)": "17   69",
  "(KillAll/1)": "6   443",
  "(TCP Flood To Port 22)": "0x00000002   22",
  "(KillAll/2)": "6   80",
  "(QOTD Amp)": "17    17",
  "(ISAKMP Amp)": "17    500",
  "(IPMI Amp)": "17    623",
  "(UdpHex Attack)": "2f78",
  "(0x00 Attack)": "0000000000000000000",
  "(0xff Attack)": "fffffffffff",
  "(TCP/SYN-ACK)": "0x00000012",
  "(TCP/PSH-ACK)": "0x00000018",
  "(TCP/RST-ACK)": "0x00000014",
  "(TCP/FIN)": "0x00000001",
  "(TCP/SYN)": "0x00000002",
  "(TCP/PSH)": "0x00000008",
  "(TCP/URG)": "0x00000020",
  "(TCP/RST)": "0x00000004",
  "(TCP/ACK)": "0x00000010",
  "(TCP/SYN-ECN-CWR)": "0x000000c2",
  "(TCP/SYN-ECN)": "0x00000042",
  "(TCP/SYN-CWR)": "0x00000082",
  "(TCP/SYN-PSH-ACK-URG)": "0x0000003a",
  "(TCP/SYN-ACK-ECN-CWR)": "0x000000d2",
  "(TCP/PSH-ACK-URG)": "0x00000038",
  "(TCP/FIN-SYN-RST-PSH-ACK-URG)": "0x0000003f",
  "(TCP/RST-ACK-URG-CWR-Reserved)": "0x000004b4",
  "(TCP/SYN-PSH-URG-ECN-CWR-Reserved)": "0x000004ea",
  "(TCP/FIN-RST-PSH-ECN-CWR-Reserved)": "0x00000ccd",
  "(TCP/FIN-RST-PSH-ACK-URG-ECN-CWR-Reserved)": "0x00000cfd"
}

attack_type = ''

for occurrences in attack_types:
  
  number = capture_file.count(attack_types[occurrences])
  if number > 2000:
    attack_type = attack_type + " " + occurrences

if attack_type == '':
  attack_type = "Could not define attack type"

# [Established connections counter
established = subprocess.getoutput("netstat -ant | grep ESTABLISHED | awk '{print $6}' | cut -d: -f1 | sort | uniq -c | sort -rn")
# ]

# [ PPS Counter
o = subprocess.getoutput("grep eth0: /proc/net/dev | cut -d :  -f2 | awk '{ print $2 }'")
time.sleep(1)
t = subprocess.getoutput("grep eth0: /proc/net/dev | cut -d :  -f2 | awk '{ print $2 }'")
pps = int(o) - int(t)
pps = str(pps)
pps = pps.replace("-", "")
# ]

# [ MBPS 
n = open("/sys/class/net/eth0/statistics/rx_bytes", "r")
n1 = n.read()
n.close()
n1 = int(n1)
time.sleep(1)
n2 = open("/sys/class/net/eth0/statistics/rx_bytes", "r")
n3 = n2.read()
n2.close()
n3 = int(n3)
byt2 = n1 - n3

mbps = byt2 / 125000
mbps = str(mbps)
mbps = mbps.replace("-", "")
# ]

# Discord Webhook [
payload = {
  "embeds": [
    {
      "title": "Traffic has reached set PPS Limit",
      "description": "We have noticed a large amount of traffic",
      "url": "https://github.com/TTL-ovpn",
      "color": 0000000,
      "fields": [
        {
          "name": "Server",
          "value": "USA-1",
          "inline": true
        },
        {
          "name": "IP Address:",
          "value": "1.3.3.7",
          "inline": true
        },
        {
          "name": "Pcap Info:",
          "value": "Pcap saved in /usr/TPCDUMPS/pcap"
        },
        {
          "name": "DNS Querys Info:",
          "value": "DNS Querys saved in /usr/TPCDUMPS/extra"
        },
        {
          "name": "Attacking IPS Info:",
          "value": "Attacking IPS saved in /usr/TPCDUMPS/report"
        },
        {
          "name": "Established Connections:",
          "value": established
        },
        {
          "name": "Estimated Attacking IpsCount",
          "value": linescount
        },
        {
         "name": "Most frequent Attacking ip:",
         "value": eyepee
        },
        {
         "name": "Attack Type:",
         "value": attack_type
        },
        {
         "name": "Attack Protocol:",
         "value": word
        },
        {
         "name": "Mbps:",
         "value": mbps,
         "inline": true
        },
        {
         "name": "PPS:",
         "value": pps,
         "inline": true
        }
      ],
      "author": {
        "name": "Attack Detection",
        "url": "https://github.com/TTL-ovpn",
        "icon_url": "https://cdn.discordapp.com/attachments/886090077506244649/886153864842211328/136620198-cyber-security-logo-with-shield-vector-image.jpg"
      },
      "footer": {
        "text": "Attack has been detected!",
        "url": "https://cdn.discordapp.com/attachments/865298305554317342/890550455573295114/firewall.png"
      },
      "thumbnail": {
        "url": "https://cdn.discordapp.com/attachments/865298305554317342/890550457527861258/united-states-of-america.png"
      }
    }
  ]
}
header_data = {'content-type': 'application/json'}
requests.post(URL, json.dumps(payload), headers=header_data)
# ]
