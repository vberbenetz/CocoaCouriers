# Cocoa Couriers

## Installation and Deployment
If in cluster mode, deploy to an instance that has enough resources to support at least 200MB x NUMBER_OF_CORES

#### Applications
**Imporant - Must intstall Node version 5.0.0 or higher due to use of ES6 version of JS**
Install NodeJS, npm, git, pm2, and mysql:
```
  sudo apt-get update

  sudo apt-get install nodejs
  sudo ln -s /usr/bin/nodejs /usr/bin/node

  sudo apt-get install npm
  sudo npm install pm2 -g
  
  sudo apt-get install git
  
  sudo apt-get update
  sudo apt-get install mysql-server
  
  sudo mysql_install_db
  sudo /usr/bin/mysql_secure_installation
```

#### Database Setup
Import database included in this code base:
```
  mysql -u <username> -p <databasename> < <filename.sql>
```

#### Redis Install and Setup
Redis is required for session management.
1) Get the latest version of redis:
```
  sudo mkdir /etc/redis
  sudo mkdir /var/redis

  sudo cp utils/redis_init_script /etc/init.d/redis_6379
  sudo cp redis.conf /etc/redis/6379.conf
  sudo mkdir /var/redis/6379
```

2) Edit the configuration file /etc/redis/6379.conf:
```
  Set daemonize to yes
  Set pidfile to /var/run/redis_6379.pid
  Uncomment bind 127.0.0.1      (Only allow localhost access)
  Set the logfile to /var/log/redis_6379.log
  Set the dir to /var/redis/6379
```
3) Add new Redis init script to all default run levels
```
  sudo update-rc.d redis_6379 defaults
```
4) Reboot server and test if Redis server works by pinging the server.
```
  redis-cli
  ping
```

#### Deployment of Site
1) Create web folder, pull tagged release from repository (or unzip code), install all packages, and create log folder:
```
  mkdir /www/cocoacouriers
  git pull
  git checkout x.x.x.release
  npm install
  mkdir /www/cocoacouriers/logs
```

2) Create new configuration file named ***config_priv.js*** in the ***/app/configuration*** folder to store API keys and other configurable items:
```
'use strict';

var configPriv = {
    
        env: 'PROD',

        ssl: {
            key: '/etc/ssl/localcerts/cocoacouriers.key',
            cert: '/etc/ssl/localcerts/cocoacouriers.crt',
            ca: {
                root: '/etc/ssl/certs/AddTrust_Public_Services_Root.pem',
                int1: '/etc/ssl/certs/AddTrust_Public_Services_Root.pem',
                int2: '/etc/ssl/certs/AddTrust_Public_Services_Root.pem'
            },
            passphrase: 'MY_PASSPHRASE'
        },

        session: {
            redis: {
                host: '127.0.0.1',
                port: 6379
            },
            resave: false,
            saveUninitialized: false,
            sessionKey: 'MY_SESSION_KEY_RANDOM_STRING'
        },

        cookie: {
            secret: 'MY_RANDOM_COOKIE_SECRET'
        },
        
        mysqlConfig: {
            connectionLimit: 50,
            host: 'localhost',
            port: 3306,
            user: 'cocoacouriersuser',
            password: 'cocoacocoacouriersuser',
            database: 'cocoacouriers'
        },

        // STRIPE RELATED
        stPubKey: 'pk_test_q1w2e3r4t5y6u7i8o9p0',
        sKey: 'sk_test_q1w2e3r4t5y6u7i8o9p0',
        
        // SendGrid
        sendGridKey: 'SG.asdfasdfasdf.qweqweqweqweqwe'
    };
    
module.exports = configPriv;
```

3) Create product images folder for the ***Store*** component. Location is required as the store loads images dynamically based on database parameters, used in the ***store-app***:
```
  mkdir /assets/product_images/thumbnails
  mkdir /assets/product_images/full
```

4) Import product images in the following name format:
Full resolution images: {product.id}-{number}.png
Thumbnail images: {product.id}-T-{number}.png

5) Update the ***IPINFO*** API Token in the ***loc.js*** file (/public/assets/js/loc.js)
```
...
if (!uCrId) {
  $.getJSON('https://ipinfo.io/?token=MY_PRIVATE_TOKEN', function (res) {
  ...
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
