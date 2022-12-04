import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from "middy";
import {cors} from 'middy/middlewares';
import { CreateGroupRequest } from "../../requests/CreateGroupRequests";
import { createGroup } from "../../businessLogic/groups";


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event);

  const newGroup: CreateGroupRequest = JSON.parse(event.body)
  const authHeader = event.headers.Authorization;
  const split = authHeader.split(' ');
  const token = split[1];

  try {
    const group = await createGroup(newGroup, token);
    return {
      statusCode: 201,
      body: JSON.stringify({
        group
      })
    };
  } catch (error) {
    console.error('handler: Create group failed with an error. See response body');
    return {
      statusCode: 500,
      body: error.message
    };
  }
})



handler.use(
  cors({
    credentials: true
  })
)