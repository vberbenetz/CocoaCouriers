# Cocoa Couriers

### Maintenance & Upgrades

##### NodeJS
Use n to upgrade NodeJS. Choose the relevant command below to update Node on the server:
```
    sudo n latest
    sudo n lts
    sudo n X.X.X
```

### Networking & Firewall
#####

Allow NodeJS to listen on ports 80 and 443:
```
    sudo setcap cap_net_bind_service=+ep `readlink -f \`which node \``
```
