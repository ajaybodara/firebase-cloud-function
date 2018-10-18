const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

exports.addAllotment = functions.https.onRequest( (req, res) =>  {
    const name = req.query.name;
    const email = req.query.email;
    const files = req.query.files;

    let fileObject = createFileObject(files);

    return admin.database().ref('/allotments').push({
        "person": {
            "emailAddress": email,
            "name": name
         },
        "files": fileObject
    }).then( (snapshot) => {
        return res.redirect(303, snapshot.ref.toString());
    });
});

exports.setFileStatus = functions.database.ref('/allotments/{pushId}/files')
   .onCreate( (snapshot, context) => {
       const files = snapshot.val();
       for( var i = 0; i < files.length; i++) {
           files[i].status = "active";
        }
       return snapshot.ref.set(files);
});

exports.sendEmail = functions.database.ref('/allotments/{pushId}/person')
    .onCreate( (snapshot, context) => {
        const emailAddress = snapshot.val().emailAddress;
        const header = "Welcome To Test Firebase APP";
        const body = "Welcome To Test Firebase APP Body.";

        return snapshot.ref.parent.child("emails").set({
                "recipient": emailAddress,
                "header": header,
                "body": body
            }
        );
});

function createFileObject(files) {
    let fileObject = [];
    for( var i = 0; i < files.length; i++) {
        var object = {
            "filename": files[i]
        };
        fileObject.push(object);
    }
    return fileObject;
}