import _ from 'lodash';
import OpenAI from 'openai';

export default ({ strapi }) => ({
	async processJSON(assistentID, data) {
		const { assistents, apiKey } = strapi.config.get('ai');
		
		if ( _.has(assistentID, assistents) ) {
			throw new Error(`AI assistent "${assistentID} is not supported."`)
		}
		
		const openai = new OpenAI({ apiKey });
		
		const assistentRun = await openai.beta.threads.createAndRun({
			assistant_id: assistents[assistentID],
			thread: {
				messages: [{
					role: 'user',
					content: JSON.stringify(data),
				}]
			}
		})

		let isAssistentRunCompleted = await openai.beta.threads.runs.retrieve(assistentRun.thread_id, assistentRun.id);

		while (isAssistentRunCompleted.status === 'in_progress' || isAssistentRunCompleted.status === 'queued') {
			isAssistentRunCompleted = await openai.beta.threads.runs.retrieve(assistentRun.thread_id, assistentRun.id);
			await new Promise(resolve => setTimeout(resolve, 1000));
		}

		if (isAssistentRunCompleted.status !== 'completed') {
			throw new Error('Unable to complete assistent run.')
		}

		const result = await openai.beta.threads.messages.list(assistentRun.thread_id);
		const assistentMessage = result.data.find(message => message.role === 'assistant')

		if (assistentMessage?.content?.[0].type !== 'text') {
			throw new Error('Assistent message is not in expected format.')
		}

		if (_.isEmpty(assistentMessage?.content?.[0]?.text?.value)) {
			throw new Error('Received no content from assistent.')
		}

		return JSON.parse(assistentMessage?.content?.[0]?.text?.value);
	},
})
