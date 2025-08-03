import requests
import threading
from termcolor import colored
import os
import random
import sys
import time
import os, concurrent.futures, time, threading, random, string, json, ctypes, sys
import requests, colorama, pystyle, datetime
from pystyle import Write, System, Colors, Colorate, Anime
from colorama import Fore, Style
from datetime import datetime
from aiohttp_socks import ProxyConnector, ProxyType
red = Fore.RED
yellow = Fore.YELLOW
green = Fore.GREEN
blue = Fore.BLUE
orange = Fore.RED + Fore.YELLOW
pretty = Fore.LIGHTMAGENTA_EX + Fore.LIGHTCYAN_EX
magenta = Fore.MAGENTA
lightblue = Fore.LIGHTBLUE_EX
cyan = Fore.CYAN
gray = Fore.LIGHTBLACK_EX + Fore.WHITE


dark_green = Fore.GREEN + Style.BRIGHT
pink = Fore.MAGENTA
green = Fore.GREEN
reset = Style.RESET_ALL
output_lock = threading.Lock()
def get_time_rn():
    date = datetime.now()
    hour = date.hour
    minute = date.minute
    second = date.second
    timee = "{:02d}:{:02d}:{:02d}".format(hour, minute, second)
    return timee
def clear():
    os.system("cls" if os.name == "nt" else "clear")

class ProxyInfo:
    def __init__(self, proxy):
        self.proxy = proxy
        self.location = None
        self.type = None
        self.response_time = None

    def determine_location(self):
        try:
            response = requests.get('https://ipinfo.io/json', proxies={"http": self.proxy, "https": self.proxy}, timeout=5)
            self.location = response.json().get("country", "NO")
            return True
        except:
            self.location = "NO"
            return False

    def determine_type(self):
        types = ["http", "https"]
        for t in types:
            try:
                response = requests.get("http://judge1.api.proxyscrape.com/","http://judge2.api.proxyscrape.com/","http://judge3.api.proxyscrape.com/","http://judge4.api.proxyscrape.com/","http://www.google.com","https://www.facebook.com/","https://www.youtube.com/", proxies={t: self.proxy}, timeout=5)
                if response.status_code == 200:
                    self.type = t.upper()
                    return
            except:
                pass
        self.type = "NO"

    def measure_response_time(self):
        try:
            response = requests.get("http://judge1.api.proxyscrape.com/","http://judge2.api.proxyscrape.com/","http://judge3.api.proxyscrape.com/","http://judge4.api.proxyscrape.com/","http://www.google.com","https://www.facebook.com/","https://www.youtube.com/", proxies={"http": self.proxy, "https": self.proxy}, timeout=5)
            self.response_time = response.elapsed.total_seconds()
        except:
            self.response_time = float('inf')

    def get_info(self):
        is_live = self.determine_location()
        if is_live:
            self.determine_type()
            self.measure_response_time()
        return is_live
from colorama import Fore, Back, Style, init
init(autoreset=True)


def check_live_proxies(filename, num_threads):
    live_proxies = {"HTTP": [], "HTTPS": [], "NO": []}
    printed_count = 0
    def check_proxy_thread(proxy):
        nonlocal printed_count
        proxy_info = ProxyInfo(proxy)
        if proxy_info.get_info(): 
            live_proxies[proxy_info.type].append(proxy_info.proxy)
            printed_count += 1
            total = printed_count
            time_rn = get_time_rn()
            print(f"\x1b[38;5;255m[ \x1b[38;5;160mCountry : \x1b[38;5;255m{proxy_info.location}{reset} \x1b[38;5;255m] \x1b[38;5;160m| \x1b[38;5;255m(\x1b[38;5;160mTotal : \x1b[38;5;255m{total}{reset}) \x1b[38;5;255m{pretty}\x1b[38;5;160mProxy --> \x1b[38;5;255m{proxy}{Fore.RESET}")
    with open(filename, "r") as file:
        proxies = file.readlines()

    threads = []
    for proxy in proxies:
        proxy = proxy.strip()
        thread = threading.Thread(target=check_proxy_thread, args=(proxy,))
        thread.start()
        threads.append(thread)
        if len(threads) >= num_threads:
            for thread in threads:
                thread.join()
            threads = []

    for thread in threads:
        thread.join()

    with open("live.txt", "w") as file:
        for t, proxies in live_proxies.items():
            for proxy in proxies:
                file.write(proxy + "\n")
                
    with open("live.txt", "r") as f:
        lines = f.read().splitlines()

    print("\x1b[38;5;160mTotal proxies live:\x1b[38;5;255m", len(lines))
    print("\x1b[38;5;160mSaved as \x1b[38;5;255mlive.txt")

def typing_effect(text, speed=0.05):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(speed + random.uniform(-0.02, 0.02))
    print()

if __name__ == "__main__":
    try:
        time.sleep(1.5)
        clear()
        typing_effect("TERRORIST | Enter proxy file to check, normal: needtocheck.txt")
        filename = input("\x1b[38;5;160m> \x1b[38;5;255m")
        num_threads = 22222
        os.system("cls" if os.name == "nt" else "clear")
        check_live_proxies(filename, num_threads)
    except KeyboardInterrupt:
        time.sleep(1)
        exit()
