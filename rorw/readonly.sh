#!/bin/bash
mount -o remount,ro / 
mount -o remount,ro /boot 
fs_mode=$(mount | sed -n -e "s/^.* on \/ .*(\(r[w|o]\).*/\1/p")
fs_mode_color=32m
export PS1='\[\033[01;$fs_mode_color\]\u@\h${fs_mode:+($fs_mode)}\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
