# TwoMillion


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








