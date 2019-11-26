const superagent = require('superagent')
const cheerio = require('cheerio')

function commaSeparatedList(value, dummyPrevious) {
  return value.split(',');
}

const program = require('commander')
program
    .version('0.1.0')
    .option('-n, --names <names>', 'Names', commaSeparatedList)
    .option('-e, --extensions <extensions>', 'Extensions', commaSeparatedList)
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

async function getTwitter(name) {
  try {
    await superagent.get(`https://twitter.com/${name}`)
  } catch (e) {
    console.log(`@${name} is available`)
  }
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

(async function () {
  for (let name of names) {
    console.log(`Checking ${name}:`)
    await go(name)
  }
}())
