#!/bin/bash

#
# Get name from /boot/config.txt
# Set it as Hostname
#

name=rastapi
source /boot/config.txt
hostnamectl set-hostname "$name"
