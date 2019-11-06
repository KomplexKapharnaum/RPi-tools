#!/bin/bash

# CHECK IF SD HAS BEEN CLONED !
SD_ID=$(udevadm info --name=/dev/mmcblk0 | grep ID_SERIAL | cut -d '=' -f2)
CURRENT_SD_ID=$(cat /data/var/sd-id)
if [[ $SD_ID == $CURRENT_SD_ID ]]
        then
                echo "sd-id is valid"
        else
                echo "sd-id has changed, i am a clone !"
                rm -Rf /data/var/syncthing
                rm -Rf /data/sync
                mkdir /data/sync
                echo $SD_ID > /data/var/sd-id
fi

# Start syncthing with forced API-key
syncthing -home=/data/var/syncthing -gui-apikey=rastaKEY-unsecure
