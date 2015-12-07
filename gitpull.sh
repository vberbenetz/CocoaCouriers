#!/usr/bin/env bash

cd /www/CocoaCouriers
git pull https://git@github.com:vberbenetz/CantangoHome.git
pm2 restart server
