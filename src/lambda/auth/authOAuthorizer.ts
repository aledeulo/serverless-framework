import { CustomAuthorizerEvent, CustomAuthorizerResult, CustomAuthorizerHandler } from "aws-lambda";
import 'source-map-support/register';
import { verify } from "jsonwebtoken";
import { JwtToken } from "../../auth/JwtToken";
import  * as AWS from "aws-sdk";

const client = new AWS.SecretsManager();
const secretId = process.env.AUTH_0_SECRET_ID;
const secretField = process.env.AUTH_0_SECRET_FIELD;
let cachedSecret:string;

export const handler:CustomAuthorizerHandler =async (event:CustomAuthorizerEvent):Promise<CustomAuthorizerResult> => {
	console.log('handler: Received authorization request: ', JSON.stringify(event));
	try {
		const decodedToken: JwtToken = await verifyToken(event.authorizationToken);
		console.log('handler: Request verified successfully');
		return {
			principalId: decodedToken.sub,
			policyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Action: 'execute-api:Invoke',
						Effect: 'Allow',
						Resource: '*'
					}
				]
			}
		};
	} catch (error) {
		console.error('handler: Authorization has failed for with error: %s', error.message);
	}
	return {
		principalId: 'user',
		policyDocument: {
			Version: '2012-10-17',
			Statement: [
				{
					Action: 'execute-api:Invoke',
					Effect: 'Deny',
					Resource: '*'
				}
			]
		}
	};
}

async function verifyToken(authHeader: string): Promise<JwtToken>{
	if (!authHeader) {
		throw new Error("verifyToken: No authorization header");
	}

	if (!authHeader.toLocaleLowerCase().startsWith('bearer')) {
		throw new Error("verifyToken: Invalid authorization token");		
	}

	try {
		const split = authHeader.split(' ');
		const token = split[1];
		console.log('verifyToken: Received token');
		const secretObject:any = await getSecret();
		const secret = secretObject[secretField];
		console.log('verifyToken: Secret has been successfully fetched from SSM');
		return verify(token, secret) as JwtToken;
	} catch (error) {
		throw new Error("verifyToken: Failed to fetch the secret from SSM. Error: " + error.message);	
	}
}

async function getSecret() {
	console.log('getSecret: Trying to access to ssm with id: %s', secretId);
	if (cachedSecret) {
		console.log('getSecret: Secret is returned from cached value');
		return cachedSecret;
	}

	try {
		const data = await client.getSecretValue({
			SecretId: secretId
		}).promise();
		console.log('getSecret: Fetched secret from SSM');
		cachedSecret = data.SecretString;
		console.log('getSecret: Extracted data from secret');
		return JSON.parse(cachedSecret);
	} catch (error) {
		throw new Error("getSecret: Failed to fetch the secret from SSM. Error: " + error.message);		
	}
}
