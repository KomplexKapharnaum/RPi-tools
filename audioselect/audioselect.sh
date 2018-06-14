#!/bin/bash

audio=auto
source /boot/config.txt

if [ $audio = "hdmi" ]; then
   amixer cset numid=3 2
elif [ $audio = "jack" ]; then
   amixer cset numid=3 1
else
  amixer cset numid=3 0
fi

amixer set PCM -- 96%
