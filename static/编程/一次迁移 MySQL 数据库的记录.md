# 一次迁移 MySQL 数据库的记录

由于我的电脑是 Windows 系统，因此踩了一些莫名其妙的坑。在这里就一句话：

##不要用 Powershell，用 git bash！！！##

- - -

## 使用的命令

导出用的命令：
```
mysqldump -h <YOUR_DATABASE_HOSTNAME> -P <YOUR_DATABASE_PORT> -u <YOUR_DATABASE_USER_NAME> -p'<YOUR_DATABASE_PASSWORD>' --ssl-mode=REQUIRED --set-gtid-urged=OFF --single-transaction <YOUR_DATABASE_NAME> > db.sql
```

导入用的命令：
```
mysql -h <YOUR_DATABASE_HOSTNAME> -P <YOUR_DATABASE_PORT> -u <YOUR_DATABASE_USER_NAME> -p'<YOUR_DATABASE_PASSWORD>' --ssl-mode=REQUIRED defaultdb < db.sql 
```
