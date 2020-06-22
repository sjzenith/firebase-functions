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

//HTTP callable functions - adding a request
exports.addRequest = functions.https.onCall((data, context) => {
  if(!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can add requests'
    );
  }
  if(data.text.length > 30) {
      throw new functions.https.HttpsError(
      'invalid-argument',
      'request must be no more than 30 characters long'
    );
  }
  //cloud functions must return promise or values
  return admin.firestore().collection('requests').add({
    text: data.text,
    upvotes: 0
  });
});

//cloud functions -> async, await사용
//함수이름앞에 async붙이고 비동기처리할부분 await붙인다.
//맨끝부분 처리에서만 return 한번해준다.
//async는 promise를 리턴해준다
// // upvote callable function
exports.upvote = functions.https.onCall(async (data, context) => {
  // check auth state
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'only authenticated users can vote up requests'
    );
  }
  // get refs for user doc & request doc
  const user = admin.firestore().collection('users').doc(context.auth.uid);
  const request = admin.firestore().collection('requests').doc(data.id);

  const doc = await user.get();
  // check thew user hasn't already upvoted
  if(doc.data().upvotedOn.includes(data.id)){
    throw new functions.https.HttpsError(
      'failed-precondition', 
      'You can only vote something up once'
    );
  }

  // update the array in user document
  await user.update({
    upvotedOn: [...doc.data().upvotedOn, data.id]
  });
  
  // update the votes on the request
  return request.update({
    upvotes: admin.firestore.FieldValue.increment(1)
  });

});
/*cloud funcion -> promise, then사용
// // upvote callable function
exports.upvote = functions.https.onCall((data, context) => {
  // check auth state
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'only authenticated users can vote up requests'
    );
  }
  // get refs for user doc & request doc
  const user = admin.firestore().collection('users').doc(context.auth.uid);
  const request = admin.firestore().collection('requests').doc(data.id);

  return user.get().then(doc => {
    // check thew user hasn't already upvoted
    if(doc.data().upvotedOn.includes(data.id)){
      throw new functions.https.HttpsError(
        'failed-precondition', 
        'You can only vote something up once'
      );
    }

    // update the array in user document
    return user.update({
      upvotedOn: [...doc.data().upvotedOn, data.id]
    })
    .then(() => {
      // update the votes on the request
      return request.update({
        upvotes: admin.firestore.FieldValue.increment(1)
      });
    });

  });
}); 
*/

// firestore trigger for tracking activity
exports.logActivities = functions.firestore.document('/{collection}/{id}')
  .onCreate((snap, context) => {
    console.log(snap.data());

    const activities = admin.firestore().collection('activities');
    const collection = context.params.collection;

    if (collection === 'requests') {
      return activities.add({ text: 'a new tutorial request was added' });
    }
    if (collection === 'users') {
      return activities.add({ text: 'a new user signed up'});
    }

    return null;
});