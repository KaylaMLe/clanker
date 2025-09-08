import { OpenAI } from 'openai';

// Check if API key is loaded
if (!process.env.OPENAI_API_KEY) {
	console.error('Error: OPENAI_API_KEY environment variable is not set');
	console.error('Please create a .env file with your OpenAI API key.');
	process.exit(1);
}

const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export class ConvoHandler {
	constructor(name = '', instructions = '', tools = [], toolCallHandler = null, model = 'gpt-4o') {
		this.name = name;
		this.instructions = instructions;
		this.convoHistory = [];
		this.tools = tools;
		this.toolCallHandler = toolCallHandler;
		this.model = model;
	}

	async sendMessage(content, role = 'user') {
		this.convoHistory.push({ role, content });
		const convoHistoryLength = this.convoHistory.length;
		let responseOutput = [];

		while (responseOutput.length === 0) {
			try {
				const output = await client.responses
					.create({
						model: this.model,
						tools: this.tools,
						instructions: this.instructions,
						input: this.convoHistory,
					})
					.then((response) => {
						return response.output;
					});
				responseOutput = output;
			} catch (error) {
				console.error('Error sending message. Waiting 1 second and retrying...\n', error);
				setTimeout(async () => {}, 1000);
			}
		}

		for (const item of responseOutput) {
			this.convoHistory.push(item);

			if (item.type === 'function_call' && this.toolCallHandler) {
				//TODO: what if toolCallHandler fails?
				const toolResult = await this.toolCallHandler(item.name, JSON.parse(item.arguments));
				const toolOutput = {
					type: 'function_call_output',
					call_id: item.call_id,
					output: toolResult,
				};

				this.convoHistory.push(toolOutput);
			} else if (item.type === 'message') {
				console.log(`<${this.name}>: ${item.content[0].text}\n`);
			} else {
				throw new Error(
					`Unhandled message of type ${item.type}${
						item.type === 'function_call' ? ' (tool call handler is null)' : ''
					}:\n${item}`
				);
			}
		}

		// return only the new messages, including tool outputs
		return this.convoHistory.slice(convoHistoryLength);
	}
}
