const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.createUser = functions.https.onCall(async (data:any, context:any) => {
  try {
    const user = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: `${data.firstName} ${data.lastName}`,
      photoURL: data.photoURL || '' // Ensure you provide a photoURL if needed
    });

    await admin.firestore().collection('users').doc(user.uid).set({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      photoURL: user.photoURL || '',
      interests: '',
      bio: '',
      hobbies: ''
    });

    return { success: true, user: user };
  } catch (error) {
    return { success: false, error: error };
  }
});
