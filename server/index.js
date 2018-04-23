require('dotenv').config()
require('babel-polyfill')

const express = require('express')
    , nodemailer = require('nodemailer')
    , session = require('express-session')
    , bodyParser = require('body-parser')
    , cors = require('cors')
    , sql = require('mssql')
    , reachmail = require('reachmailapi')
    , cors = require('cors')

const app = express()

app.use(bodyParser.json())
app.use(cors())

app.use(express.static(__dirname + '/../build'))

//*** SESSION ***
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1800000 //12 hours
    }
}))


//Initiallising connection string

const user = process.env.DB_CONNECTION_USER
const pw = process.env.DB_CONNECTION_PW
const SQLserver = process.env.DB_CONNECTION_SERVER
const DBName = process.env.DB_CONNECTION_DBNAME
// console.log(`${user}`, `${pw}`, `${SQLserver}`)
var dbConfig = {
    user: `${user}`,
    password: `${pw}`,
    server: `${SQLserver}`,
    database: `${DBName}`,
};

//Define records GET function.
var myQuery = (pool, quer, callback) => {
    pool.request().query(quer, (err, recordset) => {
        callback(recordset);
    });
}

var executeQuery = function (res, query) {
    //Start connection.
    const pool = new sql.ConnectionPool(dbConfig, err => {
        myQuery(pool, query, recs => {
            // console.log("query1", recs);
            res.send(recs)
        });
    });

    pool.on('error', err => {
        console.log('pool error', err)
    });
}


//*** MIDDLEWARE ***

function setSession(req, res, next) {
    return req.session.user_id = req.body.id
}

function isAuthenticated(req, res, next) {
    console.log('Authenticated req.session', req.session)
    if (!req.session.user) {
        console.log('Log in required')
        return res.status(401).send('Not logged in')
    } else {
        console.log('Authenticated-proceed:', req.session.user)
        next()
    }
}

function isAuthenticatedRouter(req, res, next) {
    console.log('Authenticated req.session', req.session)
    if (!req.session.user) {
        console.log('Log in required')
        return res.status(401).send({ msg: 'Not logged in' })
    } else {
        console.log('Authenticated-proceed:', req.session.user)
        return res.status(200).send(true)
    }
}

//Forgot Password/Initial Login
app.post('/api/emailForgotPWLink', function create(req, res) {
    const newMessage = {
        email: req.body.email,
        token: req.body.token,
        url: `${process.env.forgotPWLink}/${req.body.token}`
    }
    // let transporter = nodemailer.createTransport({
    //     service: 'Gmail',
    //     auth: {
    //         user: process.env.gmailUser,
    //         pass: process.env.gmailPW,
    //     }
    // });

    // let mailOptions = {
    //     from: '"Dev Team Test 👻" <dev.test.3661@gmail.com>', // sender address
    //     to: `${newMessage.email}`, // list of receivers
    //     subject: `Forgot Password`, // Subject line
    //     text: `${newMessage.url}`, // plain text body
    //     html: `<a href='${newMessage.url}'>Click link to create new password</a>`
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         console.log(error);
    //     }
    //     console.log('Message sent: %s', info.messageId);
    //     res.sendStatus(200);
    // });


    // using SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: `${newMessage.email}`,
        from: 'support@cr.com',
        subject: 'Password update',
        text: `${newMessage.url}`,
        html: `<strong>Please click  <a href=${newMessage.url}>here</a> to set up your password!</strong>`,
    };
    sgMail.send(msg).then(() => {
        res.sendStatus(200);
    });
});

//**** USER/AUTHENTICATION ACTIONS****
//User
app.get('/Logout', function (req, res) {
    req.session.destroy();
    res.redirect(process.env.AUTH_LANDING_REDIRECT)
})

app.get('/auth/me', isAuthenticatedRouter)

app.get('/api/checkEmail/:email', function (req, res) {
    let query = `Select PersonID, Name, Email, Password, ACM, Lead from Peoples where Email='${req.params.email}'`;
    req.session.user = req.params.email
    executeQuery(res, query)
})

app.put('/api/addToken/:email', function (req, res) {
    let query = `UPDATE Peoples SET Token = '${req.body.token}' where Peoples.email= '${req.params.email}'; SELECT PersonID, Name, Email, ACM, Lead FROM Peoples where email ='${req.params.email}' `;
    executeQuery(res, query)
})

