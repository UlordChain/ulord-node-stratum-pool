# Ulord - Node Open Mining Portal


This is a Cryptohello mining pool based off of Node Open Mining Portal.

Usage
=====
#### Quick development guide

Please refer to [https://github.com/UlordChain/ulord-node-stratum-pool/wiki](https://github.com/UlordChain/ulord-node-stratum-pool/wiki), and you will know how to build a ulord-node-stratum-pool.

#### Start

```bash
git clone https://github.com/UlordChain/ulord-node-stratum-pool.git
```

#### Requirements
* [Coin daemon](https://github.com/UlordChain/UlordChain)(find the coin's repo and build latest version from source)
* [Node.js](http://nodejs.org/) v4.8.7 ([follow these installation instructions](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager))
* [Redis](http://redis.io/) key-value store v2.6+ ([follow these instructions](http://redis.io/topics/quickstart))

##### Seriously
Those are legitimate requirements. If you use old versions of Node.js or Redis that may come with your system package manager then you will have problems. Follow the linked instructions to get the last stable versions.


[**Redis security warning**](http://redis.io/topics/security): be sure firewall access to redis - an easy way is to
include `bind 127.0.0.1` in your `redis.conf` file. Also it's a good idea to learn about and understand software that
you are using - a good place to start with redis is [data persistence](http://redis.io/topics/persistence).


#### 0) Setting up coin daemon
Follow the build/install instructions for your coin daemon.Your ulord.conf file should end up looking something like this(you can find
this file at a dir named `.ulordcore`):
```
testnet=0
rpcuser=thgyrpc
rpcpassword=Thgy@123456
rpcworkqueue=160
txindex=1
addressindex=1
spentindex=1
timestampindex=1
reindex=0
maxconnections=20
```

#### 1) Downloading & Installing

Clone the repository and run `npm update` for all the dependencies to be installed:

```bash
sudo apt-get install build-essential libsodium-dev npm
sudo npm install n -g
sudo n 4.8.7
git clone https://github.com/UlordChain/ulord-node-stratum-pool.git ulord-node-stratum-pool
cd ulord-node-stratum-pool
npm update
```

##### 2) The overall configuration

You must change the daemon address to the same as the step 0 configuration. Note that there are two places to change. If your redis is configured with a password, modify it together.Configuration file located in `./config.json`.

```
{
    "logLevel": "debug",
    "logColors": true,
    
    "logging": {
        "auth": true,
        "files": {
            "level": "info",
            "directory": "logs",
            "flushInterval": 5
        }
        },

    "cliPort": 17117,
	// Manage the number of ore pool working threads.
    "clustering": {

        "enabled": true,

        // setting the number of ore pool working threads("auto",number),auto is the number of CPU cores and the number of threads.
        "forks": 4
    },

	// ulord pool general settings
    "defaultPoolConfigs": {

    	// The period during which new blocks are detected (millionseconds)
        "blockRefreshInterval":500,

        // Automatic re-broadcasting jobs (seconds) when new blocks are not acquired for how long
        "jobRebroadcastTimeout": 55,

        // Connect Timeout (seconds)
        "connectionTimeout": 900,

        // Records the hash value of the invalid block or not
        "emitInvalidBlockHashes": false,

        // Verify the validity of the address to the daemon
        "validateWorkerUsername": true,

        "tcpProxyProtocol": false,
        "banning": {
        	// Whether start banning abnormal users
            "enabled": true,
            // banlist duration for abnormal users
            "time": 600,
			
			// Bad shares of sample data (%)to trigger ban
            "invalidPercent": 50,

            //Length of sample data for each miner 
            "checkThreshold": 500,

            "purgeInterval": 300
        },

        // redis setting
        "redis": {
            "host": "127.0.0.1",
            "port": 6379,
            "password": ""
        },
		"security":{
			"rejectBlackCalc":false
		}	
    },

    "website": {
        "enabled": true,
        "host": "0.0.0.0",
        "port": 8080,
        "stratumHost": "cryppit.com",
		"balance":{
			"enabled":false,
			"threads":3
		},
        "stats": {

        	// Website backend data refresh time
            "updateInterval": 30,

			// History of hashrate data to record(both memberoy and redis)
            "historicalRetention": 14400,

            // sampling time for detect hashrate 
            "hashrateWindow": 300
        },
        "adminCenter": {
            "enabled": false,
            "password": "password"
        },
        "tlsOptions" : {
            "enabled": false,
            "cert": "/home/pool/ulord-node-stratum-pool/full_chain.pem",
            "key": "/home/pool/ulord-node-stratum-pool/private.key"
        }
    },
...

```

##### 3) Pool config

You can custom your configuration by modify file `pool_config/ulord.json`.The most important thing is to change pool address to yours.

```
{
    // Whether the configuration file is enabled
    "enabled": true,
    
    "coin": "ulord.json",

    // ulord pool address
    "address": "UVyowaoKXdm6YRrG5hHa9FUbqcFMBKhkX2",
    
    // Whether the pool verify the valid address
    "validateWorkerUsername": true,

    // Alternate address used when the payment module detects invalid address
    "invalidAddress": "UVyowaoKXdm6YRrG5hHa9FUbqcFMBKhkX2",

    "walletInterval": 1,
    "_comment_walletInterval": "Used to cache komodo coin stats, shielding not performed.",

    // Third party addresses for coinbase trade (%)
    "rewardRecipients": {
        "UfnWACyM4CeWQawhGAm8MotcMNWRPhLJyK": 1.0
    },

    "tlsOptions": {
        "enabled": false,
        "serverKey":"",
        "serverCert":"",
        "ca":""
    },

    "paymentProcessing": {
    "minConf": 10,
        // Weather enabled payments modules
        "enabled": true,
        
        "paymentMode": "pplnt",
        
        // Interval in seconds to check and perform payments.
        "paymentInterval":14400 ,
        
        // The minimum amount of transaction per transaction.Waitting for enough amount to perform payments.
        "minimumPayment": 0.1,
          
        // daemon setting for payments modules
        "daemon": {
            "host": "127.0.0.1",
            "port": 9889,
	        "user": "",
	        "password": ""
        }
    },
    
    // mining ports setting
    "ports": {
        "13333": {
            "tls":false,
            // Initialization difficulty value for this port
            "diff": 0.2,
            "varDiff": {
                
                "minDiff": 0.04,
                
                "maxDiff": 16,
                
                // Submission time interval to be achieved(seconds)
                "targetTime": 15,
                
                // Time interval of adjusting difficulty(seconds)
                "retargetTime": 60,
                "variancePercent": 30
            }
        }
    },
    
    // daemon settings
    "daemons": [
	{   
            "host": "127.0.0.1",
            "port": 9889,
	        "user": "",
	        "password": ""
        }
    ],

    ...

}
```
Please Note that: 1 Difficulty is actually 8192, 0.125 Difficulty is actually 1024.

Whenever a miner submits a share, the pool counts the difficulty and keeps adding them as the shares. 

ie: Miner 1 mines at 0.1 difficulty and finds 10 shares, the pool sees it as 1 share. Miner 2 mines at 0.5 difficulty and finds 5 shares, the pool sees it as 2.5 shares. 


#### 4) Start the portal

```bash
npm start
```

###### Optional enhancements for your awesome new mining pool server setup:
* Use something like [forever](https://github.com/nodejitsu/forever) to keep the node script running
in case the master process crashes. 
* Use something like [redis-commander](https://github.com/joeferner/redis-commander) to have a nice GUI
for exploring your redis database.
* Use something like [logrotator](http://www.thegeekstuff.com/2010/07/logrotate-examples/) to rotate log 
output from Z-NOMP.
* Use [New Relic](http://newrelic.com/) to monitor your Z-NOMP instance and server performance.

#### Upgrading Z-NOMP
Our bitcoin ulord pool based on Z-nomp. When updating Z-NOMP to the latest code its important to not only `git pull` the latest from this repo, but to also update
the `node-stratum-pool` and `node-multi-hashing` modules, and any config files that may have been changed.
* Inside your Z-NOMP directory (where the init.js script is) do `git pull` to get the latest Z-NOMP code.
* Remove the dependenices by deleting the `node_modules` directory with `rm -r node_modules`.
* Run `npm update` to force updating/reinstalling of the dependencies.
* Compare your `config.json` and `pool_configs/coin.json` configurations to the latest example ones in this repo or the ones in the setup instructions where each config field is explained. <b>You may need to modify or add any new changes.</b>


Credits
-------
### Z-NOMP
* [Joshua Yabut / movrcx](https://github.com/joshuayabut)
* [Aayan L / anarch3](https://github.com/aayanl)
* [hellcatz](https://github.com/hellcatz)

### NOMP
* [ZyanWlayor / UlordChain](https://github.com/UlordChain/) - Ulord
* [Jerry Brady / mintyfresh68](https://github.com/bluecircle) - got coin-switching fully working and developed proxy-per-algo feature
* [Tony Dobbs](http://anthonydobbs.com) - designs for front-end and created the NOMP logo
* [LucasJones](//github.com/LucasJones) - got p2p block notify working and implemented additional hashing algos
* [vekexasia](//github.com/vekexasia) - co-developer & great tester
* [TheSeven](//github.com/TheSeven) - answering an absurd amount of my questions and being a very helpful gentleman
* [UdjinM6](//github.com/UdjinM6) - helped implement fee withdrawal in payment processing
* [Alex Petrov / sysmanalex](https://github.com/sysmanalex) - contributed the pure C block notify script
* [svirusxxx](//github.com/svirusxxx) - sponsored development of MPOS mode
* [icecube45](//github.com/icecube45) - helping out with the repo wiki
* [Fcases](//github.com/Fcases) - ordered me a pizza <3
* Those that contributed to [node-stratum-pool](//github.com/UlordChain/node-stratum-pool#credits)


License
-------
Released under the MIT License. See LICENSE file.

