#define _GNU_SOURCE
#include <grp.h>
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>

int main(int argc, char **argv)
{
    if (setgroups(0, NULL) != 0) {
        perror("setgroups");
        return 1;
    }

    if (setresgid(0, 0, 0) != 0) {
        perror("setresgid");
        return 1;
    }

    if (setresuid(0, 0, 0) != 0) {
        perror("setresuid");
        return 1;
    }

    char *argv_[] = { "pwnme.sh", NULL };
    char *envp[] = { NULL };
    execve("/home/user/vmchecker/pwnme.sh", argv_, envp);

    return 0;
}
