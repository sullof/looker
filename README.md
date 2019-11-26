# Looker

A tool to search DNS, GitHub, Twitter and Npm for available names.

For the DNS, create an account with https://main.whoisxmlapi.com and get an APIKEY. Create a `.env` in the root and add a line like
```
export APIKEY=yourApiKey
``` 
and run something like
```
source .env && node . -n valeriana
```
Good luck!