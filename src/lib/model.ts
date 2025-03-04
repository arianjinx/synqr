import {createOpenAI} from '@ai-sdk/openai'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const model = openai('gpt-4-turbo', {
  structuredOutputs: true,
})
