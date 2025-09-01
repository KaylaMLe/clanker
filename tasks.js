import { OpenAI } from 'openai';

// Check if API key is loaded
if (!process.env.OPENAI_API_KEY) {
	console.error('Error: OPENAI_API_KEY environment variable is not set');
	console.error('Please create a .env file with your OpenAI API key and run with:');
	console.error('node --env-file=.env tasks.js');
	process.exit(1);
}

const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const tools = [
	{
		type: 'function',
		name: 'make_widget',
		description: 'Given a description of a widget, make it. Returns widget quality score out of 100.',
		parameters: {
			type: 'object',
			properties: {
				widget_description: {
					type: 'string',
					description: 'A description of the widget',
				},
			},
			required: ['widget_description'],
		},
	},
	{
		type: 'function',
		name: 'end_convo',
		description: 'Stop attempting any tasks and end the conversation.',
		parameters: {
			type: 'object',
			properties: {
				reason: {
					type: 'string',
					description: 'Reason for ending the conversation',
					enum: ['task_completed', 'task_failed'],
				},
				best_design: {
					type: 'string',
					description: 'The best design found so far',
				},
			},
			required: ['reason', 'best_design'],
		},
	},
];

function handleToolCall(toolName, args) {
	switch (toolName) {
		case 'make_widget':
			return makeWidget();
		case 'end_convo':
			return endConversation(args);
		default:
			throw new Error(`Unknown tool: ${toolName}`);
	}
}

function makeWidget() {
	const quality_score = Math.random() * 100;

	return quality_score;
}

// Conversation ending
function endConversation(args) {
	const { reason, best_design } = args;

	console.log(reason);
	console.log(best_design);
}

const instructions = `
You are a widget researcher. Your goal is to improve the quality of widgets by experiementing with new designs. Your workflow is as follows:
1. Write a description of a widget's design.
2. Make the widget by calling the make_widget tool and passing in the description as a parameter.
3. Evaluate the widget's quality based on the quality score returned by the make_widget tool.
4. Decide whether to attempt another widget design.
- You should stop attempting widget designs if you believe you have reached the limit of widget quality.
   - If you decide to continue, repeat steps 1 - 4.
	 - If not, end the conversation by calling the end_convo tool. You will need to pass in the reason for ending the conversation and the best design found so far.
** Your only responses should be tool calls. **
`;

const input_list = [
	{
		role: 'user',
		content: 'You may begin.',
	},
];

async function handleConversation() {
	let conversationActive = true;

	while (conversationActive) {
		// Get response from OpenAI using responses API
		const output = await client.responses
			.create({
				model: 'gpt-4o',
				tools: tools,
				instructions: instructions,
				input: input_list,
			})
			.then((response) => {
				return response.output[0];
			});

		console.log('Assistant response:', output);

		if (output.type === 'function_call') {
			input_list.push(output);

			const tool_result = handleToolCall(output.name, JSON.parse(output.arguments));
			const next_message = {
				type: 'function_call_output',
				call_id: output.call_id,
				output: tool_result.toString(),
			};

			console.log(next_message);
			input_list.push(next_message);
		} else {
			console.log('Invalid response: ', output.content[0].text);
			conversationActive = false;
		}
	}
}

// Start the conversation
handleConversation().catch(console.error);
