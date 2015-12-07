#!/usr/bin/env bash

cd /www/CocoaCouriers
git pull https://git@github.com:vberbenetz/CocoaCouriers.git
pm2 restart server
