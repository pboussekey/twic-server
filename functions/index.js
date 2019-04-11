const functions = require('firebase-functions');
const cors = require('cors')({ origin:true});
const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');
const firebase = require('firebase');
const uuid = require('uuid/v4');

const configPath = './config/gc.json';
const gcconfig = {
  projectId: 'twicfiles',
  keyFileName: configPath
};
const fbconfig = {
  apiKey: 'AIzaSyAB_Xk8PfntqGQ47KtyUDuJFLCHlKpZG0Y',
  databaseURL: 'https://twicapp-5d95f.firebaseio.com'
};

const {Storage} = require('@google-cloud/storage');
const { Logging } = require('@google-cloud/logging');
const logging = new Logging();
const log = logging.log('TWIC_UPLOAD_LOG');

const gcs = new Storage(gcconfig);

firebase.initializeApp(fbconfig);

exports.upload = functions.https.onRequest((req, res) => {
  return cors(req,  res, () => {
    if(req.method !== 'POST'){
      return res.status(500).json({message : 'Not allowed'});
    }
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')
    || !req.headers.user || !parseInt(req.headers.user)){
      return res.status(401).json({ error : 'Unauthorized!!' });
    }

    let token = req.headers.authorization.substring(7);
    let user = req.headers.user;
    let fileData;

    const busboy = new Busboy({headers : req.headers});

    busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
      const filePath = path.join(os.tmpdir(), filename);
      fileData = { filePath: filePath, type : mimeType, name : filename };
      file.pipe(fs.createWriteStream(filePath));
    });

    busboy.on('finish', ()   => {
      const bucket = gcs.bucket('twicfiles-ccf31.appspot.com');
      const id = uuid();
      let filePath = user + '/' + id + '-' + fileData.name;
      firebase.auth().signInWithCustomToken(token).then(
          () => bucket.upload(
           fileData.filePath,
           {  uploadType : 'media',
           destination : filePath,
           metadata : {
             metadata : {
               contentType : fileData.type,
               firebaseStorageDownloadTokens : id
             }

           }})
        ).then((uploadData) => res.status(201).json({
            filename : fileData.name,
            bucketname : encodeURIComponent(uploadData[0].name),
            token : id
          })
        )
        .catch(error => {
          return res.status(401).json({ error: error });
        });
      });

      return busboy.end(req.rawBody);
    });

  });
