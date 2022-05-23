// jshint esversion: 6
require("dotenv").config();
const express = require("express");
const request = require("request");
const app = express();
const https = require('node:https');
const mailchimp = require("@mailchimp/mailchimp_marketing");
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.json());

//mailchimp configure
// var apiKey = process.env.API_KEY;
mailchimp.setConfig({
    apiKey: process.env.USER_KEY,
    server: "us2" 
});

async function setConfig() {
  const response = await mailchimp.ping.get();
  console.log(response);
}

setConfig(); 

// singing up email
app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/signUp.html")
});

app.post("/", (req, res) =>{
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    const listId = "8eee285445";
    
    const subscribingUser = {
    firstName: firstName,
    lastName: lastName,
    email: email
    };

   const run = async() => {
        const response = await mailchimp.lists.addListMember(listId, {
            email_address: subscribingUser.email,
            status: "subscribed",
            merge_fields: {
            FNAME: subscribingUser.firstName,
            LNAME: subscribingUser.lastName
            }
        });
        console.log(response);
        // successfully signed up
        res.sendFile(__dirname + "/sucess.html");
        console.log(
        `Successfully added contact as an audience member. The contact's id is ${
        response.id
            }.`
        );
        
        app.post("/sucess", (req, res)=>{
            res.redirect("/");
            });
    }
        //fail singing up
    run().catch(e =>{
        res.sendFile(__dirname + "/failure.html");
        app.post("/failure", (req, res)=>{
            res.redirect("/");
            })
        });
        
    })


app.listen(PORT, ()=>{
    console.log("Server started at port 3000")
});
