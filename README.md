# Ulord - Node Open Mining Portal


This is a Cryptohello mining pool based off of Node Open Mining Portal.


####0. Optimize the front-end module

We have updated the master branch on the front part of the updated part includes/libs/web. Js, / libs/apiEx js, / web.

Where /libs/web.js and /libs/apiEx.js redefine the logic of the API part and achieve front-end separation.The files under the web folder are static files on the front end packaged using react.js.

After the web module optimization is removed, it is stable enough that there is no need to use multiple processes to increase stability

####1. Enforce cli commands

We have enhanced the cli command for the mine pool, which can be used to interfere with the operation of the mine pool without restarting the pool.

######Usage: execute node ./scripts/cli.js [command] [param1] [param2]

The cli command currently supported is as follows:

1) getConnectios: query the real number of mining machines under this address (there may be an error, but the error is not large, considering the situation of reconnection), examples: The node cli.js getConnections UbHPPtzVu37yfuVvm1jKTozkkyGQDHKpYz. This command will be generated under the logs folder UbHPPtzVu37yfuVvm1jKTozkkyGQDHKpYz two log files. The log and UbHPPtzVu37yfuVvm1jKTozkkyGQDHKpYz_moniter log, respectively record the number of mill on the address of each process and delivery address of shares.

2) addBlackMember: block the share submission under this address. When you think there is a ghost miner, this is your weapon. Example: the node cli.js addBlackMember UbHPPtzVu37yfuVvm1jKTozkkyGQDHKpYz.

3) removeBlackMember: remove the address from the blacklist. The node cli.js removeBlackMember UbHPPtzVu37yfuVvm1jKTozkkyGQDHKpYz.

In the development...

####2.Remove some old apis

We removed some old methods that might cause problems that were previously used to interact with cpumulti.
