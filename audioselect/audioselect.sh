#!/bin/bash

audio=auto
source /boot/config.txt

current_card=$(cat /etc/asound.conf | grep card -m1 | awk -F ' ' '{print $2}')

if [ $audio = "usb" ]; then
    if [[ "$current_card" != "1" ]]; then
        cd "$(dirname "$0")/.."
	    ./rorw/readwrite.sh
        sed -i 's/card 0/card 1/g' /etc/asound.conf
        ./rorw/readonly.sh
        echo "Audio USB selected"
    else
        echo "Audio already set to USB"
    fi
    amixer set Speaker -- 80%
else
    if [[ "$current_card" != "0" ]]; then
        cd "$(dirname "$0")/.."
	    ./rorw/readwrite.sh
        sed -i 's/card 1/card 0/g' /etc/asound.conf
        ./rorw/readonly.sh
        echo "Audio INTERNAL selected"
    else
        echo "Audio already set to INTERNAL"
    fi
    if [ $audio = "hdmi" ]; then
       amixer cset numid=3 2
    elif [ $audio = "jack" ]; then
       amixer cset numid=3 1
    else
      amixer cset numid=3 0
    fi
    amixer set PCM -- 96%
fi


