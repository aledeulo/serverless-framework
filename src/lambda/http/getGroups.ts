import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { getAllGroups } from "../../businessLogic/groups";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  try {
    const groups = await getAllGroups();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        result: groups
      })
    };
  } catch (error) {
    console.error('handler: Get groups failed with an error. See response body');
    return {
      statusCode: 500,
      body: error.message
    };
  }  
}
