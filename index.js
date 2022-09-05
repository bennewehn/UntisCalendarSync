const fs = require('fs')
const WebUntis = require('webuntis');
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

let config = JSON.parse(fs.readFileSync('config.json'))
let untisCred = JSON.parse(fs.readFileSync('untis-credentials.json'))

const untis = new WebUntis(
  untisCred.school,
  untisCred.username,
  untisCred.password,
  untisCred.domain
)

const calendar = google.calendar({ version: "v3" });

const auth = new GoogleAuth({
  keyFilename: 'google-credentials.json',
  scopes: ["https://www.googleapis.com/auth/calendar"]
})

const authClient = auth.getClient().then(() => {
  getCalEvents().then((events) => addEvents(events))
})

async function getCalEvents() {
  await untis.login()
  const today = new Date()
  today.setMonth(today.getMonth())
  let endtime = new Date(today.getTime())
  endtime.setDate(today.getDate() + config.daysToSync - 1)

  let events = []
  let timetable = await untis.getOwnTimetableForRange(today, endtime)

  timetable.forEach(element => {
    baseDate = WebUntis.convertUntisDate(element.date)
    data = {
      summary: (element.su[0]) ? element.su[0].longname : "unkown",
      start: {
        dateTime: WebUntis.convertUntisTime(element.startTime, baseDate)
      },
      end: {
        dateTime: WebUntis.convertUntisTime(element.endTime, baseDate)
      },
      description: `room: ${(element.ro[0]) ? element.ro[0].name : "unknown"} 
teacher: ${(element.te[0]) ? element.te[0].name : "unkown"}` +
        `(${(element.te[0]) ? element.te[0].longname : "unkown"})`
    }
    if (!config.subjectBlacklist.includes(data.summary)) events.push(data)
  })
  return events
}

async function addEvents(events) {

  let currEvents = (await getEvents()).data.items

  for (let i = 0; i < events.length; i++) {
    for (let j = 0; j < currEvents.length; j++) {
      if (events[i].start.dateTime >= new Date(currEvents[j].start.dateTime) &&
        events[i].start.dateTime <= new Date(currEvents[j].end.dateTime)) {
        try {
          const res = await calendar.events.delete({
            auth: auth,
            calendarId: config.calendarID,
            eventId: currEvents[j].id
          })
          console.log("Event deleted: %s", res.data)
        }
        catch { }
      }
    }
  }


  events.forEach(element => {
    calendar.events.insert({
      auth: auth,
      calendarId: config.calendarID,
      resource: element,
    },
      function (err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err)
          return
        }
        console.log('Event created: %s', event.data)
      })
  })
}

async function getEvents() {
  return await calendar.events.list({
    auth: auth,
    calendarId: config.calendarID,
    timeMin: (new Date()).toISOString(),
    singleEvents: true,
  })
}
