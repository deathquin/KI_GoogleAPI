const express = require('express');
const router = express.Router();
const googelConfig = require("../config/googleAPI").config;
const google = require('googleapis').google;
const OAuth2Client = google.auth.OAuth2;
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly','https://www.googleapis.com/auth/calendar'];
const session = require('../model/session').session;

//Global object
var auths = {};

const oAuth2Client = new OAuth2Client(googelConfig.ClientId,
    googelConfig.ClientSecretKey,
    googelConfig.redirectUrl);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/login", function(req, res){

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    res.redirect(authUrl);
});

router.get("/auth/google/callback", function(req, res){

    oAuth2Client.getToken(req.query.code, function(err, token) {
        if (err) {
            console.log('Error while trying to retrieve access token', err);
            res.json("Error : " + err.message);
            return;
        }
        oAuth2Client.credentials = token;

        req.session.auth = oAuth2Client;
        auths[req.session.id] = oAuth2Client;
        session[req.session.id] = oAuth2Client;

        res.redirect("/calendar/select");

       /* calender.eventList(oAuth2Client,function(err, events) {

            if(err) {
                res.json("Error : " + err.message);
                return;
            }

            if(events.length) {
                console.log('Upcoming 10 events:');
                events.map((event, i) => {
                    console.log(event.id);
                    const start = event.start.dateTime || event.start.date;
                    console.log(`${start} - ${event.summary}`);
                });
                res.redirect("/calendar/select");
            } else {
                res.json("Not Found Events");
                return;
            }

        });*/

    });

});

router.get("/apitest", function(req, res){

    var auth = auths[req.session.id];
    const google = require('googleapis').google;
    const calendar = google.calendar({version: 'v3', auth});

    var event = {
        'summary': 'Google I/O 2015',
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
            'dateTime': '2018-04-28T09:00:00-12:00:00',
            'timeZone': 'America/Los_Angeles',
        },
        'end': {
            'dateTime': '2018-04-28T12:00:00-15:00:00',
            'timeZone': 'America/Los_Angeles',
        },

    };

    calendar.events.insert({
        calendarId: "primary",
        resource: event
    }, function(err, event){
        if(err) {
            console.log("There was an error contacting the Calendar service : " + err.message);
            res.json("fail");
            return;
        }

        console.log('Event created: ' + JSON.stringify(event.data));
        res.json("success");

    });

});


router.get("/list", function(req, res){

    var auth = auths[req.session.id];
    const google = require('googleapis').google;
    const calendar = google.calendar({version: 'v3', auth});

    calendar.calendarList.list({
            maxResults: 100
        },
        function (err, result) {

            for(var i=0; i<result.data.items.length; i++) {
                console.log(result.data.items[i].summary);
                console.log(result.data.items[i].id);
                console.log();
            }

            res.json("hello");

        }
    );

});

router.get("/ggg", function(req, res){

    // hsqrjvg7svo72a58claorsuev8
    var auth = auths[req.session.id];
    const google = require('googleapis').google;
    const calendar = google.calendar({version: 'v3', auth});

    calendar.events.get({
        calendarId: "primary",
        eventId: "tl9hdgfevm3cqb94maq9jkp9ko_20180429T160000Z"
    }, function(err, event){

        if(err) {
            console.log("There was an error contacting the Calendar service : " + err.message);
            res.json("fail");
            return;
        }

        console.log(event.data);
        res.json("success");

    });

});

router.get("/range", function(req, res){

    var auth = auths[req.session.id];
    const google = require('googleapis').google;
    const calendar = google.calendar({version: 'v3', auth});

    var date = new Date();
    date.setDate(date.getDate() + 5);

    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        timeMax : date.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, {data}) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = data.items;
        if (events.length) {
             console.log('Upcoming 10 events:');
             events.map((event, i) => {
                 const start = event.start.dateTime || event.start.date;
                 console.log(`${start} - ${event.summary}`);
             });
         } else {
             console.log('No upcoming events found.');
         }
    });


});

router.get("/update", function(req, res){

    var auth = auths[req.session.id];
    const google = require('googleapis').google;
    const calendar = google.calendar({version: 'v3', auth});

    var event = {
        'summary': 'Google I/O 2015',
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
            'dateTime': '2018-04-28T09:00:00-12:00:00',
            'timeZone': 'America/Los_Angeles',
        },
        'end': {
            'dateTime': '2018-04-28T12:00:00-15:00:00',
            'timeZone': 'America/Los_Angeles',
        },

    };

    console.log(req.body.data);

   /* calendar.events.update({
        calendarId: 'primary',
        eventId: "",
        resource: event
    }, (err, {data}) => {
        if(err) {
            console.log("There was an error contacting the Calendar service : " + err.message);
            res.json("fail");
            return;
        }

        console.log('Event created: ' + JSON.stringify(event.data));
        res.json("success");
    });
*/
});


router.get("/register2", function(req, res){
    res.render("cal_register2");
});

router.get("/table", function(req, res){
    res.render("tabletest");
});

module.exports = router;


/*function removeEvents(auth, calendar){
    calendar.events.delete({
        auth: auth,
        calendarId: 'primary',
        eventId: "#####",
    }, function(err) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }
        console.log("Removed");
    });
}*/







