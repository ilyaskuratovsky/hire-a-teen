### Deploy
firebase deploy --only functions --debug
firebase deploy --only functions:myFunctionName --debug


### Run emulator
npm run build
firebase emulators:start --only functions

### Set Twilio Auth
firebase functions:config:set twilio.account_sid="YOUR_ACCOUNT_SID" twilio.auth_token="YOUR_AUTH_TOKEN" twilio.phone_number="YOUR_PHONE_NUMBER"


###twilioCallback
http://127.0.0.1:5001/teenhelper-2f71b/us-central1/twilioStatusCallback


curl -X POST http://127.0.0.1:5001/teenhelper-2f71b/us-central1/twilioStatusCallback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
  -d "SmsStatus=delivered" \
  -d "MessageStatus=delivered" \
  -d "To=+1234567890" \
  -d "From=+19876543210" \
  -d "AccountSid=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

curl -X POST https://twiliostatuscallback-tcaakmasiq-uc.a.run.app \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
  -d "SmsStatus=delivered" \
  -d "MessageStatus=delivered" \
  -d "To=+1234567890" \
  -d "From=+19876543210" \
  -d "AccountSid=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
