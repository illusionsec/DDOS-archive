package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"os"
	"sync"
	"time"

	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

const (
	timeout    = 2 * time.Second // Timeout for connection attempt
	mysqlPort  = 3306            // MySQL port number
	mysqlUser  = "root"          // MySQL username
	mysqlPass  = "root"          // MySQL password
	outputFile = "successful_logins.txt"
)

func main() {
	// Open a file to write successful login IPs
	output, err := os.OpenFile(outputFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("Failed to open output file: %s", err)
	}
	defer output.Close()

	// Read the IPs from the "nets.txt" file
	input, err := os.Open("nets.txt")
	if err != nil {
		log.Fatalf("Failed to open input file: %s", err)
	}
	defer input.Close()

	var wg sync.WaitGroup
	scanner := bufio.NewScanner(input)
	for scanner.Scan() {
		ip := scanner.Text()

		// Start a new goroutine to handle each IP address
		wg.Add(1)
		go func(ip string) {
			defer wg.Done()

			// Check if port 3306 is open on the IP address
			if !isPortOpen(ip, mysqlPort) {
				log.Printf("%s: Port %d is closed\n", ip, mysqlPort)
				return
			}

			// Try to connect to MySQL on the IP address
			dataSource := fmt.Sprintf("%s:%s@tcp(%s:%d)/", mysqlUser, mysqlPass, ip, mysqlPort)
			db, err := sql.Open("mysql", dataSource)
			if err != nil {
				log.Printf("%s: Failed to connect: %s\n", ip, err)
				return
			}
			defer db.Close()

			// Test the MySQL connection
			if err := db.Ping(); err != nil {
				log.Printf("%s: Failed to ping: %s\n", ip, err)
				return
			}

			// Write the IP address to the output file
			if _, err := output.WriteString(ip + "\n"); err != nil {
				log.Printf("Failed to write IP address %s to output file: %s\n", ip, err)
			}

			log.Printf("%s: Connected successfully\n", ip)
		}(ip)
	}

	if err := scanner.Err(); err != nil {
		log.Fatalf("Error reading input file: %s", err)
	}

	// Wait for all goroutines to finish
	wg.Wait()
}

// isPortOpen checks if a given port is open on the specified IP address
func isPortOpen(ip string, port int) bool {
	address := fmt.Sprintf("%s:%d", ip, port)
	conn, err := net.DialTimeout("tcp", address, timeout)
	if err != nil {
		return false
	}
	defer conn.Close()
	return true
}