app.put('/api/removeToken/:email', function (req, res) {
    let query = `UPDATE Peoples SET token = null where Peoples.Email= '${req.params.email}'`;
    executeQuery(res, query)
})

app.put('/api/editPassword/:email', function (req, res) {
    let query = `UPDATE Peoples SET Password = '${req.body.pw}' where Peoples.Email= '${req.params.email}'; SELECT PersonID, Name, Email, ACM, Lead FROM Peoples where Email='${req.params.email}'`;
    executeQuery(res, query)
})

app.get('/api/getApprovedPackages/:PersonID', function (req, res) {
    let query = `select PackageID from PackageOwners where PersonID = ${req.params.PersonID}`;
    executeQuery(res, query)
})

//Summary Figures
//1. Baseline
app.get('/api/getBaseline/:focusGroup', function (req, res) {
    let query = `SELECT sum([Baseline_AUD]) as total
    FROM Cumulative_tender_rev inner join WBS_codes
    ON Cumulative_tender_rev.WBSID=WBS_codes.WBSID
    where RevID=1  and WBS_codes.Focus_Group='${req.params.focusGroup}'
  `;
    executeQuery(res, query)
})

app.get('/api/getAllBaseline', function (req, res) {
    let query = `Select Sum ([Baseline_AUD]) as total From [Cumulative_tender_rev] Where RevID=1`;
    executeQuery(res, query)
})

//2. Hyp Val Rem
app.get('/api/getHypVal/:focusGroup', function (req, res) {
    let query = `SELECT Sum([Value]) as total FROM Hypotheses where PackageID=${req.params.focusGroup} AND CRID is Null`;
    executeQuery(res, query)
})

app.get('/api/getAllHypVal', function (req, res) {
    let query = `SELECT Sum([Value]) as total FROM Hypotheses where CRID is Null`;
    executeQuery(res, query)
})

//3. CRs Raised
app.get('/api/getCRsRaised/:focusGroup', function (req, res) {
    let query = `SELECT sum([CRs_Raised])as total FROM Hypotheses left join CRs_Raised on Hypotheses.CRID=CRs_Raised.CRID where Hypotheses.PackageID=${req.params.focusGroup}`;
    executeQuery(res, query)
})

app.get('/api/getAllCRsRaised', function (req, res) {
    let query = `SELECT sum([CRs_Raised])as total FROM Hypotheses left join CRs_Raised on Hypotheses.CRID=CRs_Raised.CRID`;
    executeQuery(res, query)
})

//Analytics Table
app.get('/api/getAnalytics', function (req, res) {
    let query = `select Cat.Category, Hyp.Opportunity,Pack.PackageName, Hyp.Value from Hypotheses as Hyp
    inner join u_Categories as Cat on Cat.CategoryID = Hyp.CategoryID
    inner join Packages as Pack on Pack.PackageID = Hyp.PackageID`;
    executeQuery(res, query)
})

app.get('/api/getAnalyticsByPackage/:id', function (req, res) {
    let query = `select Cat.Category, Hyp.Opportunity,Pack.PackageName, Hyp.Value from Hypotheses as Hyp
    inner join u_Categories as Cat on Cat.CategoryID = Hyp.CategoryID
    inner join Packages as Pack on Pack.PackageID = Hyp.PackageID
    where Hyp.PackageID = ${req.params.id}`;
    executeQuery(res, query)
})


//CRs
app.get('/api/getAllCRs', function (req, res) {
    let query = `select CR.CRID,Hyp.HypothesesID, P.PackageName, Hyp.Opportunity,CR.CRs_Raised, CR.WBSID, WBS.L4,CR.CR_Description,CR.Date_Raised,CR.CR_Reference,CR.Actualized from hypotheses as Hyp
    left outer join CRs_Raised as CR on CR.CRID = Hyp.CRID
    left outer join WBS_codes as WBS on WBS.WBSID = CR.WBSID
    join Packages as P on P.PackageID = Hyp.PackageID
    where Hyp.CRID is not null
    order by P.PackageName asc`;
    executeQuery(res, query)
})

app.get('/api/getAllCRsByPackage/:id', function (req, res) {
    let query = `select CR.CRID,Hyp.HypothesesID,  P.PackageName,Hyp.Opportunity,CR.CRs_Raised, CR.WBSID, WBS.L4,CR.CR_Description,CR.Date_Raised,CR.CR_Reference,CR.Actualized  from hypotheses as Hyp
    left outer join CRs_Raised as CR on CR.CRID = Hyp.CRID
    left outer join WBS_codes as WBS on WBS.WBSID = CR.WBSID
    join Packages as P on P.PackageID = Hyp.PackageID
    where Hyp.PackageID = ${req.params.id} and Hyp.CRID is not null
    order by P.PackageName asc`;
    executeQuery(res, query)
})

