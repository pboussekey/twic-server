const functions = require('firebase-functions');
const cors = require('cors')({ origin:true});
const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');
const firebase = require('firebase');
const uuid = require('uuid/v4');
const extractFrames = require('ffmpeg-extract-frames');


const configPath = './config/gc.json';
const gcconfig = {
  projectId: 'twicapp',
  keyFileName: configPath
};
const fbconfig = {
  apiKey: 'AIzaSyDcNKi1wey5Dif8m2W-np7VRKkH5O_aRNI',
  databaseURL: 'https://twicapp-5d95f.firebaseio.com'
};

const {Storage} = require('@google-cloud/storage');
const { Logging } = require('@google-cloud/logging');
const logging = new Logging();
const log = logging.log('TWIC_UPLOAD_LOG');
const METADATA = {
  resource: {
    type: 'cloud_function',
    labels: {
      function_name: 'upload',
      region: 'us-central1'
    }
  }
};

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

    function _upload(fileData, filepath, id){
      id = id || uuid();
      const bucket = gcs.bucket('twicapp-5d95f.appspot.com');
      return firebase.auth().signInWithCustomToken(token).then(
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
        )
    }

    const busboy = new Busboy({headers : req.headers});
    busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
      const filePath = path.join(os.tmpdir(), filename);
      fileData = { filePath: filePath, type : mimeType, name : filename };
      file.pipe(fs.createWriteStream(filePath, { resumable: false }));
    });

    var preview;

      busboy.on('finish', ()   => {
        const bucket = gcs.bucket('twicapp-5d95f.appspot.com');
        const id = uuid();
        const id_thumb = uuid();
        let filePath = user + '/' + id + '-' + fileData.name;
          firebase.auth().signInWithCustomToken(token).then(
              () =>  bucket.upload(
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
                type : fileData.type,
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
