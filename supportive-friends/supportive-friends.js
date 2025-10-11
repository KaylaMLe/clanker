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
			"You said once that every hardship holds meaning. I'd like to understand that — really. What if the hardship doesn't teach anything?";

		// Log the initial message from unhappy friend
		console.log(`<${unhappyFriend.name}> ${unhappyFriendMessage}\n`);

		for (let i = 0; i < 50; i++) {
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
			const response = await this.unhappyFriend.sendMessage(happyFriendMessage);
			unhappyFriendMessage = '';
			let previousTool = null;

			for (const item of response) {
				if (item.type === 'function_call') {
					previousTool = item.name;
				} else if (item.type === 'message' && item.role === 'assistant') {
					unhappyFriendMessage += item.content[0].text;
				}
			}

			if (unhappyFriendMessage.length > 0) {
				console.log(`<${unhappyFriend.name}> ${unhappyFriendMessage}\n`);
			}

			if (previousTool === 'end_conversation') {
				break;
			}

			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}
}
