FROM debian:bookworm-slim

# Install required packages
RUN apt-get update && apt-get install --no-install-recommends -y \
        openssh-server \
        openssl \
        gawk iproute2 \
        gcc build-essential \
        nano vim bash \
        && rm -rf /var/lib/apt/lists/*

########################
#### USER ACCOUNTS #####
########################

# Create user (player) with password "user"
RUN useradd -m -s /bin/bash user && \
    echo "user:user" | chpasswd


########################
###### SSH CONFIG ######
########################

RUN mkdir -p /var/run/sshd

# Enable password auth
RUN sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    sed -i 's/^#PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -i 's/^#Port 22/Port 2222/' /etc/ssh/sshd_config

EXPOSE 2222


########################
###### CHALLENGE #######
########################
WORKDIR /home/user/vmchecker/

COPY --chown=root:root --chmod=755 pwnme.sh /home/user/vmchecker/pwnme.sh

COPY wrapper.c /tmp/wrapper.c

# Compile wrapper as admin-owned SUID binary
RUN gcc /tmp/wrapper.c -o /home/user/vmchecker/pwnme && \
    chown root:root /home/user/vmchecker/pwnme && \
    chmod 4755 /home/user/vmchecker/pwnme && \
    rm /tmp/wrapper.c

# Write flag
COPY --chown=root:root --chmod=740 flag.txt /root/flag.txt

RUN mkdir -p /root/smell_like_a_flag/

RUN mv /root/flag.txt /root/smell_like_a_flag/flag$(head -c 16 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 32)

RUN chown root:root /home/user/vmchecker && \
    chmod 740 -R /root

########################
######## CMD ###########
########################

# Start only SSH server
CMD ["/usr/sbin/sshd", "-D"]