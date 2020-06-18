const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

//auth trigger (new user sign up)
exports.newUserSignUp = functions.auth.user().onCreate(user => {
  console.log('user created', user.email, user.uid);
  //promise또는 value를 리턴해줘야 한다
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    upvotedOn: []
  });
});

//auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete(user => {
  console.log('user deleted',user.email, user.uid);

  const doc = admin.firestore().collection('users').doc(user.uid);
  return doc.delete();
});