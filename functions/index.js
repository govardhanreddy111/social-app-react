const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const app = express();

const firebase = require('firebase');
const db = admin.firestore();

const firebaseConfig = {
    apiKey: "AIzaSyBebt5VgMhph9v1u-cM4Yxsj6Pvr769210",
    authDomain: "socialape-7c821.firebaseapp.com",
    databaseURL: "https://socialape-7c821.firebaseio.com",
    projectId: "socialape-7c821",
    storageBucket: "socialape-7c821.appspot.com",
    messagingSenderId: "252736523728",
    appId: "1:252736523728:web:b3006dfb4b0f7215"
};
firebase.initializeApp(firebaseConfig);

app.get('/screams', (req,res) =>{
    db
        .collection('screams')
        .orderBy('createdAt','desc')
        .get()
        .then(data =>{
            let screams = [];
            data.forEach(doc =>{
                screams.push({
                    screamId : doc.id,
                    body : doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(screams);
        })
        .catch(err => console.error(err));
});

app.post('/scream', (req,res) =>{
    const newScream = {
        body : req.body.body,
        userHandle : req.body.userHandle,
        createdAt : new Date().toISOString()
    };
    db
        .collection('screams')
        .add(newScream)
        .then(doc =>{
            res.json({message : `document ${doc.id} created successfully`})
        })
        .catch(err =>{
            res.status(500).json({error : 'something went wrong'});
            console.error(err);
        })
});

const isEmail = (email) =>{
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)){
        return true;
    }else return false;
};
const isEmpty = (string) =>{
    if(string.trim() === ''){
        return true;
    }else
        return false;
};

let userId,token;
app.post('/signup',(req,res)=>{
    const newUser = {
        email : req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        handle : req.body.handle,
    };
    let errors = {};

    if(isEmpty(newUser.email)){
        errors.email = 'Must not be empty';
    }else if(!isEmail(newUser.email)){
        errors.email = 'Must be valid email Address';
    }

    if(isEmpty(newUser.password)){
        errors.password = 'Must not be empty';
    }

    if(newUser.password !== newUser.confirmPassword){
        errors.confirmPassword = 'Passwords Must Match';
    }

    if(isEmpty(newUser.handle)) errors.handle = 'Must not be Empty';

    if(Object.keys(errors).length > 0){
        return res.status(400).json(errors)
    }
    db.doc(`/users/${newUser.handle}`)
        .get()
        .then((doc) =>{
            if(doc.exists){
                return res.status(400).json({handle : 'This handle is already taken'});
            }else{
               return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email,newUser.password)
            }
        })
        .then(data =>{
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken =>{
            token = idToken;
            const userCredentials = {
                handle : newUser.handle,
                email : newUser.email,
                createdAt : new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(()=>{
            return res.status(200).json({token});
        })
        .catch((err) =>{
            if(err.code === 'auth/email-already-in-use'){
                res.status(400).json({email : "Email is already in use"})
            }else {
                return res.status(500).json({error: err.code})
            }
        })
});

app.post('/login', (req,res)=>{
    const user = {
        email : req.body.email,
        password : req.body.password
    };

    let errors = {};
    if(isEmpty(user.email)) errors.email = 'Must Not be Empty';
    else if(!isEmail(user.email)) errors.email = 'Must be valid Email Address';

    if(isEmpty(user.password)) errors.password = 'Must Not be Empty';
    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email,user.password)
        .then(data =>{
            return data.user.getIdToken();
        }).then(token =>{
            return res.json({token});
         }).catch(err =>{
             if(err.code === 'auth/wrong-password'){
                 return res.status(403).json({general : 'Wrong Credentials, Please try Again'})
             }else
             res.status(500).json({error : err.code})
    })
})

exports.api = functions.region('asia-east2').https.onRequest(app);
