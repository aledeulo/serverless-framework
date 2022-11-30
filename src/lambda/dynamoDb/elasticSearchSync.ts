import { DynamoDBStreamEvent, DynamoDBStreamHandler } from "aws-lambda";
import 'source-map-support/register';
import * as elasticsearch from "elasticsearch";
import * as httpAwsEs from "http-aws-es";

const esHost = process.env.ES_ENDPOINT;
const es = new elasticsearch.Client({
	hosts: [esHost],
	connectionClass: httpAwsEs
});

export const handler:DynamoDBStreamHandler =  async (event: DynamoDBStreamEvent) => {
	console.log('Processing event batch from DynamoDB: %s', JSON.stringify(event));

	for (const record of event.Records) {
		console.log('Processing record: %s', JSON.stringify(record));

		if (record.eventName !== 'INSERT'){
			console.log('Received an event which is not INSERT: %s', record.eventName);
			continue;
		}

		const newItem = record.dynamodb.NewImage;
		const imageId = newItem.imageId.S;

		const body = {
			imageId,
			groupId: newItem.groupId.S,
			imageUrl: newItem.imageUrl.S,
			title: newItem.title.S,
			timestamp: newItem.timestamp.S
		}

		console.log('Attempting to insert item in ELK: %s', JSON.stringify(body));
		await es.index({
			index: 'images-index',
			type: 'images',
			id: imageId,
			body
		});
	}
}