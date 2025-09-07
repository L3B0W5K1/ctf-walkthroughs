# TwoMillion

Doing a post request to the API gives us:

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
