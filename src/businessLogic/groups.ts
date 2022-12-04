import * as uuid from 'uuid';
import { Group } from "../models/Group";
import { GroupAccess } from "../dataLayer/groupAccess";
import { getUserId } from "../auth/utils";
import { CreateGroupRequest } from "../requests/CreateGroupRequests";

const groupAccess = new GroupAccess();

export async function getAllGroups():Promise<Group[]> {
	return groupAccess.getAllGroups();
}

export async function createGroup(request: CreateGroupRequest, token: string): Promise<Group> {
	const itemId = uuid.v4();
	const userId = getUserId(token);
	return await groupAccess.createGroup({
		id: itemId,
		userId,
		name: request.name,
		description: request.description
	});
}