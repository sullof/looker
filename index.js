const superagent = require('superagent')
const cheerio = require('cheerio')

const program = require('commander')
program
    .version('0.1.0')
    .option('-n, --name [name]', 'Name')
    .parse(process.argv)

const name = program.name
if (!name) {
  console.log('Missed name.')
  process.exit()
}

async function getDns(name, ext) {
  let res = await superagent
      .get(`https://domain-availability-api.whoisxmlapi.com/api/v1?apiKey=${process.env.APIKEY}&domainName=${name}.${ext}`)
      .set('accept', 'application/json')
  try {
    if (res.body.DomainInfo.domainAvailability === 'AVAILABLE')
      console.log(`${name}.${ext} is available`)
  } catch (e) {
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

async function go() {

  await Promise.all([
  getDns(name, 'com'),
  getDns(name, 'io'),
  getDns(name, 'co'),
  getTwitter(name),
  getGitHub(name),
  getNpm(name)])

  console.log('Done.')

}

go()
