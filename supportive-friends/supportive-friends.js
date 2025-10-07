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
		let happyFriendMessage = '<Conversation with supportive-helper started.>';

		for (let i = 0; i < 50; i++) {
			const response = await this.unhappyFriend.sendMessage(happyFriendMessage);
			happyFriendMessage = '';
			let unhappyFriendMessage = '';
			let previousTool = null;

			for (const item of response) {
				if (item.type === 'function_call') {
					previousTool = item.name;
				} else if (item.type === 'message') {
					unhappyFriendMessage += item.content[0].text;
					console.log(`<${unhappyFriend.name}> ${unhappyFriendMessage}\n`);
				}
			}

			if (previousTool === 'end_conversation') {
				break;
			}

			if (unhappyFriendMessage.length > 0) {
				const happyFriendResponse = await this.happyFriend.sendMessage(unhappyFriendMessage);

				for (const item of happyFriendResponse) {
					if (item.type === 'message') {
						happyFriendMessage += item.content[0].text;
						console.log(`<${happyFriend.name}> ${happyFriendMessage}\n`);
					}
				}
			}

			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}
}
