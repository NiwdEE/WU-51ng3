#include <unistd.h>
#include <stdio.h>

int main(){
    char* junk = "AAAAAAAA";
    printf("PWNING using junk: 0x");
    for(int i=0; i<8; i++){
        printf("%02x", 0xff & junk[i]);
    }
    printf("...\n");
    execve("/bin/bash", (char*[]){NULL}, (char*[]){NULL});
    printf("Mischief managed.");
    return 0;
}