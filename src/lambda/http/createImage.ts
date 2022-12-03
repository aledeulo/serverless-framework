import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import * as middy from "middy";
import {cors} from 'middy/middlewares';

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});


const groupsTable = process.env.GROUPS_TABLE;
const imagesTable = process.env.IMAGES_TABLE;
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const handler = middy( async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const groupId = event.pathParameters.groupId
  const validGroupId = await groupExists(groupId)

  if (!validGroupId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Group does not exist for id: ' + groupId
      })
    }
  }

  // TODO: Create an image
  console.log('Attempting to create an image!!!');
  const itemId = uuid.v4();
  const timestamp = new Date().toISOString();
  const parsedBody = JSON.parse(event.body);

  const newItem = {
    imageId: itemId,
    groupId,
    timestamp,
    ...parsedBody,
    imageUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
  };

  console.log('Send item %s to save.', JSON.stringify(newItem));
  try {
      await docClient.put({
        TableName: imagesTable,
        Item: newItem
      }).promise();
    
      console.log('Image created successfully!!!');

      console.log('Generating image signed url');
      const url = getUploadUrl(itemId);

      return {
        statusCode: 201,
        body: JSON.stringify({
          newItem: newItem,
          uploadUrl: url
        })
      };
  } catch (error) {
    console.error('Create image failed for item: %s with error: %s', JSON.stringify(newItem), error.message);
    return {
      statusCode: 500,
      body: 'Failed with error: ' + error.message
    };
  }  
})

async function groupExists(groupId: string) {
  const result = await docClient
    .get({
      TableName: groupsTable,
      Key: {
        id: groupId
      }
    })
    .promise();

  console.log('Get group: ', result);
  return !!result.Item;
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: parseInt(urlExpiration)
  })
}


handler.use(
  cors({
    credentials: true
  })
)