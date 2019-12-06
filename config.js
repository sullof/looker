module.exports = {
  extensions: [
    'com',
    'io',
    'co'
  ],
  twilio: {
    sid: process.env.TWILIO_SID,
    token: process.env.TWILIO_TOKEN,
    number: process.env.TWILIO_NUMBER
  }
}
