### Run emulator
firebase emulators:start --only functions

### Set Twilio Auth
firebase functions:config:set twilio.account_sid="YOUR_ACCOUNT_SID" twilio.auth_token="YOUR_AUTH_TOKEN" twilio.phone_number="YOUR_PHONE_NUMBER"