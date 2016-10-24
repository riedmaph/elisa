Temporary Database 
====================
Parameters are stored in config.json

Install PostgreSQL
------------------
```
$ sudo apt-get install postgresql
```

Set admin password and create database
--------------------------------------
Impersionate postgres user:
```
$ sudo -u postgres -i
```
Start postgres terminal
```
$ psql 
```
Change password of postgres
```
=# \password postgres
```
Enter new password as specified in config.json/dbpass

finally press ctrl+D twice to exit psql and logout

Create db and schema 
--------------------
```
$ ./run_scripts.sh
```
or on windows
```
> run_scripts.bat
```