app.put('/api/editCR/:id', function (req, res) {
    let Desc = req.body.CR_Description ? "'"+req.body.CR_Description+"'" : null
    let query = `
	update CRs_Raised set WBSID=${req.body.WBSID}, CR_Description=${Desc}, CRs_Raised=${req.body.CRs_Raised} where CRID=${req.params.id}`;
    executeQuery(res, query)
})

app.delete('/api/deleteCR/:id', function (req, res) {
    let query = `
	delete from CRs_Raised where CRID=${req.params.id}`;
    executeQuery(res, query)
})

app.post('/api/createCR', function (req, res) {
    let query = `
	insert into CRs_Raised(WBSID, Opportunity, CR_Description, CRs_Raised, Date_Raised, CR_Reference) values (${req.body.WBSID},'${req.body.Opportunity}', '${req.body.CR_Description}', ${req.body.CRs_Raised},'${req.body.Date_Raised}', ${req.body.CR_Reference}); SELECT CRID from CRs_Raised where CRID = SCOPE_IDENTITY()`;
    executeQuery(res, query)
})

app.put('/api/actualize/:CRID', function (req, res) {
    let query = `UPDATE CRs_Raised SET Actualized = 1 where CRID= ${req.params.CRID}`;
    executeQuery(res, query)
})

app.put('/api/unactualize/:CRID', function (req, res) {
    let query = `UPDATE CRs_Raised SET Actualized = null where CRID= ${req.params.CRID}`;
    executeQuery(res, query)
})

app.get('/api/maxCR', function (req, res) {
    let query = `SELECT MAX(CR_Reference) as Max FROM  CRs_Raised`;
    executeQuery(res, query)
})

//Hypotheses
app.get('/api/getAllHypotheses', function (req, res) {
    let query = `
	select Pack.PackageName, Pack.PackageID, Hyp.Opportunity, Cat.CategoryID,Hyp.HypothesesID, Cat.Category,Hyp.Value, Hyp.CRID from hypotheses as Hyp
	inner join u_Categories as Cat on Cat.CategoryID = Hyp.CategoryID
    inner join Packages as Pack on Pack.PackageID = Hyp.PackageID
    order by PackageName ASC`;
    executeQuery(res, query)
})

app.post('/api/createHypotheses', function (req, res) {
    console.log(req.body)
    let query = `
	insert into Hypotheses(PackageID, CategoryID, Opportunity, Value, PersonID) values (${req.body.PackageID}, ${req.body.CategoryID}, '${req.body.Opportunity}', ${req.body.Value},${req.body.PersonID})`;
    executeQuery(res, query)
})

app.put('/api/editHypotheses/:id', function (req, res) {
    let query = `
	update Hypotheses set PackageID=${req.body.PackageID}, CategoryID=${req.body.CategoryID}, Opportunity='${req.body.Opportunity}', Value=${req.body.Value} where HypothesesID=${req.params.id}`;
    executeQuery(res, query)
})

app.put('/api/updateCRID/:id', function (req, res) {
    let query = `
	update Hypotheses set CRID=${req.body.CRID} where HypothesesID=${req.params.id}`;
    executeQuery(res, query)
})

app.put('/api/removeCRID/:id', function (req, res) {
    let query = `
	update Hypotheses set CRID=null where HypothesesID=${req.params.id}`;
    executeQuery(res, query)
})

app.delete('/api/deleteHypotheses/:id', function (req, res) {
    let query = `
	delete from  Hypotheses where HypothesesID=${req.params.id}`;
    executeQuery(res, query)
})

app.get('/api/getAllHypothesesByPackage/:id', function (req, res) {
    let query = `
	select Pack.PackageName, Pack.PackageID, Hyp.Opportunity, Cat.CategoryID,Hyp.HypothesesID, Cat.Category,Hyp.Value, Hyp.CRID  from hypotheses as Hyp
	inner join u_Categories as Cat on Cat.CategoryID = Hyp.CategoryID
    inner join Packages as Pack on Pack.PackageID = Hyp.PackageID
    where Hyp.PackageID = ${req.params.id}
    order by PackageName ASC`;
    executeQuery(res, query)
})


