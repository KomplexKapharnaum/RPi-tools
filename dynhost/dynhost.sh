#!/bin/bash

#
# Get name from /boot/config.txt
# Set it as Hostname
#

name=rastapi
source /boot/config.txt
echo "[RPi-tools/dynhost] RastaPi name: $name"

if [[ $(< /etc/hostname) != "$name" ]]; then
	cd "$(dirname "$0")/.."
	./rorw/readwrite.sh
	echo $name | tee /etc/hostname
	sed -i -E 's/^127.0.1.1.*/127.0.1.1\t'"$name"'/' /etc/hosts
	sed -i -E 's/^ssid=.*/ssid='"$name"'/' /etc/NetworkManager/system-connections/hotspot-wlan0.nmconnection
	hostnamectl set-hostname "$name"
	./rorw/readonly.sh
	systemctl restart avahi-daemon
	systemctl restart NetworkManager
	echo "[RPi-tools/dynhost] hostname changed to $name"    
else
	echo "[RPi-tools/dynhost] hostname already set as $name"    
fi
