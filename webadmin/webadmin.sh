#!/bin/bash
cd "$(dirname "$0")"
avahi-publish-service 'WebAdmin' '_http._tcp.' 9000 &
php -S 0.0.0.0:9000 -t ./www/
