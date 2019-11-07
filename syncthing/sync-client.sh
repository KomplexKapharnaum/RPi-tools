#!/bin/bash
cd "$(dirname "$0")"

# COMMON API KEY
SYNC_API_KEY=$(cat key)
echo "common API key: $SYNC_API_KEY"

# CHECK IF SD HAS BEEN CLONED !
DRIVE=$(findmnt -n -o SOURCE --target /)
DRIVE_ID=$(udevadm info --name=$DRIVE | grep ID_SERIAL= | cut -d '=' -f2)
LAST_DRIVE_ID=$(cat /data/var/drive-id)

if [[ $DRIVE_ID == $LAST_DRIVE_ID ]]
        then
                echo "drive-id is valid"
        else
                echo "drive-id has changed, i am a clone !"
                rm -Rf /data/var/syncthing
                rm -Rf /data/sync
                echo $DRIVE_ID > /data/var/drive-id
fi

# Start syncthing with forced API-key
syncthing -home=/data/var/syncthing -gui-apikey="$SYNC_API_KEY" -gui-address=0.0.0.0:8384 > /var/log/syncthing-client
