# Provesoft Landing Page
---

## Summary
---
This is a complete guide to setup a webserver and deploy website code from this repository on a cloud server (VPS).

## Installation:
---
Create a new VPS running the latest or LTS version of Ubuntu.
SSH into the new server as ```root``` and
create a group and account specifically for running the server. 
Add the new user to the sudoers group.
Create home directory and change ownership to new user
Logout of ```root``` and ssh back in as the new user.
```
  groupadd nodeserver
  adduser nodeserver
  adduser nodeserver nodeserver
  adduser nodeserver sudo
```

Install Git, NodeJS, NPM, and Forever (using global flag to install into the npm directory). Add symlink to ```node``` because Forever process uses that binary. Need to change owner of ```/usr/local``` in order to install npm packages without requiring sudo.
```
  sudo apt-get update
  
  sudo apt-get install nodejs
  sudo ln -s /usr/bin/nodejs /usr/bin/node
  
  sudo apt-get install npm
  sudo apt-get install git
  
  sudo chown -R nodeserver:nodeserver /usr/local
  npm install forever -g
```

## Website Code Deployment Via Git
---
SSH into the server using the ```nodeserver``` account and configure git.
```
  git config --global user.name "ProdWebServer"
  git config --global user.email "prodwebserver@cantangosolutions.com"
```
Back on the server, create a directory to house the web code.
```
  sudo mkdir /www
```
Clone the github repository for the first time. Each subsequent time a pull command will be used to update the current version of the code to the one found in the repository.
```
  sudo git clone https://github.com/vberbenetz/CantangoHome.git
  sudo chown -R nodeserver:nodeserver /www
```
## Securing the Server
---
SSH into the server using the ```nodeserver``` account.

Disable ```root``` login by changing the ```PermitRootLogin``` line to a value of ```no``` in the ```/etc/ssh/sshd_config``` file.

Configure the firewall to only accept on SSH (22) and HTTP ports (80 and forward to 3000 where node is running). Add rule for inter-process communication on the server, as well as forwarding port 80 to 3000 for nodejs.
```
  sudo iptables -I INPUT 1 -i lo -j ACCEPT                (allow inter-process communication)
  sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
  sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT      (SSH)
  sudo iptables -A INPUT -p tcp --sport 22 -j ACCEPT      (SSH)
  sudo iptables -A INPUT -p tcp --sport 53 -j ACCEPT      (DNS)
  sudo iptables -A INPUT -p udp --sport 53 -j ACCEPT      (DNS)
  sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT      (HTTP)
  sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT    (Node Server)
  sudo iptables -A INPUT -p tcp --dport 19991 -j ACCEPT   (Github Webhook For New Post)
```
Install ```iptable-persistent``` package to save these rules permanently.
```
  sudo apt-get update
  sudo apt-get install iptables-persistent
```
Add the last rule to drop all other packets, and save the changes.
```
  sudo iptables -P INPUT DROP
  sudo service iptables-persistent save
```

**Note**: When pulling a release from github, the INPUT packets will need to be accepted temporarily. When completed, swtich back to dropping packets as above.
```
  sudo iptables -P INPUT ACCEPT
```
## Configure Autostart Procedure
---
Next, add the following lines to the ```/etc/rc.local``` file (edit as root). 2 lines are added to navigate to and autostart the webserver script upon a server restart.
```
  cd /www/CantangoHome
  sudo -u nodeserver /www/CantangoHome/start.sh
```
Once the file is saved, reboot the server to start up the node web server and to verify that the autostart procedure works. Navigate to the IP in a browser to verify that it is up and working.
## Point Domain Name To New Server
---
Navigate to the domain registrar's personal settings page in a browser (198.173.236.231/stats). Login with the credentials provided by the registrar when domain was purchased. On this page, navigate to Account Management > Domain Services, then choose Edit Zone File from the drop down beside the domain. Change values of all the A Records to the new IP address of the VPS hosting the site's code.
