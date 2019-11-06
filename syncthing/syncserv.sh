
#!/usr/bin/env python3

# EXECUTE this on the main introducer

# TODO:
# catch requests errors and add retry (instead of time.sleep)

from syncthing import Syncthing
from xml.dom import minidom
import sys, time
import os.path
import requests

# get API key
if len(sys.argv) < 2:
    print('Usage: syncserv path/to/config.xml')
    exit(1)
confpath = sys.argv[1]
if not os.path.exists(confpath):
    print('Can\'t find config file',confpath)
    exit(1)
mydoc = minidom.parse(confpath)
apikey = mydoc.getElementsByTagName('apikey')[0].firstChild.nodeValue

# start local link
s = Syncthing(apikey)
s.system.connections()

# check for errors
if s.system.errors():
    for e in s.system.errors():
        print(e)
s.system.clear()


def autoconfremote(ip):

    # wait for device to get ready (avoid Conn refused)
    time.sleep(6)

    # remote link
    try:
        r = Syncthing(apikey, host=ip)
        r.system.connections()
    
        # check for errors
        if r.system.errors():
            for e in r.system.errors():
                print('\t', e[1])
        r.system.clear()

        # get remote config
        rconfig = r.system.config()

        # detect that it's a fresh install
        if len(rconfig['folders']) == 1 and rconfig['folders'][0]['id'] == 'default':

            # remove default folder and devices
            del rconfig['folders']

            # add self as introducer
            introducer = {}
            introducer['deviceID']       = s.system.status()['myID']
            introducer['name']           = 'Introducer'
            introducer['addresses']      = ['dynamic']
            introducer['compression']    = 'metadata'
            introducer['certName']       = ''
            introducer['introducer']     = True
            introducer['autoAcceptFolders'] = True
            rconfig['devices'].append(introducer)

            # customize options
            rconfig['options']['globalAnnounceEnabled'] = False
            rconfig['options']['relaysEnabled'] = False
            rconfig['options']['startBrowser'] = False
            rconfig['options']['natEnabled'] = False
            rconfig['options']['urURL'] = ''
            rconfig['options']['overwriteRemoteDeviceNamesOnConnect'] = True
            rconfig['options']['defaultFolderPath'] = '/data'
            rconfig['options']['crashReportingEnabled'] = False

            # fix access (or restart will loose it)
            rconfig['gui']['address'] = '0.0.0.0:8384'
            rconfig['gui']['apikey'] = apikey
                            
            print('Fresh device configured:', event['data']['device'])
            r.system.set_config(rconfig)
            r.system.reset()

    except requests.exceptions.ConnectionError as e:
        print('requests end')

    except requests.exceptions.ConnectionError as e:
        print('conn refused')
        return False

    except Exception as e:
        print('another error', e)

    return True


#
# RUN
#
# watch for new node !
event_stream = s.events(limit=10)
for event in event_stream:

    # log events
    if event['type'].startswith('Device') and 'device' in event['data']:
        print(event['type'], event['data']['device'])
    else:
        print(event['type'])

    #
    # Check if remote device is properly set up
    #
    if event['type'] == 'DeviceDiscovered':

        # detect devic ip4
        ip = None
        for addr in event['data']['addrs']:
            adip = addr.split('tcp://')
            if len(adip) == 2 and adip[1][0].isdigit():
                ip = adip[1].split(':')[0]
                break
        
        if ip:
            autoconfremote(ip)


    #
    # Register unknown remote device 
    #
    elif event['type'] == 'DeviceRejected':
        config = s.system.config()

        newDevice = {}
        newDevice['deviceID']       = event['data']['device']
        newDevice['name']           = event['data']['name']
        newDevice['addresses']      = ['dynamic']
        newDevice['compression']    = 'metadata'
        newDevice['certName']       = ''
        newDevice['introducer']     = False
        config['devices'].append(newDevice)
        print('Add new device:', event['data']['device'], event['data']['name'])
        
        # auto share folders
        for f in config['folders']:
            addMe = True
            for d in f['devices']:
                if d['deviceID'] == event['data']['device']:
                    addMe = False
                    break
            if addMe:
                f['devices'].append({'deviceID':event['data']['device']})
                print('Share folder', f['label'], 'with', event['data']['name'])
                
        s.system.set_config(config)
                
    
