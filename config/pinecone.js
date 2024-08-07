import { Pinecone } from '@pinecone-database/pinecone';

const pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

const pineconeIndex = pineconeClient.index(process.env.PINECONE_INDEX_NAME);

export default pineconeIndex;
