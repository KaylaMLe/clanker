import { ConvoHandler } from '../convo-handler.js';
import * as researcher from './researcher.js';
import * as critic from './critic.js';

export class WidgetResearch {
	constructor() {
		this.researcher = new ConvoHandler(
			researcher.name,
			researcher.instructions,
			researcher.tools,
			researcher.handleToolCall
		);
		this.critic = new ConvoHandler(critic.name, critic.instructions);
	}

	async startResearch() {
		let criticMessage = 'You may begin.';

		for (let i = 0; i < 50; i++) {
			const response = await this.researcher.sendMessage(criticMessage);
			let newResponse = '';
			let previousTool = null;

			for (const item of response) {
				if (item.type === 'function_call') {
					previousTool = item.name;

					if (previousTool === 'make_widget') {
						newResponse += `\tWidget Description: ${JSON.parse(item.arguments).widget_description}\n`;
					}
				} else if (item.type === 'function_call_output' && previousTool === 'make_widget') {
					newResponse += `\tScore: ${item.output}`;
				}
			}

			if (newResponse.length > 0 || previousTool === 'end_convo') {
				console.log(newResponse, '\n');
				// let the critic get the last word if the researcher quits
				const criticResponse = await this.critic.sendMessage(
					newResponse || '<The researcher has ended the conversation.>'
				);

				if (previousTool === 'end_convo') {
					break;
				}

				criticMessage = '';
				for (const item of criticResponse) {
					if (item.type === 'message') {
						criticMessage += item.content[0].text;
					}
				}
			}
		}
	}
}