//Work Planning
app.get('/api/getAllWPsByPackage/:id', function (req, res) {
    let query = `
    select (CASE WHEN WP.CRID IS NOT NULL THEN Hyp.Opportunity
        ELSE Hyp2.Opportunity END) as Opportunity, 
        (CASE WHEN WP.CRID IS NOT NULL THEN P.PackageID
        ELSE P2.PackageID END) as PID,
        (CASE WHEN WP.CRID IS NOT NULL THEN P.PackageName
            ELSE P2.PackageName END) as PackageName,
            (CASE WHEN WP.CRID IS NOT NULL THEN 'CR' ELSE 'Hypotheses' END) as AttachedTo, 
        Statuses.StatusID,
        WP.CRID,WP.HypothesesID,
        WP.HypothesesID, Statuses.StatusID, WP.Resource,WP.Tasks, Statuses.Status,WP.Start,WP.Finish,WP.EstimatedHours,WP.Comments,WP.Rank from Work_Planning as WP
        left outer join Hypotheses as Hyp on Hyp.CRID = WP.CRID
        left outer join Hypotheses as Hyp2 on Hyp2.HypothesesID = WP.HypothesesID
        left outer join Packages as P on P.PackageID = Hyp.PackageID
        left outer join Packages as P2 on P2.PackageID = Hyp2.PackageID
        left outer join Statuses on Statuses.StatusID = WP.StatusID
        WHERE P.PackageID = ${req.params.id} OR P2.PackageID = ${req.params.id}`;
    executeQuery(res, query)
})

app.get('/api/getAllWPsByCRID/:id', function (req, res) {
    let query = `
    select WP.WorkID, WP.CRID, (CASE WHEN WP.CRID IS NOT NULL THEN 'CR'
    ELSE 'Hyptheses' END) as AttachedTo, 
	(CASE WHEN WP.CRID IS NOT NULL THEN Hyp2.Opportunity
	ELSE Hyp.Opportunity END) as Opportunity, 
	WP.HypothesesID, Statuses.StatusID, WP.Resource,P.PackageName, WP.Tasks, Statuses.Status,WP.Start,WP.Finish,WP.EstimatedHours,WP.Comments,WP.Rank from Work_Planning as WP
    left outer join Hypotheses as Hyp on Hyp.HypothesesID = WP.HypothesesID
    left outer join Hypotheses as Hyp2 on Hyp2.CRID = WP.CRID
    LEFT OUTER join Packages as P on P.PackageID = Hyp.PackageID
    left outer join Statuses on Statuses.StatusID = WP.StatusID
    where WP.CRID = ${req.params.id}`;
    executeQuery(res, query)
})

app.get('/api/getAllWP', function (req, res) {
    let query = `
	select WP.WorkID, WP.CRID, (CASE WHEN WP.CRID IS NOT NULL THEN 'CR'
    ELSE 'Hypotheses' END) as AttachedTo, 
	(CASE WHEN WP.CRID IS NOT NULL THEN Hyp2.Opportunity
	ELSE Hyp.Opportunity END) as Opportunity, 
	WP.HypothesesID, Statuses.StatusID, WP.Resource, P.PackageName, WP.Tasks, Statuses.Status,WP.Start,WP.Finish,WP.EstimatedHours,WP.Comments,WP.Rank from Work_Planning as WP
    left outer join Hypotheses as Hyp on Hyp.HypothesesID = WP.HypothesesID 
    left outer join Hypotheses as Hyp2 on Hyp2.CRID = WP.CRID
    LEFT OUTER join Packages as P on P.PackageID = Hyp.PackageID
    LEFT OUTER join Packages as P2 on P2.PackageID = Hyp2.PackageID
    left outer join Statuses on Statuses.StatusID = WP.StatusID`;
    executeQuery(res, query)
})

app.delete('/api/deleteWP/:id', function (req, res) {
    let query = `
	delete from  Work_Planning where WorkID=${req.params.id}`;
    executeQuery(res, query)
})

