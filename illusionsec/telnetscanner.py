import subprocess
import socket
import json
import ipaddress
import re
import concurrent.futures
import time
import requests
from collections import defaultdict

HONEYPOT_KEYWORDS = [
    "dionaea", "cowrie", "honeypot", "kippo", "elastic",
    "fake", "capture", "no route to host", "invalid command",
    "no such file or directory"
]

DOMAIN_REGEX = re.compile(r"@[a-zA-Z0-9.-]+\.(com|net|org|io)")

HONEYPOT_LIST_FILE = "honeypot.json"
IPINFO_TOKEN = ""

BLACKLISTED_PROVIDERS = [
    "ovh", "alibaba", "datapacket", "datacamp",
    "digitalocean", "linode", "vultr", "hetzner",
    "leaseweb", "hostinger", "contabo", "scaleway",
    "m247", "tencent"
]

BLACKLISTED_ASNS = [
    "as16276", "as20473", "as14061", "as16509", "as3598", "as9009",
    "as51167", "as12880", "as20476", "as8560", "as60781", "as20393",
    "as39699", "as12322"
]

# Load honeypot IP ranges
with open(HONEYPOT_LIST_FILE) as f:
    HONEYPOT_RANGES = json.load(f)

def is_in_honeypot_ranges(ip):
    """Check if IP is in one of the honeypot ranges."""
    for rng in HONEYPOT_RANGES:
        rng = rng.replace("*", "0")  # Rough wildcard conversion
        try:
            if ipaddress.ip_address(ip) in ipaddress.ip_network(rng + "/24", strict=False):
                return True
        except ValueError:
            continue
    return False

def is_vps_provider(ip):
    """Check IP with IPInfo for VPS/Dedicated hosting providers by org or ASN."""
    try:
        resp = requests.get(f"https://ipinfo.io/{ip}?token={IPINFO_TOKEN}").json()
        org = resp.get("org", "").lower()
        asn = resp.get("asn", "").lower()

        if any(prov in org for prov in BLACKLISTED_PROVIDERS):
            return True
        if any(asn_match in asn for asn_match in BLACKLISTED_ASNS):
            return True
    except requests.RequestException:
        pass
    return False

def fetch_banner(ip, port=23):
    """Connect and fetch the banner from a target IP and port."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((ip, port))
            return s.recv(1024).decode("utf-8", errors="ignore").strip()
    except (ConnectionRefusedError, OSError):
        return None

def is_honeypot(banner):
    """Check banner contents for honeypot keywords, common indicators, or email-like patterns."""
    if banner is None:
        return False
    banner_lower = banner.lower()
    if any(keyword in banner_lower for keyword in HONEYPOT_KEYWORDS):
        return True
    if DOMAIN_REGEX.search(banner):
        return True
    return False

def get_cidr(ip, mask=24):
    """Convert IP to CIDR range."""
    return str(ipaddress.ip_network(f"{ip}/{mask}", strict=False))

def scan_target(ip, suspected_ranges, legit_ranges):
    """Scan an IP for honeypot characteristics and banner consistency."""
    if is_in_honeypot_ranges(ip) or is_vps_provider(ip):
        range_24 = get_cidr(ip, 24)
        suspected_ranges.add(range_24)
        print(f"[!] {ip}: Blocked (Honeypot/VPS). Adding range {range_24}.")
        return

    banner1 = fetch_banner(ip)
    if banner1 is None:
        return
    if is_honeypot(banner1):
        range_24 = get_cidr(ip, 24)
        suspected_ranges.add(range_24)
        print(f"[!] {ip}: Honeypot detected (banner match). Adding range {range_24}.")
        return

    time.sleep(1)  # Wait briefly
    banner2 = fetch_banner(ip)

    if banner2 is None:
        return
    range_24 = get_cidr(ip, 24)
    if banner1 == banner2:
        suspected_ranges.add(range_24)
        print(f"[?] {ip}: Banner unchanged across connections — suspected honeypot. Adding range {range_24}.")
    else:
        legit_ranges.add(range_24)
        print(f"[+] {ip}: Port 23 open and banner changes. Likely legit. Adding range {range_24}")

def run_zmap(output_file, rate=1000):
    """Run ZMap to scan for open port 23 across the internet."""
    cmd = [
        "zmap",
        "--target-port=23",
        "--rate", str(rate),
        "--output-file", output_file,
        "--output-fields", "saddr"
    ]
    subprocess.run(cmd)

def main():
    output_file = "zmap_results.txt"

    print("[*] Running ZMap scan...")
    run_zmap(output_file)

    with open(output_file) as f:
        targets = [line.strip() for line in f]

    print(f"[*] Loaded {len(targets)} results from ZMap.")
    suspected_ranges = set()
    legit_ranges = set()

    with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
        for ip in targets:
            executor.submit(scan_target, ip, suspected_ranges, legit_ranges)

    # Export suspected honeypot ranges
    if suspected_ranges:
        with open("honeypots.txt", "w") as f:
            for range_24 in suspected_ranges:
                f.write(f"{range_24}\n")
        print("[*] Suspected honeypot ranges saved to honeypots.txt.")

    # Export legit ranges
    if legit_ranges:
        with open("realtelnet.txt", "w") as f:
            for range_24 in legit_ranges:
                f.write(f"{range_24}\n")
        print("[*] Legitimate telnet ranges saved to realtelnet.txt.")

if __name__ == "__main__":
    main()
