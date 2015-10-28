#!/usr/bin/env bash

cd /www/DomerBox
git pull git@github.com:vberbenetz/DomerBox.git
pm2 restart server
