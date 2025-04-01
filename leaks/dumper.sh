interface=eth0
dumpdir=/root

while /bin/true; do
  pkt_old=`grep $interface: /proc/net/dev | cut -d :  -f2 | awk '{ print $2 }'`
  sleep 1
  pkt_new=`grep $interface: /proc/net/dev | cut -d :  -f2 | awk '{ print $2 }'`

  pkt=$(( $pkt_new - $pkt_old ))
  echo -ne " \r$pkt [40;35mpackets/s [40;37m| IP: [40;35m51.89.223.4 [40;37m| [40;35mWatching dem packets on [40;37m$interface [40;37m| \033[0K"

   if [ $pkt -gt 1500 ]; then
    echo -e "\n`date` Attack detected Gathering Info"
  dateinfo=`date +"%d-%m-%y-%H:%M:%S"`
    tcpdump -n -s0 -c 5000 -w $dumpdir/TCPDUMP/pcap/capture.$dateinfo.pcap
  tshark -r /root/TCPDUMP/pcap/capture.$dateinfo.pcap -T fields -e ip.src > /root/TCPDUMP/report/attackingips.$dateinfo.txt
  tshark -r /root/TCPDUMP/pcap/capture.$dateinfo.pcap -T fields -e ip.src > /root/TCPDUMP/nigga/hookinfo.txt
  tshark -r /root/TCPDUMP/pcap/capture.$dateinfo.pcap -T fields -e dns.qry.name > /root/TCPDUMP/extra/dns_Query.$dateinfo.txt
  tshark -r /root/TCPDUMP/pcap/capture.$dateinfo.pcap -T fields -e ip.proto > /root/TCPDUMP/extra/protos.txt
  tshark -r /root/TCPDUMP/pcap/capture.$dateinfo.pcap -T fields -e ip.src > /root/TCPDUMP/extra/sortingip.txt
  sort /root/TCPDUMP/extra/sortingip.txt | uniq > /root/TCPDUMP/extra/sortedip.txt
  sort /root/TCPDUMP/extra/protos.txt | uniq > /root/TCPDUMP/extra/sortedproto.txt
  sort /root/TCPDUMP/nigga/hookinfo.txt | uniq > /root/TCPDUMP/nigga/infoforfing.txt
    echo "[40;31m╔═════════════════════════════════╗"
    echo "        [40;34mAttack Captured             " 
    echo "[40;35mDump Name [40;37m> [40;37m[[40;35mcapture.$dateinfo.pcap[40;37m]"
    echo "[40;35mReport Name [40;37m> [40;37m[[40;35mattackingips.$dateinfo.txt[40;37m]"
    echo "[40;35mPackets Per Second [40;37m> [40;37m[[40;35m$pkt[40;37m]         " 
    echo "[40;35mAttack Details Will Be Sent To Discord Webhook"
    echo "[40;31m╚═════════════════════════════════╝[40;37m "

  tshark -r $dumpdir/TCPDUMP/pcap/capture.$dateinfo.pcap -T fields -E header=y -e ip.proto -e tcp.flags -e udp.srcport -e tcp.srcport -e data > /root/TCPDUMP/info/$dateinfo.txt
  python3 webhook.py /root/TCPDUMP/info/$dateinfo.txt
    sleep 95  && pkill -HUP -f /usr/sbin/tcpdump
  fi
done
