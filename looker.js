const superagent = require('superagent')
const config = require('./config')
const fs = require('fs-extra')
const path = require('path')
const twilio = require('twilio')

const client = twilio(config.twilio.sid, config.twilio.token)

fs.ensureDir(path.resolve(__dirname, './tmp'))

function commaSeparatedList(value, dummyPrevious) {
  return value.split(',');
}

async function log(x) {
  await fs.appendFile(path.resolve(__dirname, './tmp/monitor.log'), `\n${x}`)
}

async function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis))
}

async function sendMessage(to, body) {
  try {
    const [err, responseData] = await client.messages.create({
      to: to,
      from: config.twilio.number,
      body: body

    })
    if (!err) {
      log(responseData.from)
      log(responseData.body)
    }
  } catch(e) {
    console.log(e.message)
  }
}

const program = require('commander')
program
    .version('0.1.0')
    .option('-n, --names <names>', 'Names', commaSeparatedList)
    .option('-e, --extensions <extensions>', 'Extensions', commaSeparatedList)
    .option('-m, --monitor', 'Monitor')
    .parse(process.argv)

const names = program.names
const extensions = program.extensions || ['com']

if (!names) {
  console.log('Missed names.')
  process.exit()
}

async function getDns(name, ext) {
  if (process.env.APIKEY) {
    let res = await superagent
        .get(`https://domain-availability-api.whoisxmlapi.com/api/v1?apiKey=${process.env.APIKEY}&domainName=${name}.${ext}`)
        .set('accept', 'application/json')
    try {
      if (res.body.DomainInfo.domainAvailability === 'AVAILABLE')
        console.log(`${name}.${ext} is available`)
    } catch (e) {
    }
  }
  return false
}

let foundNames = []

async function getTwitter(name) {
  let res = false
  if (program.monitor) {
    await log(`Checking @${name}`)
  }
  try {
    await superagent.get(`https://twitter.com/${name}`)
  } catch (e) {
    foundNames.push(name)
    res = true
    let msg = `@${name} is available`
    if (program.monitor) {
      await log(msg)
    } else {
      console.log(msg)
    }
  }
  return res
}

async function getGitHub(name) {
  try {
    await superagent.get(`https://github.com/${name}`)
  } catch (e) {
    console.log(`${name} is available on GitHub`)
  }
}

async function getNpm(name) {
  try {
    await superagent.get(`https://npmjs.org/package/${name}`)
  } catch (e) {
    console.log(`${name} is available on Npm`)
  }
}

async function go(n) {

  let promises = [
    getTwitter(n),
    getGitHub(n),
    getNpm(n)
  ]

  for (let e of extensions) {
    promises.push(getDns(n, e))
  }

  await Promise.all(promises)

  console.log('Done.')

}

async function checkAll() {
  for (let name of names) {
    console.log(`Checking ${name}:`)
    await go(name)
  }
}

async function checkTNames() {
  while (true) {
    for (let name of names) {
      if (!foundNames.includes(name)) {
        let res = await getTwitter(name)
        if (res) {
          sendMessage('+14154307073', `WOW, @${name} is available!`)
        }
      }
      await sleep(1000 * 10)
    }
    if (names.length === foundNames.length) {
      process.exit(0)
    }
    await sleep(1000 * 3600)
  }
}

if (program.monitor) {
  checkTNames()
  const pkg = require('./package')
  const http = require('http')
  http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.write(`Looker ${pkg.version}`)
    res.end()
  }).listen(43562)

} else {
  checkAll()
}
