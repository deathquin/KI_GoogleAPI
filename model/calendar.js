
const google = require('googleapis').google;

exports.calendar = {

    eventList : function(auth, calendarId, callback) {

        const calendar = google.calendar({version: 'v3', auth});

        calendar.events.list({
            calendarId: calendarId,
            timeMin: (new Date()).toISOString(),
            maxResults: 50,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, {data}) => {
            console.log(err);
            if (err) return callback(err);
            const events = data.items;
            callback(err, events);
        });

    },

    insert: function(auth, calendarId, resource, callback) {

        const calendar = google.calendar({version: 'v3', auth});

        calendar.events.insert({
            calendarId: calendarId,
            resource: resource
        }, function(err, event){

            if(err) {
                callback(err);
            } else {
                callback(err, event);
            }

        });

    },

    rangeEventList: function(auth, calendarId, startDate, endDate, callback) {

        const calendar = google.calendar({version: 'v3', auth});

        calendar.events.list({
            calendarId: calendarId,
            timeMin: startDate.toISOString(),
            timeMax : endDate.toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, {data}) => {
            if (err) return callback(err);
            const events = data.items;
            callback(err, events);
        });

    },

    update: function(auth, calendarId, uid, resource, callback) {

        const calendar = google.calendar({version: 'v3', auth});

        calendar.events.update({
            calendarId: calendarId,
            eventId: uid,
            resource: resource
        }, function(err){
            if (err) {
                callback(err)
            } else {
                callback(err);
            }
        });

    },

    delete: function(auth, calendarId, uid, callback) {

        const calendar = google.calendar({version: 'v3', auth});

        calendar.events.delete({
            calendarId: calendarId,
            eventId: uid,
            sendNotifications: false
        }, function(err){
            if(err) {
                callback(err);
            } else {
                callback(err);
            }

        })

    },

    calendarList: function(auth, callback) {

        const calendar = google.calendar({version: 'v3', auth});

        calendar.calendarList.list({
           maxResults: 100
        }, function (err, result) {

/*
            for(var i=0; i<result.data.items.length; i++) {
                console.log("1 : "+result.data.items[i].summary);
                console.log("223 : "+result.data.items[i].id);
                console.log();
            }
*/
            if(err) {
                callback(err, result.data.items);
                return;
            }

            callback(err, result.data.items);


         });

    }

};