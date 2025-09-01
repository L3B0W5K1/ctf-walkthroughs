# HTB Eureka (Hard)


We get an ip and the first thing we do is nmap-scanning, we get:

```
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```

We begin with heading to the website as we know no ssh credentials: 

DNS Resolves to **furni.htb**:

<img width="1439" height="635" alt="Screenshot 2025-09-01 at 21 43 59" src="https://github.com/user-attachments/assets/41158031-5587-4781-b0f0-b34bebb78b1b" />

Running ```gobuster dir -u   http://furni.htb/ -w common.txt```, we get the following:

```
about                (Status: 200) [Size: 14351]
blog                 (Status: 200) [Size: 13568]
cart                 (Status: 302) [Size: 0] [--> http://furni.htb/login]
checkout             (Status: 302) [Size: 0] [--> http://furni.htb/login]
comment              (Status: 302) [Size: 0] [--> http://furni.htb/login]
contact              (Status: 200) [Size: 10738]
error                (Status: 500) [Size: 73]
register             (Status: 200) [Size: 9028]
services             (Status: 200) [Size: 14173]
shop                 (Status: 200) [Size: 12412]
```

By trying to to find a blog id that does not exist we see the following:
<img width="656" height="219" alt="Screenshot 2025-09-01 at 21 54 30" src="https://github.com/user-attachments/assets/96417df0-39c7-4fcd-8afc-0f50ad3765ea" />

After searching google we can see its the Java framework **Spring Boot**.

Using the wordlist **Java-Spring-Boot.txt** we can run: ```gobuster dir -u http://furni.htb/ -w Java-Spring-Boot.txt```, thus getting:

```
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
actuator             (Status: 200) [Size: 2129]
actuator/caches      (Status: 200) [Size: 20]
actuator/env         (Status: 200) [Size: 6307]
actuator/env/home    (Status: 200) [Size: 668]
actuator/env/lang    (Status: 200) [Size: 668]
actuator/env/path    (Status: 200) [Size: 668]
actuator/features    (Status: 200) [Size: 467]
actuator/health      (Status: 200) [Size: 15]
actuator/configprops (Status: 200) [Size: 37195]
actuator/conditions  (Status: 200) [Size: 184221]
actuator/info        (Status: 200) [Size: 2]
actuator/metrics     (Status: 200) [Size: 3356]
actuator/loggers     (Status: 200) [Size: 101730]
actuator/beans       (Status: 200) [Size: 202254]
actuator/scheduledtasks (Status: 200) [Size: 54]
actuator/mappings    (Status: 200) [Size: 35560]
actuator/refresh     (Status: 405) [Size: 114]
actuator/sessions    (Status: 400) [Size: 108]
actuator/threaddump  (Status: 200) [Size: 135456]
actuator/heapdump    (Status: 200) [Size: 80165337]
Progress: 174 / 174 (100.00%)
```

Being that **heapdump** is a snapshot in time of all memory within a JVM, we can gather som information.



