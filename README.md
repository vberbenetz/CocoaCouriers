# Cocoa Couriers
This is a complete guide on setting up a webserver and deploying the website. It also contains a code summary and a general business operations guide.

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
  mkdir /public/assets/product_images/thumbnails
  mkdir /public/assets/product_images/full
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

## Code Layout Summary
The site is divided into 3 main application parts. The backend application (NodeJS + ExpressJS server) resides unders ***/app***, followed by 2 frontend Angular apps ***/public/manage-account-app*** and ***store-app***. The static pages are served up in .ejs format (Jade), with the head (all the includes & JS init code), header (html header page bar), and footer all included as templates within each HTML page.

#### Backend App
The backend application is broken up into controllers and routes. The routes serve up both static pages, as well as the API routes for the AJAX requests done by the frontend applications. Each API route is connected to a controller which handles the business logic behind the call. In addition to this, there are also a number of utilities:

- db_utils: Wraps the database calls, or handle the connection pool, as well as error handling.
- mail_service: Mail template generator which sends the mail payload to Sendgrid
- logger: Setup of the logging format
- errorHandler: Formats error for logging

The configuration folder contains the general config for application properties, config_priv for storage of API keys and other sensitive items, and passport which is used for user authentication.

Finally, the main server file is located in ***/cocoacouriers_server.js*** and is the file which intializes and creates the http server. It is configured to redirect all http routes to https routes by default.

#### Store App (Frontend)
The frontend store app can be found under ***/public/store-app***
This app launches when the user navigates to cocoacouriers.com/store
It takes care of the subscription process (/store/subscribe), populating the store, and the checkout process.

There are several controllers included in this app:
- mainCtrl: handles the initialization of the application, as well as processing data within the cookies to track the shopping cart, customer location and data
- subscriptionCtrl: handles the user navigation through the available subscriptions (retrieves from DB)
- storeCtrl: handles retrieving and populating the store with the available products (sorting by DB parameters)
- productCtrl: handles retrieving data about the product as well as populating the related images
- cartCtrl: handles the users shopping cart
- checkoutCtrl: handles the form validation, and calls to the backend to update the DB and transaction with Stripe
- postCheckoutCtrl: handles order confirmation after successful charge

#### Manage Account App (Frontend)
This app takes care of the customer logging in and updating their personal information.
This includes:
- update password
- update billing
- update subscription shipping address
- update/cancel subscription plan

## General Buiness Operation
#### Fulfilling Subscriptions
When a customer subscribes, they will only be charged for that subscription between the 15th and the end of that month. This means that we are alerted to a new subscription shipment via email notification from Stripe, on a successful charge.

To retrieve details about the shipping address, type of subscription, and whether a specific message was included with this order, the following needs to be done using database queries:

Retrieve the subscription list, and match up the ***stripeId*** in the ***Subscription*** table, with that on the Stripe Dashboard. This will return a row which will include the Plan ID, as setup in the Stripe Dashboard, under Plans. The id is specific to a region, so note the suffix of the code (cad or usd). This will also show you whether there is an ***altShippingAddressId***, which indicates that the customer is sending the order to an address which is not their billing address.
```
SELECT * FROM Subscription WHERE stripeId='cus_7s8wfQQFbmRekA';

+--------------------+--------------------+----------------------+------------+------------+--------------------+---------------
| stripeId           | subscriptionId     | altShippingAddressId | discountId | taxPercent | plan_id            |
+--------------------+--------------------+----------------------+------------+------------+--------------------+---------------
| cus_7s8wfQQFbmRekA | sub_7s8wnSLvmf5fLJ |                 NULL | NULL       |         13 | monthly_cad        |
```

If ***altShippingAddressId*** is false for that row, the shipping address will need to be the billing address. Street2 and Street3 are the addition address lines such as apartment or suite. If they are null, then there are no other address lines:
```
SELECT * FROM BillingAddress WHERE stripeId='cus_7s8wfQQFbmRekA';
+--------------------+---------+---------+------------------+---------+------------+-------+----------------+---------+---------+
| stripeId           | city    | country | name             | company | postalCode | state | street1        | street2 | street3 |
+--------------------+---------+---------+------------------+---------+------------+-------+----------------+---------+---------
| cus_7s8wfQQFbmRekA | Toronto | CA      | John Doe | NULL    | M4M2B4     | ON    | 1 Bay Street | NULL    | NULL    |
+--------------------+---------+---------+------------------+---------+------------+-------+----------------+---------+---------
```
Otherwise, if there is a number in the ***altShippingAddressId*** field, then you must ship that order to that address:
```
SELECT * FROM AltShippingAddress WHERE id=44;
+---------+---------+--------------------+------------+---------+------------+-------+---------------+---------+---------+----+
| city    | country | stripeId           | name       | company | postalCode | state | street1       | street2 | street3 | id |
+---------+---------+--------------------+------------+---------+------------+-------+----------------------+---------+---------
| Toronto | CA      | cus_9fRYMzXFqQIDTz | John Doe   | NULL    | M5V3C9     | ON    | 1 Bay Street  | Apt 306 | NULL    | 40 |
+---------+---------+--------------------+------------+---------+------------+-------+----------------------+---------+---------
```

Finally, to determine whether the customer would like to include a message within the gift, you will need to check under the specific Subscrtipion on the Stripe dashboard, under the "metadata" section. If a message needs to be included, it will be shown here as a key value pair under the variable ***orderMsg***

#### Fulfilling Custom Orders
Like with subscriptions, Stripe will send you an email for a successful charge of a custom order (gift box, or combination of bars from the store). These are stored under within the ***Shipment*** table. You will need to match up Customer ID from the Stripe dashboard, to the *stripeId* in this table. The below query will map the shipment to the shipment items, and retrieve all the product codes for the items which need to be shipped in this order. Afterwards, the product_id can be matched up with that in the Product table, to get more information on the product to ship.

```
SELECT Shipment.id, ShipmentItem.product_id, ShipmentItem.quantity FROM Shipment INNER JOIN ShipmentItem ON Shipment.id=ShipmentItem.shipmentId WHERE Shipment.stripeCustomerId='cus_9huQLBDzTBqJUD';
+---------+------------+----------+
| id      | product_id | quantity |
+---------+------------+----------+
| 1004862 | CS0002     |        1 |
| 1004862 | DT0001     |        1 |
| 1004862 | MD0001     |        1 |
| 1004862 | RA0001     |        1 |
| 1004862 | RA0002     |        1 |
+---------+------------+----------+
```
Finally, to check whether this needs to be shipped to the BillingAddress or an Alternate Shipping Address, select the shipment by the Id from the ***Shipment*** table, and check whether the altShippingAddress column is null or not. The same process is now followed as per the Subscription section. Additional messages with the order can also be retrieve from the Shipment table, as one of the columns of the Shipment row.
