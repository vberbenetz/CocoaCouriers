#!/usr/bin/env bash

cd /www/DomerBoxHome
git pull git@github.com:vberbenetz/DomerBoxHome.git
pm2 restart server
