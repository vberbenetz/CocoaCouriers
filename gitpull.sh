#!/usr/bin/env bash

cd /www/ProvesoftHome
git pull git@github.com:vberbenetz/DomerBoxHome.git
pm2 restart server
