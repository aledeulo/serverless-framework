
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register';
import { verify } from "jsonwebtoken";
import { JwtToken } from "../../auth/JwtToken";
const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJV1Xw9YdqdcIBMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1kZWVtazhnY2lkN2lyc25xLnVzLmF1dGgwLmNvbTAeFw0yMjEyMDIw
NTE5MzhaFw0zNjA4MTAwNTE5MzhaMCwxKjAoBgNVBAMTIWRldi1kZWVtazhnY2lk
N2lyc25xLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMoLgdVq5ThjCmehuXpa0/YuG6xnq6GBi1E87eHLQMieMyAgE8bgUYHkk1xl
Grv85cC2lqbkIgQjgg/H6S6MReL84PIQe+wKCOyLsgiSxy6y3jTphEeu519sVHlQ
3DMnNAsHJI/nHvvyzZ7nwKPZ4ezitqDrXjy2ubnCy1N6UDQ2TDM6q60uGB6niB/o
kTKa/Sbdr6YdZLPhcxz8WbA2BORtPdLf4QcEnhJmXs1uAyvdLFFWpwdIosdDG0HJ
ywTwEfqeYmVoCm9JZX5yNTxCK05WPsQWws2CXHnoR/LiMOQ+F8dJCH0riVoed8uY
46PmhAiXDQO1VRB40e2aVNA2iG0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUaZtGnQb4Sf/nXYYnUb9tTu5E0AkwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQAGuJORxxydoHspFn/0RfrWmg0pKlwzYWxAGDr2fo0f
D24Jna+7qLZi3jKfE625kEycw9x7+Qs+GNDGUWk12KjlBVAdzDuwjTgIUf9IBb9Y
1k4zBRmiF49/l+UI2HunbpUBiOm8plJktr+YFjKEYmdW9K6dQvfrb2pf5QSCEDtn
UH0ypgZJA332Osm/jBS7qRLGocEw41ckKjQ33iSnU7LZ9vsMpg1Ug2BtWp1Wdrsc
vJThV8Q0RcgaNSmnGG3jJCNOfsyYVH4FFmZQeNRT6Zu8x+SYnVn9h4XYDzn0ihbQ
nF7NrRvXLFiZdAePVkFS1Y9nbe/DEV4o4ozSc3iVWKLO
-----END CERTIFICATE-----`;

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
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

function verifyToken(authHeader: string): JwtToken {
	if (!authHeader) {
		throw new Error("verifyToken: No authorization header");
	}

	if (!authHeader.toLocaleLowerCase().startsWith('bearer')) {
		throw new Error("verifyToken: Invalid authorization token");		
	}

	const split = authHeader.split(' ');
  const token = split[1];
  return verify(
      token, 
      certificate,
      { algorithms: ['RS256'] }
    ) as JwtToken;
}
