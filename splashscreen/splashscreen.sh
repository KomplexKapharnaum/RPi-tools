#!/bin/bash
/usr/bin/fbi -d /dev/fb0 --noverbose -a /root/RPi-tools/splashscreen/splash.png &
sleep 10
/usr/bin/fbi -d /dev/fb0 --noverbose -a /root/RPi-tools/splashscreen/black.png
