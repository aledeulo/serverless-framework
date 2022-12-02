import { CustomAuthorizerEvent, CustomAuthorizerResult, CustomAuthorizerHandler } from "aws-lambda";
import 'source-map-support/register';
import { verify } from "jsonwebtoken";
import { JwtToken } from "../../auth/JwtToken";

const secret = process.env.AUTH_0_SECRET;

export const handler:CustomAuthorizerHandler =async (event:CustomAuthorizerEvent):Promise<CustomAuthorizerResult> => {
	console.log('handler: Received authorization request: ', JSON.stringify(event));
	try {
		const decodedToken: JwtToken = verifyToken(event.authorizationToken);
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

function verifyToken(authHeader: string): JwtToken{
	if (!authHeader) {
		throw new Error("verifyToken: No authorization header");
	}

	if (!authHeader.toLocaleLowerCase().startsWith('bearer')) {
		throw new Error("verifyToken: Invalid authorization token");
		
	}

	const split = authHeader.split(' ');
	const token = split[1];
	return verify(token, secret) as JwtToken;
}
