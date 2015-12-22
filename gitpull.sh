#!/usr/bin/env bash

cd /www/CocoaCouriers
git pull git@github.com:vberbenetz/CocoaCouriers.git
pm2 restart cocoacouriers_server
