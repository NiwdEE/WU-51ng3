#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>

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

    system("/home/user/vmchecker/pwnme.sh");

    return 0;
}
