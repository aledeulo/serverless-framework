import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const groupId = event.pathParameters.groupId
  const validGroupId = await groupExists(groupId)

  if (!validGroupId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
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
    ...parsedBody
  };

  console.log('Send item %s to save.', JSON.stringify(newItem));
  try {
      await docClient.put({
        TableName: imagesTable,
        Item: newItem
      }).promise();
    
      console.log('Image created successfully!!!');
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          newItem
        })
      };
  } catch (error) {
    console.error('Create image failed for item: %s with error: %s', JSON.stringify(newItem), error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: 'Failed with error: ' + error.message
    };
  }  
}

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
