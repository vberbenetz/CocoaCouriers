# Cocoa Couriers

## Installation and Deployment
If in cluster mode, deploy to an instance that has enough resources to support at least 200MB x NUMBER_OF_CORES

## Maintenance & Upgrades

#### NodeJS
Use n to upgrade NodeJS. Choose the relevant command below to update Node on the server:
```
    sudo n latest
    sudo n lts
    sudo n X.X.X
```


## Networking & Firewall
#####

Allow NodeJS to listen on ports 80 and 443:
```
    sudo setcap cap_net_bind_service=+ep `readlink -f \`which node \``
```

## Operation

#### Start, Stop, Restart
PM2 is used to run the server. This service makes sure the app has 0 downtime and is always available.
Additionally, it provides the ability to "cluster" the app (spread it across all available CPU cores).
Start the server with the following command (navigate to root of project directory):
```
    pm2 start cocoacouriers_server.js -i max
```
The -i flag runs it in cluster mode, and max specifies to spread it across all CPUs.
Can also be set to a positive integer of available CPUs.

Restart should not be used in cluster mode. User Reload instead:
```
    pm2 reload cocoacouriers_server.js
```
This makes sure to not forcefully kill any of the clustered applications.
