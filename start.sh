
source params.env && source .env && pm2 start looker.js --update-env && pm2 save && pm2 logs
