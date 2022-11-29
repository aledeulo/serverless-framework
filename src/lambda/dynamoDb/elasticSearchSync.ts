import { DynamoDBStreamEvent, DynamoDBStreamHandler } from "aws-lambda";
import 'source-map-support/register';

export const handler:DynamoDBStreamHandler =  (event: DynamoDBStreamEvent) => {
	console.log('Processing event batch from DynamoDB: %s', JSON.stringify(event));

	for (const record of event.Records) {
		console.log('Processing record: %s', JSON.stringify(record));
	}
}