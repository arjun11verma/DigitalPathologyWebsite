/**
 * Backend for handling email sending and diagnosis saving
 * @version 1.0
 * @author Arjun Verma
 */

const express = require('express'); // HTTP Library for defining responses to calls
const cors = require('cors'); // Library for Cross Origin Resource Sharing 
const bodyParser = require('body-parser'); // Library to parse request bodies
const PORT = 3001;

const gmailAPI = require('nodemailer'); // API for sending emails
const smtpTransport = require('nodemailer-smtp-transport'); // Simple Mail Transfer Protocol Transport

const AWS = require('aws-sdk');
const access_key = require('../APIKEYS.js').S3_ACCESS_KEY;
const secret_key = require('../APIKEYS.js').S3_SECRET_KEY;
AWS.config.update({region: 'us-east-1'});

const app = express();
app.use(cors());
app.use(bodyParser.json());

let currentDiagnoses = new Map(); // Map listing all of the current diagnoses being worked on and storing temporary saved data

/**
 * Creates a gmail SMTP transport for sending emails
 */
const emailTransport = gmailAPI.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: "arjunverma1com@gmail.com",
        pass: ""
    }
}));

/**
 * Defines a POST call to check whether a patient is already receiving a diagnosis and to return the saved state of the diagnosis
 * @param {JSON Object} req Contains the unique ID of a patient and the username of the doctor. 
 * @returns {JSON Object} res Contains whether the current patient is already receiving a diagnosis and the saved state of the diagnosis being received
 */
app.post('/api/updateCurrentDiagnosis', (req, res) => {
    var currentUser = false;

    console.log(`Fired for patient: ${req.body.patientID}`);

    if (currentDiagnoses.has(req.body.patientID)) {
        if (req.body.doctorID !== currentDiagnoses.get(req.body.patientID).doctorID) currentUser = true;
    }
    else currentDiagnoses.set(req.body.patientID, { 'doctorID': req.body.doctorID, 'currentDiagnosis': "Please input your diagnosis here" });

    res.status(200).send({ 'using': currentUser, 'currentDiagnosis': currentDiagnoses.get(req.body.patientID).currentDiagnosis });
});

/**
 * Defines a POST call for removing a patient from the server once his/her diagnosis has been completed 
 * @param {JSON Object} req Contains the unique ID of a patient
 * @returns {JSON Object} res A successful 200 response
 */
app.post('/api/removeCurrentDiagnosis', (req, res) => {
    currentDiagnoses.delete(req.body.patientID);
    res.status(200).send();
    console.log(currentDiagnoses);
});

/**
 * Defines a POST call for saving a patient's diagnosis before it has been completed 
 * @param {JSON Object} req Contains information detailing the current diagnosis of a patient and his/her unique ID
 * @returns {JSON Object} res A successful 200 response
 */
app.post('/api/saveCurrentDiagnosis', (req, res) => {
    var updatedDiagnosis = currentDiagnoses.get(req.body.patientID);
    updatedDiagnosis.currentDiagnosis = req.body.currentDiagnosis;
    currentDiagnoses.set(req.body.patientID, updatedDiagnosis);

    console.log(currentDiagnoses);
    res.status(200).send();
});

/**
 * Defines a POST call for sending a diagnosis email to the patient 
 * @param {JSON Object} req Contains information detailing the email address, name and diagnosis of a cancer patient (these fields remain anonymous on the frontend)
 * @returns {JSON Object} res Response detailing the success of the email 
 */
app.post('/api/sendEmail', (req, res) => {
    console.log(req.body);
    emailTransport.sendMail({
        from: "digitalpathology2020@gmail.com",
        to: req.body.address,
        subject: "Cancer diagnosis for " + req.body.name,
        text: "Hello, I hope this message finds you well.\nThis is the cancer diagnosis for " + req.body.name + ". \n" + req.body.message
    }, (error, response) => {
        console.log(error);
        if (error) {
            res.status(500).send(error);
        } else {
            res.status(200).send("Email Sent Successfully!");
        }
    });
});

app.post('/api/getImageS3', (req, res) => {
    var s3 = new AWS.S3({accessKeyId: access_key, secretAccessKey: secret_key, apiVersion: '2006-03-01'});
    s3.getObject({Bucket: 'digitalpath', Key: "/" + req.body.path}, (err, data) => {
        if (err) {
            res.status(200).send({'image': ""});
        } else {
            res.status(200).send({'image': data.Body.toString()})
        }
    });
});

/**
 * Runs the server on port 3001
 */
app.listen(PORT, () => {
    console.log("Listening on port " + PORT);
}); 