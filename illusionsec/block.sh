#!/bin/bash
s="blocked_ips"
l=100
sudo ipset destroy $s &>/dev/null
sudo ipset create $s hash:ip
sudo iptables -D INPUT -m set --match-set $s src -j DROP &>/dev/null
sudo iptables -I INPUT -m set --match-set $s src -j DROP
while :; do
  ss -tn state established | awk '{print $5}' | cut -d':' -f1 | sort | uniq -c | sort -nr | while read c ip; do
    [[ $c -ge $l && $ip != "address" ]] && ! ipset test $s $ip &>/dev/null && sudo ipset add $s $ip
  done
  sleep 5
done