import { ConvoHandler } from '../convo-handler.js';
import * as researcher from './researcher.js';
import * as critic from './critic.js';

export class WidgetResearch {
	constructor() {
		this.researcher = new ConvoHandler(researcher.instructions, researcher.tools, researcher.handleToolCall);
		this.critic = new ConvoHandler(critic.instructions);
	}

	async startResearch() {
		await this.researcher.sendMessage('You may begin.');
	}
}
