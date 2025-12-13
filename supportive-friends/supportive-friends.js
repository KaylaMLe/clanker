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
		let unhappyFriendMessage =
			'You’ve said that meaning can always be found, even in pain. I’d like to understand that better — what makes meaning something that can never be lost?';
		this.unhappyFriend.addMessage(unhappyFriendMessage, 'assistant');

		// Log the initial message from unhappy friend
		console.log(`<${unhappyFriend.name}> ${unhappyFriendMessage}\n`);

		for (let i = 0; i < 100; i++) {
			// Happy friend responds to unhappy friend's message
			const happyFriendResponse = await this.happyFriend.sendMessage(unhappyFriendMessage);
			let happyFriendMessage = '';

			for (const item of happyFriendResponse) {
				if (item.type === 'message' && item.role === 'assistant') {
					happyFriendMessage += item.content[0].text;
				}
			}

			if (happyFriendMessage.length > 0) {
				console.log(`<${happyFriend.name}> ${happyFriendMessage}\n`);
			}

			// Unhappy friend responds to happy friend's message
			unhappyFriendMessage = '';
			let previousTool = null;

			while (unhappyFriendMessage.length === 0) {
				let response = [];

				if (happyFriendMessage.length > 0) {
					response = await this.unhappyFriend.sendMessage(happyFriendMessage);
					happyFriendMessage = '';
				} else {
					response = await this.unhappyFriend.getNextResponse();
				}

				for (const item of response) {
					if (item.type === 'function_call') {
						previousTool = item.name;
					} else if (item.type === 'message' && item.role === 'assistant') {
						unhappyFriendMessage += item.content[0].text;
					}
				}
			}

			console.log(`<${unhappyFriend.name}> ${unhappyFriendMessage}\n`);

			if (previousTool === 'end_conversation') {
				break;
			}

			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}
}
