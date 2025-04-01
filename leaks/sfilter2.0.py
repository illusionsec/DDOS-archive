import os
import subprocess
import time
import psutil
import socket

MAX_CONNECTIONS = 30
OPENVPN_STATUS_LOG = "/etc/openvpn/server/openvpn-status.log" 
OPENVPN_PORT = 1194
CHECK_INTERVAL = 1
BLOCK_DURATION = 60
CLIENTS_FILE = "clients.txt"
set_name = "allowed_clients"
set_name2 = "allow"
set_name3 = "check"

def edit_openvpn_server_conf(old_line, new_line):
    server_conf_locations = [
        "/etc/openvpn/server/server.conf",
        "/etc/openvpn/server.conf"
    ]

    for file_path in server_conf_locations:
        try:
            with open(file_path, 'r') as f:
                lines = f.readlines()
        except FileNotFoundError:
            continue

        found = False
        with open(file_path, 'w') as f:
            for line in lines:
                if line.strip() == old_line:
                    f.write(new_line + '\n')
                    found = True
                else:
                    f.write(line)

        if found:
            return

# Example usage:
old_line = "push \"redirect-gateway ipv6 def1 bypass-dhcp\""
new_line = "push \"redirect-gateway def1 bypass-dhcp\""
edit_openvpn_server_conf(old_line, new_line)


if not os.path.exists(OPENVPN_STATUS_LOG):
    try:
        with open(OPENVPN_STATUS_LOG, "w") as f:
            pass
        print("openvpn-status.log created successfully.")
    except IOError:
        print("Failed to create openvpn-status.log.")
else:
            pass

