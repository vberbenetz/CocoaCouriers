#!/bin/bash

# modify the following to suit your environment
export DB_BACKUP="/backups/CocoaCouriers"
export DB_USER="cocoauser"
export DB_PASSWD="cocoauser"

rm -rf $DB_BACKUP/30
mv $DB_BACKUP/29 $DB_BACKUP/30
mv $DB_BACKUP/28 $DB_BACKUP/29
mv $DB_BACKUP/27 $DB_BACKUP/28
mv $DB_BACKUP/26 $DB_BACKUP/27
mv $DB_BACKUP/25 $DB_BACKUP/26
mv $DB_BACKUP/24 $DB_BACKUP/25
mv $DB_BACKUP/23 $DB_BACKUP/24
mv $DB_BACKUP/22 $DB_BACKUP/23
mv $DB_BACKUP/21 $DB_BACKUP/22
mv $DB_BACKUP/20 $DB_BACKUP/21
mv $DB_BACKUP/19 $DB_BACKUP/20
mv $DB_BACKUP/18 $DB_BACKUP/19
mv $DB_BACKUP/17 $DB_BACKUP/18
mv $DB_BACKUP/16 $DB_BACKUP/17
mv $DB_BACKUP/15 $DB_BACKUP/16
mv $DB_BACKUP/14 $DB_BACKUP/15
mv $DB_BACKUP/13 $DB_BACKUP/14
mv $DB_BACKUP/12 $DB_BACKUP/13
mv $DB_BACKUP/11 $DB_BACKUP/12
mv $DB_BACKUP/10 $DB_BACKUP/11
mv $DB_BACKUP/09 $DB_BACKUP/10
mv $DB_BACKUP/08 $DB_BACKUP/09
mv $DB_BACKUP/07 $DB_BACKUP/08
mv $DB_BACKUP/06 $DB_BACKUP/07
mv $DB_BACKUP/05 $DB_BACKUP/06
mv $DB_BACKUP/04 $DB_BACKUP/05
mv $DB_BACKUP/03 $DB_BACKUP/04
mv $DB_BACKUP/02 $DB_BACKUP/03
mv $DB_BACKUP/01 $DB_BACKUP/02
mkdir $DB_BACKUP/01

mysqldump -u $DB_USER -p$DB_PASSWD cocoacouriers | bzip2 > $DB_BACKUP/01/mysql-`date +%Y-%m-%d`.bz2
exit 0