app.post('/api/createWP', function (req, res) {
    let Start = req.body.Start ? "'"+req.body.Start+"'" : null
    let Finish = req.body.Finish ? "'"+req.body.Finish+"'" : null
    let Comments = req.body.Comments ? "'"+req.body.Comments+"'" : null
    let query = 
    `insert into Work_Planning(CRID, Tasks, StatusID, Resource, Start, Finish,Comments,Rank,EstimatedHours, HypothesesID)values(${req.body.CRID},'${req.body.Tasks}',${req.body.StatusID},'${req.body.Resource}',${Start},${Finish},${Comments},null, ${req.body.EstimatedHours}, null)`;
    //`insert into Work_Planning(CRID, Tasks, StatusID, Resource)values(${req.body.CRID}, '${req.body.Tasks}',${req.body.StatusID},'${req.body.Resource}')`;
    executeQuery(res, query)
})

app.post('/api/createWPforHyp', function (req, res) {
    let query = `insert into Work_Planning(HypothesesID, Tasks,StatusID, Resource,Start, Finish, Comments,EstimatedHours) values(${req.body.HypothesesID},'${req.body.Tasks}',${req.body.StatusID},'${req.body.Resource}', '${req.body.Start}','${req.body.Finish}','${req.body.Comments}',${req.body.EstimatedHours});`
    executeQuery(res, query)
})

app.put('/api/editWP/:id', function (req, res) {
    let Start = req.body.StartDate ? "'"+req.body.StartDate+"'" : null
    let Finish = req.body.FinishDate ? "'"+req.body.FinishDate+"'" : null
    let Comments = req.body.Comments ? "'"+req.body.Comments+"'" : null
    let query = 
    `update Work_Planning set Tasks='${req.body.Tasks}' , StatusID=${req.body.StatusID}, Resource='${req.body.Resource}', Start=${Start}, Finish=${Finish}, Comments=${Comments}, EstimatedHours=${req.body.EstimatedHours} where WorkID=${req.params.id}`;
    executeQuery(res, query)
})

app.get('/api/getAllWPsByHyp/:id', function (req, res) {
    let query = `
	select WP.WorkID, Statuses.StatusID, P.PackageName, WP.Resource,Hyp.Opportunity, WP.Tasks, Statuses.Status,WP.Start,WP.Finish,WP.EstimatedHours,WP.Comments,WP.Rank from Work_Planning as WP
    left outer join Hypotheses as Hyp on Hyp.HypothesesID = WP.HypothesesID
    left outer join Statuses on Statuses.StatusID = WP.StatusID
    join Packages as P on P.PackageID = Hyp.PackageID
    where WP.HypothesesID = ${req.params.id}`;
    executeQuery(res, query)
})

//Drop Downs
app.get('/api/getCategories', function (req, res) {
    let query = `select * from u_Categories`;
    executeQuery(res, query)
})

app.get('/api/getPackages/:PersonID', function (req, res) {
    let query = `select P.PackageID, P.PackageName from Packages as P join PackageOwners as PO on PO.PackageID = P.PackageID where PO.PersonID = ${req.params.PersonID}`;
    executeQuery(res, query)
})

app.get('/api/getPackagesAll', function (req, res) {
    let query = `select * from Packages`;
    executeQuery(res, query)
})

app.get('/api/getOpportunity/:PersonID', function (req, res) {
    let query = `select HypothesesID, Opportunity from Hypotheses as Hyp
    join PackageOwners as PO on PO.PackageID = Hyp.PackageID where PO.PersonID = ${req.params.PersonID}`;
    executeQuery(res, query)
})

//Created a CR can only be done against Opportunity with no CR
app.get('/api/getOpportunityWithNoCR/:PersonID', function (req, res) {
    let query = `select HypothesesID, Opportunity from Hypotheses as Hyp join PackageOwners as PO on PO.PackageID = Hyp.PackageID where PO.PersonID = ${req.params.PersonID} AND CRID IS NULL`;
    executeQuery(res, query)
})

//Created a Task can only be done against Opportunity with a CR
app.get('/api/getOpportunityWithCR/:PersonID', function (req, res) {
    let query = `select distinct CRID, Opportunity from Hypotheses as Hyp join PackageOwners as PO on PO.PackageID = Hyp.PackageID where PO.PersonID = ${req.params.PersonID} AND CRID IS NOT NULL`;
    executeQuery(res, query)
})

app.get('/api/getWBS', function (req, res) {
    let query = `select WBSID, L4 from WBS_codes`;
    executeQuery(res, query)
})

app.get('/api/getStatus', function (req, res) {
    let query = `select StatusID, Status from Statuses`;
    executeQuery(res, query)
})

//LISTENING TO SERVER ON PORT 3005
var server = app.listen(443, function () {
    console.log('Server is running..');
});





