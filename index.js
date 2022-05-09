const WebUntis = require('webuntis');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const untisCredentials = require("./untis-credentials.json")
const calendarData = require("./calendar-data.json")
const untis = new WebUntis(untisCredentials.school, untisCredentials.username, untisCredentials.password, untisCredentials.domain)
const calendar = google.calendar({ version: "v3" });


untis.login().then(() => {


  const auth = new GoogleAuth({
    keyFilename: 'google-credentials.json',
    scopes: ["https://www.googleapis.com/auth/calendar"]
  })

  const today = new Date()
  for (let i = 0; i < 7; i++) {
    let day = new Date()
    day.setDate(today.getDate() + i)

    if (!(day.getDay() == 6 || day.getDay() == 0)) {
      untis.getOwnTimetableFor(day).then((timetable) => {
        let minTime = new Date()
        minTime.setDate(today.getDate() + 100)
        let maxTime = 0

        for (let element of timetable) {
          if (element.su.length > 0)
            if (element.su[0].name == "SPA BG" || element.su[0].name == "F BG")
              continue
          if (element.code == "cancelled")
            continue
          let startTime = WebUntis.convertUntisDate(element.date)
          startTime = WebUntis.convertUntisTime(element.startTime, startTime)
          let endtime = WebUntis.convertUntisTime(element.endTime, startTime)
          if (startTime < minTime) 
            minTime = startTime
          if (endtime > maxTime) 
            maxTime = endtime
        }

        let calEvent = {
          'summary': "Schule",
          'start': {
            'dateTime': minTime,
            'dateZone': "Europe/Berlin"
          },
          'end': {
            'dateTime': maxTime,
            'dateZone': "Europe/Berlin"
          },
        }

        const authClient = auth.getClient()
        authClient.then(() => {
          calendar.events.insert({
            auth: auth,
            calendarId: calendarData.id,
            resource: calEvent,
          }, function (err, event) {
            if (err) {
              console.log('There was an error contacting the Calendar service: ' + err)
              return
            }
            console.log('Event created: %s', event.data)
          }
          )
        })

      });

    }
  }
})
