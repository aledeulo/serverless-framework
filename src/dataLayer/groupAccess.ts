import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Group } from "../models/Group";

export class GroupAccess {
	private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient();
	private readonly groupsTable:string = process.env.GROUPS_TABLE;

	async getAllGroups(): Promise<Group[]> {
		console.log('getAllGroups: Get groups');
		const res = await this.docClient.scan({
			TableName: this.groupsTable
		}).promise();
		return res.Items as Group[];
	}

	async createGroup(group: Group): Promise<Group> {
		console.log('createGroup: Create group');
		await this.docClient.put({
			TableName: this.groupsTable,
			Item: group
		  }).promise();
		  return group;
	}
}