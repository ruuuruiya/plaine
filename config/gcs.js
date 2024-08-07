import { Storage } from '@google-cloud/storage';

const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: process.env.GCS_PRIVATE_KEY.split(String.raw`\n`).join("\n")
    },
});

const bucketGcs = storage.bucket(process.env.GCS_BUCKET_NAME);

export default bucketGcs;
