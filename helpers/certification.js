
const session = require("../model/session").session;

exports.ensureAuthenticated = function (req, res, next) {

    const auth = session[req.session.id];
    const calendarId =  session["calendarId"];

    if(auth == undefined && calendarId == undefined) {
        res.redirect("/login")
    } else {
        return next();
    }

};