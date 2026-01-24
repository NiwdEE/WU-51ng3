#!/bin/bash

# I'm so sorry to write this shit code ... I'm not a good developer.
# If you try to fix it, you'll probably break something else.
# Please increment the time of hours wasted on this project.
# Time: 89 hours

PATH=$(/usr/bin/getconf PATH 2>/dev/null || /bin/kill $$)

if [[ "$(pwd)" != "/home/user/vmchecker" ]]; then
    echo "Error: you must run this script from /challenge"
    exit 1
fi


while true; do
    echo -n "Enter the input: "
    read -r input

    case "$input" in
        1)
            # This part is totaly insecure and vulnerable to bypass. fix it please.
            i=0
            for p in /proc/[0-9]*; do
                name=$(tr '\0' ' ' < "$p/cmdline" | sed 's/ *$//')
                if [[ -z "$name" ]]; then
                    echo "Error: process $p has no name"
                    i=$((i+1))
                    continue
                fi
                # Luckily it's protected, otherwise Benjamin, you're fired.
                if [[ "$name" == *['*''/''(''{''['' ''-''=''s''h']*  ]]; then
                    echo "Error: unsafe process name detected. for process $p"
                    i=$((i+1))
                    continue
                fi
                awk "$name" "$p/status" < /dev/null 2>/dev/null
                if [[ $? -ne 0 ]]; then
                    echo "Error: suspicious mapping detected. for process $p"
                    i=$((i+1))
                    continue
                fi
            done
            if [[ $i -eq 0 ]]; then
                echo "[-] no unsafe process name or suspicious mapping detected"
            else
                echo "[-] $i unsafe process name or suspicious mapping detected. Check before push in production"
            fi
            ;;
        2)
            # Benjamin can you please fix the fucking code ... I SPAMMED YOU
            # I'm not sure if you're a genius or a dumbass, but you're definitely not a good developer.
            # You're a fucking idiot. Remove the option 2 or make it more secure.
            echo "cleaning up..."
            rm -rf /tmp/proc_*
            for p in /proc/[0-9]*; do
                cgroup="$p/cgroup"
                maps=$(awk "$cgroup" "$p/maps" &> /dev/null)
                if [[ $? -ne 0 ]]; then
                    /bin/bash -c "echo 'Error: cgroup not found for cgroup: $cgroup' > /dev/null 2>&1" < /dev/null
                    continue
                fi
            done
            echo "[-] cleaning up done"
            ;;
        3)
            # Nice dead code man ... you're a fucking idiot.
            ;;
        *)
            echo "Invalid input" 
            ;;
    esac
done
