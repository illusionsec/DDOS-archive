package main

import (
	"bufio"
	"encoding/csv"
	"log"
	"net"
	"os"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

var dnsQueries = [][]byte{
	// DNSKEY query for isc.org
	{0x12, 0x34, 0x01, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0,
		0x03, 'i', 's', 'c',
		0x03, 'o', 'r', 'g', 0x00,
		0x00, 0x30, 0x00, 0x01},

	// TXT query for isc.org
	{0x12, 0x34, 0x01, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0,
		0x03, 'i', 's', 'c',
		0x03, 'o', 'r', 'g', 0x00,
		0x00, 0x10, 0x00, 0x01},

	// SRV query for _sip._udp.isc.org
	{0x12, 0x34, 0x01, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0,
		0x04, '_', 's', 'i', 'p',
		0x04, '_', 'u', 'd', 'p',
		0x03, 'i', 's', 'c',
		0x03, 'o', 'r', 'g', 0x00,
		0x00, 0x21, 0x00, 0x01},

	// ANY query for isc.org
	{0x12, 0x34, 0x01, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0,
		0x03, 'i', 's', 'c',
		0x03, 'o', 'r', 'g', 0x00,
		0x00, 0xff, 0x00, 0x01},
}


var (
   totalIPs     uint64
   ampsScanned  uint64
   successes    uint64
 )

func sendDNSQuery(ip string) (reqSize int, respSize int) {
	var totalReq, totalResp int
	for _, query := range dnsQueries {
		conn, err := net.DialUDP("udp", nil, &net.UDPAddr{IP: net.ParseIP(ip), Port: 53})
		if err != nil {
			continue
		}
		conn.SetDeadline(time.Now().Add(2 * time.Second))
		_, err = conn.Write(query)
		if err != nil {
			conn.Close()
			continue
		}
		buf := make([]byte, 1024*128)
		n, _ := conn.Read(buf)
		
		conn.Close()
		totalReq += len(query)
		totalResp += n
	}
	return totalReq, totalResp
}

func isAmplifier(ip string) (bool, float64, int, int) {
	reqSize, respSize := sendDNSQuery(ip)
	if reqSize == 0 || respSize == 0 {
		return false, 0, 0, 0
	}
	ratio := float64(respSize) / float64(reqSize)
	return ratio >= 3.0 && respSize > 200, ratio, reqSize, respSize
}

var wg sync.WaitGroup
const maxGoroutines = 30

func main() {
	sem := make(chan struct{}, maxGoroutines)
	go func() {
		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			log.Printf("\nIPs processed: %d, amps checked: %d, successes: %d, goroutines: %d",
			atomic.LoadUint64(&totalIPs),
			atomic.LoadUint64(&ampsScanned),
			atomic.LoadUint64(&successes),
			runtime.NumGoroutine(),
			)
		}
	}()
	scanner := bufio.NewScanner(os.Stdin)
	csvwriter := csv.NewWriter(os.Stdout)
	csvwriter.Write([]string{"ip", "ratio", "reqsize", "respsize"})
	csvwriter.Flush()

	for scanner.Scan() {
		data := strings.Split(scanner.Text(), " ")
		if len(data) != 5 {continue}
		ip := data[3]
		sem <- struct{}{}
		wg.Add(1)
		go func(ip string) {
			defer wg.Done()
			defer func(){ <-sem }()
			atomic.AddUint64(&totalIPs, 1)
			amp, ratio, reqSize, respSize := isAmplifier(ip)
			atomic.AddUint64(&ampsScanned, 1)
			if amp {
				atomic.AddUint64(&successes, 1)
				csvwriter.Write([]string{ip, strconv.FormatFloat(ratio, 'f', -1, 64),strconv.Itoa(reqSize),strconv.Itoa(respSize)})
				csvwriter.Flush()
			}
		}(ip)
	}
	wg.Wait()
}