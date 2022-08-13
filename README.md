# UntisCalendarSync
Sync Untis to google calendar                                                   
                                                                                
## Prerequisites                                                                
* [Node.js & npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed
* Google account with Google Calendar



## Installation
```
npm install webuntis 
npm install googleapis
npm install google-auth-library
```

## Setup
1. [Create a Goolge Cloud Project](https://developers.google.com/workspace/guides/create-project).
2. Enable the Calendar API ([Enable-APIs](https://developers.google.com/workspace/guides/enable-apis)).
3. [Create a service account and credentials](https://developers.google.com/workspace/guides/create-credentials#service-account) 
and save them as google-credentials.json in application directory.
4. [Create a new calendar](https://support.google.com/calendar/answer/37095?hl=en) and save the calendar id in the config.json file.
5. In the calendar settings go to "Share with specific people", click "Add poeple" and paste the client email from the downloaded JSON
service key file.
6. Paste your untis credentials in untis-credentials.json.

```
{
    "school": "xyz",
    "username": "abc",
    "password": "*****",
    "domain": "xxxx.webuntis.com"
}
```

## Configuration
Configuration in config.json
```
{
   "daysToSync": 5 ,
   "calendarID": "*********@group.calendar.google.com",
   "subjectBlacklist": []
}
```
