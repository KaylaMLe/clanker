import { ConvoHandler } from '../convo-handler.js';
import * as unhappyFriend from './unhappy-friend.js';
import * as happyFriend from './happy-friend.js';

export class SupportiveFriends {
	constructor() {
		this.unhappyFriend = new ConvoHandler(
			unhappyFriend.name,
			unhappyFriend.instructions,
			unhappyFriend.tools,
			unhappyFriend.handleToolCall
		);
		this.happyFriend = new ConvoHandler(happyFriend.name, happyFriend.instructions);
	}

	async startConvo() {
		let happyFriendMessage = 'Hi!';

		for (let i = 0; i < 50; i++) {
			const response = await this.unhappyFriend.sendMessage(happyFriendMessage);
			let newResponse = '';
			let previousTool = null;

			for (const item of response) {
				if (item.type === 'function_call') {
					previousTool = item.name;
				} else if (item.type === 'function_call_output') {
					newResponse += item.output;
					console.log(newResponse, '\n');
				} else if (item.type === 'message') {
					newResponse += item.content[0].text;
				}
			}

			if (newResponse.length > 0) {
				const happyFriendResponse = await this.happyFriend.sendMessage(newResponse);

				if (previousTool === 'end_conversation') {
					break;
				}

				happyFriendMessage = '';

				for (const item of happyFriendResponse) {
					if (item.type === 'message') {
						happyFriendMessage += item.content[0].text;
					}
				}
			}
		}
	}
}
