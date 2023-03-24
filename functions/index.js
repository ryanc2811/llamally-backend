
// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');


const firebaseConfig = {
    apiKey: "AIzaSyCt7QhHd86PdslmxtAqgTsqX1ps2DL-3UM",

    authDomain: "llamally-78b73.firebaseapp.com",

    projectId: "llamally-78b73",

    storageBucket: "llamally-78b73.appspot.com",

    messagingSenderId: "155896217135",

    appId: "1:155896217135:web:15f97cdc8cd1268e9650da",

    measurementId: "G-64Z8HH35ZR"
};

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();


// auth trigger (user deleted)
exports.userDeleted = functions.region('europe-west2').auth.user().onDelete(user => {
    const doc = admin.firestore().collection('users').doc(user.uid);
    return doc.delete();
});

// auth trigger (new user signup)
exports.newUserSignUp = functions.region('europe-west2').auth.user().onCreate(user => {
    // for background triggers you must return a value/promise
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        name: user.displayName,
        permissions: ['user'],
    });
});



exports.signupUser = functions.region('europe-west2').https.onRequest(async (req, res) => {
    const userData = req.body;

    if (userData.email && userData.password && userData.name) {
        try {
            const userRecord = await admin.auth().createUser({
                email: userData.email,
                password: userData.password,
                displayName: userData.name
            });


            return res.status(200).send(userRecord);
        } catch (error) {
            return res.status(500).send(error);
        }
    } else {
        return res.status(500).send('Invalid Data');
    }

});

exports.loginUser = functions.region('europe-west2').https.onRequest(async (req, res) => {
    const loginData = req.body;

    try {
        const userRecord = await admin.auth().getUserByEmail(loginData.email);
        const signInResult = await admin.auth().verifyPassword(loginData.password, userRecord.passwordHash);

        return res.status(200).send(signInResult);
    } catch (error) {
        return res.status(500).send(error);
    }
});