def add_openvpn_status_line_to_config(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    for line in lines:
        if line.strip() == 'status openvpn-status.log 2':
            print("The line 'status openvpn-status.log 2' already exists in the configuration file.")
            return

    # Append the line to the file if it doesn't exist
    with open(file_path, 'a') as f:
        f.write("status openvpn-status.log 2\n")
    print("The line 'status openvpn-status.log 2' has been added to the configuration file.")
    subprocess.run(["sudo", "systemctl", "restart", "openvpn"])
    subprocess.run(["sudo", "systemctl", "enable", "openvpn"])
    print("Openvpn changes have been updated and Openvpn has been enabled.")
    
def check_ipset_exists(set_name):
    try:
        print("")
        subprocess.run(["sudo", "ipset", "list", set_name], check=True)
        print("")
        subprocess.run(["sudo", "ipset", "list", set_name2], check=True)
        print("")
        subprocess.run(["sudo", "ipset", "list", set_name3], check=True)
        return True
    except subprocess.CalledProcessError:
        return False

def create_ipset():
    if not check_ipset_exists(set_name):
        subprocess.run(["sudo", "ipset", "create", set_name, "hash:ip", "timeout", "0"])
        subprocess.run(["sudo", "ipset", "create", set_name2, "hash:ip", "timeout", "0"])
        subprocess.run(["sudo", "ipset", "create", set_name3, "hash:ip", "timeout", "0"])
        print("The ipset has been created successfully. Restart the script")
    else:
        # If the ipset already exists, you can either skip creating it or delete and recreate it.
        # Uncomment the line below to delete and recreate the ipset:
        # subprocess.run(["sudo", "ipset", "destroy", set_name])
        pass


def read_clients_file():
    clients = set()
    with open(CLIENTS_FILE, "r") as f:
        for line in f:
            clients.add(line.strip())
    return clients
    
def update_ipset(clients_ips):
    subprocess.run(["sudo", "ipset", "flush", "allowed_clients"])
    for ip in clients_ips:
        subprocess.run(["sudo", "ipset", "add", set_name, "timeout", "10"])
        subprocess.run(["sudo", "ipset", "add", set_name2, "timeout", "10"])
        subprocess.run(["sudo", "ipset", "add", set_name3, "timeout", "10"])

def read_openvpn_status_log():
    with open(OPENVPN_STATUS_LOG, "r") as f:
        lines = f.readlines()
        new_clients = set()
        for line in lines:
            if line.startswith("CLIENT_LIST"):
                client = line.split(",")[1].strip()
                ip = line.split(",")[2].strip().split(":")[0]
                if client != "UNDEF":
                    new_clients.add(ip)
    return new_clients

def save_ips_to_clients_file(ips):
    with open(CLIENTS_FILE, "a") as f:
        for ip in ips:
            f.write(f"{ip}\n")
                        
def block_port():
    #subprocess.run(["sudo", "iptables", "-I", "INPUT", "-p", openvpn_protocol, "--dport", str(OPENVPN_PORT), "-m", "set", "!", "--match-set", "allowed_clients", "src", "-j", "DROP"])
    # Stop Spoofed Attacks
    subprocess.run(["sudo", "iptables", "-t", "raw", "-I", "PREROUTING", "-m" "rpfilter", "-j", "ACCEPT"])
    # Drop Established Connections After 3 Seconds
    subprocess.run(["sudo", "iptables", "-t", "raw", "-I", "PREROUTING", "-p", "tcp", "-m", "conntrack", "--ctstate", "ESTABLISHED,UNTRACKED", "-m", "recent", "--rcheck", "--seconds", "3", "--name", "bad_conn", "--mask", "255.255.255.255", "--rsource", "-j", "DROP"])
    # Drop Everything
    subprocess.run(["iptables", "-t", "mangle", "-P", "PREROUTING", "DROP"])
    # SSH Whitelist
    subprocess.run(["sudo", "iptables", "-t", "raw", "-I", "PREROUTING", "-p", "tcp", "-m", "tcp", "--dport", "22", "-s", "10.8.0.0/24", "-j", "ACCEPT"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-I", "PREROUTING", "-p", "tcp", "-m", "tcp", "--dport", "22", "-j", "DROP"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-I", "PREROUTING", "-p", "udp", "-m", "udp", "--dport", "22", "-j", "DROP"])
    # Openvpn Shit
    subprocess.run(["sudo", "iptables", "-t", "raw", "-I", "PREROUTING", "-p", "tcp", "--dport", str(OPENVPN_PORT), "-m", "set", "!", "--match-set", "allowed_clients", "src", "-j", "DROP"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-I", "PREROUTING", "-p", "udp", "--dport", str(OPENVPN_PORT), "-m", "set", "!", "--match-set", "allowed_clients", "src", "-j", "DROP"])
    # Openvpn Shit Extra for TCP
    subprocess.run(["sudo", "iptables", "-t", "raw", "-A", "PREROUTING", "-p", "tcp", "-m", "tcp", "--tcp-flags", "FIN,SYN,RST,ACK SYN", "-m", "conntrack", "--ctstate", "NEW", "-m", "connlimit", "--connlimit-above", "30", "--connlimit-mask", "32", "--connlimit-saddr", "-j", "DROP"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-A", "PREROUTING", "-p", "tcp", "-m", "tcp", "--dport", str(OPENVPN_PORT), "--tcp-flags", "FIN,SYN,RST,ACK SYN", "-m", "conntrack", "--ctstate", "NEW", "-m", "recent", "--set", "--name", "DEFAULT", "--mask", "255.255.255.255", "--rsource"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-A", "PREROUTING", "-p", "tcp", "-m", "tcp", "--dport", str(OPENVPN_PORT), "--tcp-flags", "FIN,SYN,RST,ACK SYN", "-m", "conntrack", "--ctstate", "NEW", "-m", "recent", "--update", "--seconds", "60", "--hitcount", "5", "--name", "DEFAULT", "--mask", "255.255.255.255", "--rsource", "-j", "DROP"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-A", "PREROUTING", "-p", "tcp", "-m", "tcp", "--tcp-flags", "FIN,SYN,RST,ACK SYN", "-m", "hashlimit", "--hashlimit-upto", "15/sec", "--hashlimit-burst", "30", "--hashlimit-mode", "srcip", "--hashlimit-name", "synattack", "-j", "ACCEPT"])
    # Ipset Shit
    subprocess.run(["sudo", "iptables", "-t", "raw", "-I", "PREROUTING", "-m", "bpf", "--bytecode", "19,48 0 0 0,84 0 0 240,21 0 4 96,48 0 0 6,21 0 13 6,40 0 0 42,21 10 11 1194,48 0 0 0,84 0 0 240,21 0 8 64,48 0 0 9,21 0 6 6,40 0 0 6,69 4 0 8191,177 0 0 0,72 0 0 2,21 0 1 1194,6 0 0 262144,6 0 0 0", "-m", "conntrack", "--ctstate", "ESTABLISHED", "-m", "connbytes", "--connbytes", "100", "--connbytes-mode", "packets", "--connbytes-dir", "reply", "-j", "SET", "--add-set", "allow", "src"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-I", "PREROUTING", "-p", "tcp", "-m", "bpf", "--bytecode", "30,48 0 0 0,84 0 0 240,21 26 0 96,48 0 0 0,84 0 0 240,21 0 23 64,48 0 0 9,21 0 21 6,40 0 0 6,69 19 0 8191,177 0 0 0,72 0 0 2,21 0 16 1194,40 0 0 2,53 0 14 96,37 13 0 110,80 0 0 13,21 0 11 24,72 0 0 14,37 9 0 7000,80 0 0 22,21 0 2 56,64 0 0 32,21 4 0 356,80 0 0 34,21 0 3 56,64 0 0 44,21 0 1 356,6 0 0 65535,6 0 0 0", "-j", "SET", "--add-set", "check", "src"])
    # Allow ESTABLISHED Connections
    subprocess.run(["sudo", "iptables", "-t", "mangle", "-A", "PREROUTING", "-m", "conntrack", "--ctstate", "RELATED,ESTABLISHED", "-j", "ACCEPT"])
    # DROP Everything
    subprocess.run(["sudo", "iptables", "-t", "raw", "-A", "PREROUTING", "-j", "DROP"])

def unblock_port():
    #subprocess.run(["sudo", "iptables", "-D", "INPUT", "-p", openvpn_protocol, "--dport", str(OPENVPN_PORT), "-m", "set", "!", "--match-set", "allowed_clients", "src", "-j", "DROP"])
    # Stop Spoofed Attacks
    subprocess.run(["sudo", "iptables", "-t", "raw", "-D", "PREROUTING", "-m" "rpfilter", "-j", "ACCEPT"])
    # Drop ESTABLISHED After 3 Seconds
    subprocess.run(["sudo", "iptables", "-t", "raw", "-D", "PREROUTING", "-p", "tcp", "-m", "conntrack", "--ctstate", "ESTABLISHED,UNTRACKED", "-m", "recent", "--rcheck", "--seconds", "3", "--name", "bad_conn", "--mask", "255.255.255.255", "--rsource", "-j", "DROP"])
    # Drop Everything
    subprocess.run(["iptables", "-t", "mangle", "-P", "PREROUTING", "DROP"])
    # SSH Whitelist
    subprocess.run(["sudo", "iptables", "-t", "raw", "-D", "PREROUTING", "-p", "tcp", "-m", "tcp", "--dport", "22", "-s", "10.8.0.0/24", "-j", "ACCEPT"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-D", "PREROUTING", "-p", "tcp", "-m", "tcp", "--dport", "22", "-j", "DROP"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-D", "PREROUTING", "-p", "udp", "-m", "udp", "--dport", "22", "-j", "DROP"]) 
    # Openvpn Shit
    subprocess.run(["sudo", "iptables", "-t", "raw", "-D", "PREROUTING", "-p", "tcp", "--dport", str(OPENVPN_PORT), "-m", "set", "!", "--match-set", "allowed_clients", "src", "-j", "DROP"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-D", "PREROUTING", "-p", "udp", "--dport", str(OPENVPN_PORT), "-m", "set", "!", "--match-set", "allowed_clients", "src", "-j", "DROP"])
    # Openvpn Shit Extra for TCP
    subprocess.run(["sudo", "iptables", "-t", "raw", "-A", "PREROUTING", "-p", "tcp", "-m", "tcp", "--tcp-flags", "FIN,SYN,RST,ACK SYN", "-m", "conntrack", "--ctstate", "NEW", "-m", "connlimit", "--connlimit-above", "30", "--connlimit-mask", "32", "--connlimit-saddr", "-j", "DROP"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-A", "PREROUTING", "-p", "tcp", "-m", "tcp", "--dport", str(OPENVPN_PORT), "--tcp-flags", "FIN,SYN,RST,ACK SYN", "-m", "conntrack", "--ctstate", "NEW", "-m", "recent", "--set", "--name", "DEFAULT", "--mask", "255.255.255.255", "--rsource"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-A", "PREROUTING", "-p", "tcp", "-m", "tcp", "--dport", str(OPENVPN_PORT), "--tcp-flags", "FIN,SYN,RST,ACK SYN", "-m", "conntrack", "--ctstate", "NEW", "-m", "recent", "--update", "--seconds", "60", "--hitcount", "5", "--name", "DEFAULT", "--mask", "255.255.255.255", "--rsource", "-j", "DROP"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-A", "PREROUTING", "-p", "tcp", "-m", "tcp", "--tcp-flags", "FIN,SYN,RST,ACK SYN", "-m", "hashlimit", "--hashlimit-upto", "15/sec", "--hashlimit-burst", "30", "--hashlimit-mode", "srcip", "--hashlimit-name", "synattack", "-j", "ACCEPT"])
    # Ipset Check
    subprocess.run(["sudo", "iptables", "-t", "raw", "-D", "PREROUTING", "-m", "bpf", "--bytecode", "19,48 0 0 0,84 0 0 240,21 0 4 96,48 0 0 6,21 0 13 6,40 0 0 42,21 10 11 1194,48 0 0 0,84 0 0 240,21 0 8 64,48 0 0 9,21 0 6 6,40 0 0 6,69 4 0 8191,177 0 0 0,72 0 0 2,21 0 1 1194,6 0 0 262144,6 0 0 0", "-m", "conntrack", "--ctstate", "ESTABLISHED", "-m", "connbytes", "--connbytes", "100", "--connbytes-mode", "packets", "--connbytes-dir", "reply", "-j", "SET", "--add-set", "allow", "src"])
    subprocess.run(["sudo", "iptables", "-t", "raw", "-D", "PREROUTING", "-p", "tcp", "-m", "bpf", "--bytecode", "30,48 0 0 0,84 0 0 240,21 26 0 96,48 0 0 0,84 0 0 240,21 0 23 64,48 0 0 9,21 0 21 6,40 0 0 6,69 19 0 8191,177 0 0 0,72 0 0 2,21 0 16 1194,40 0 0 2,53 0 14 96,37 13 0 110,80 0 0 13,21 0 11 24,72 0 0 14,37 9 0 7000,80 0 0 22,21 0 2 56,64 0 0 32,21 4 0 356,80 0 0 34,21 0 3 56,64 0 0 44,21 0 1 356,6 0 0 65535,6 0 0 0", "-j", "SET", "--add-set", "check", "src"])
    # Allow ESTABLISHED Connections
    subprocess.run(["sudo", "iptables", "-t", "mangle", "-A", "PREROUTING", "-m", "conntrack", "--ctstate", "RELATED,ESTABLISHED", "-j", "ACCEPT"])
    # DROP Everything
    subprocess.run(["sudo", "iptables", "-t", "raw", "-A", "PREROUTING", "-j", "DROP"])


def is_openvpn_process(process):
    return "openvpn" in process.name().lower()

def is_openvpn_running():
    for process in psutil.process_iter(['name']):
        if is_openvpn_process(process):
            return True
    return False

def unblock_openvpn_port():
    if is_openvpn_running():
        unblock_port()
    else:
        unblock_port()

def get_connections_on_port(port):
    connections = 0
    for conn in psutil.net_connections(kind='inet'):
        if conn.laddr.port == port and conn.status == psutil.CONN_ESTABLISHED:
            connections += 1
    return connections

def monitor_connections():
    port_blocked = False
    block_start_time = 0

    while True:
        time.sleep(CHECK_INTERVAL)
        
        new_clients_ips = read_openvpn_status_log()
        clients_ips = read_clients_file()
        new_ips_to_save = new_clients_ips - clients_ips
        save_ips_to_clients_file(new_ips_to_save)
        clients_ips.update(new_clients_ips)
        update_ipset(clients_ips)

        current_connections = get_connections_on_port(OPENVPN_PORT)
        connections_per_second = current_connections / CHECK_INTERVAL

        if connections_per_second > MAX_CONNECTIONS and not port_blocked:
            print("Attack detected!")
            block_port()
            port_blocked = True
            block_start_time = time.time()

        if port_blocked and time.time() - block_start_time >= BLOCK_DURATION:
            print("Unblocking the port...")
            unblock_port()
            port_blocked = False

if __name__ == "__main__":
    create_ipset()
    monitor_connections()