
# EXECUTE this on the main introducer

# TODO:
# catch requests errors and add retry (instead of time.sleep)

from syncthing import Syncthing
from xml.dom import minidom
import sys, time
import os.path
import requests
import subprocess

# Basepath
basepath = os.path.dirname(os.path.realpath(__file__))

# Start local client
syncClient = subprocess.Popen([ os.path.join( basepath, 'sync-client.sh') ])
time.sleep(5)

# get common API key
with open(os.path.join( basepath, 'key'), 'r') as theFile:
    apikey = theFile.read()

# get API key form config.xml
confpath = '/data/var/syncthing/config.xml'
if not os.path.exists(confpath):
    print('Can\'t find config file',confpath)
    syncClient.terminate()
    exit(1)
mydoc = minidom.parse(confpath)
localkey = mydoc.getElementsByTagName('apikey')[0].firstChild.nodeValue


# REST connect
def connect(ip):
    # start local link
    m = Syncthing(apikey)
    m.system.connections()

    # check for errors
    if m.system.errors():
        for e in m.system.errors():
            print(e)
    m.system.clear()

    return m

# LOCAL connect
LOCAL = connect('127.0.0.1')

# SERVER configuration
# compare Common key and Local key => if different, server must be reconfigured !
if localkey != apikey:
    print("This device was not configured as a Sync Server.. ")
    print("Configuring now.")

    subprocess.run(["mkdir", "-p", "/data/sync"])

    config = LOCAL.system.config()

    # SYNC folder
    config['folders'] = [{
        'id': 'sync-uuid',
        'label': 'sync',
        'filesystemType': 'basic',
        'path': '/data/sync',
        'type': 'sendreceive',
        'devices': [{ 'deviceID': LOCAL.system.status()['myID'], 'introducedBy': '' }],
        'rescanIntervalS': 3600, 'fsWatcherEnabled': True, 'fsWatcherDelayS': 10, 'ignorePerms': False, 'autoNormalize': True, 'minDiskFree': { 'value': 5, 'unit': '%' }, 'versioning': { 'type': '', 'params': {} }, 
        'copiers': 0, 'pullerMaxPendingKiB': 0, 'hashers': 0, 'order': 'random', 'ignoreDelete': False, 'scanProgressIntervalS': 0, 'pullerPauseS': 0, 'maxConflicts': -1, 'disableSparseFiles': False, 'disableTempIndexes': False, 'paused': False, 'weakHashThresholdPct': 25, 'markerName': '.stfolder', 'useLargeBlocks': True, 'copyOwnershipFromParent': False
    }]

    # DEVICES me only
    # me = None
    # for dev in config['devices']:
    #     if dev['deviceID'] == LOCAL.system.status()['myID']:
    #         me = dev
    # config['devices'] = [me] if me else []
    config['devices'] = []

    # GUI
    config['gui']['address'] = '0.0.0.0:8384'
    config['gui']['apiKey'] = apikey
    config['gui']['insecureAdminAccess'] = True
    config['gui']['theme'] = 'dark'

    # OPTIONS
    config['options']['globalAnnounceEnabled'] = False
    config['options']['relaysEnabled'] = False
    config['options']['startBrowser'] = False
    config['options']['natEnabled'] = False
    config['options']['urAccepted'] = -1
    config['options']['overwriteRemoteDeviceNamesOnConnect'] = True
    config['options']['defaultFolderPath'] = '/data'

    print("Applying Server conf.")
    LOCAL.system.set_config(config, True)
    time.sleep(5)
    LOCAL = connect('127.0.0.1')

else:
    print("This machine is properly configured as a local Sync server")


# REMOTE client configuration
def autoconfremote(ip):

    # wait for device to get ready (avoid Conn refused)
    time.sleep(6)

    # remote link
    try:
        r = connect(ip)

        # get remote config
        rconfig = r.system.config()

        # detect that it's a fresh install
        if len(rconfig['folders']) == 1 and rconfig['folders'][0]['id'] == 'default':

            # remove default folder and devices
            del rconfig['folders']

            # add self as introducer
            introducer = {}
            introducer['deviceID']       = LOCAL.system.status()['myID']
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
event_stream = LOCAL.events(limit=10)
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
        config = LOCAL.system.config()

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
                
        LOCAL.system.set_config(config)
                
    
