import {model} from '@/lib/model'
import {sendDiscordNotification} from '@/use-cases/notification'
import {schemaTask} from '@trigger.dev/sdk/v3'
import {generateText} from 'ai'
import {z} from 'zod'
export const notificationSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  embeds: z
    .array(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        url: z.string().optional(),
        color: z.number().optional(),
        timestamp: z.string().optional(),
        footer: z
          .object({
            text: z.string(),
          })
          .optional(),
        author: z
          .object({
            name: z.string(),
          })
          .optional(),
      }),
    )
    .optional(),
})

export const sendNotificationTask = schemaTask({
  id: 'send-notification',
  maxDuration: 120, // 2 minutes
  schema: notificationSchema,
  run: async notification => {
    // Process embed descriptions with AI if they exist
    if (notification.embeds && notification.embeds.length > 0) {
      // Process each embed with description
      for (let i = 0; i < notification.embeds.length; i++) {
        const embed = notification.embeds[i]
        if (embed.description) {
          // Process the description with AI
          const processedResult = await generateText({
            model,
            prompt: `
Your task is to perform the following actions:
1 - Summarize the text delimited by triple backticks in a concise way max 300 characters.
2 - Ensure the summary maintains all key information.
3 - Keep the tone professional and informative.

Use the following format:
Summary: <your concise summary>

Text: \`\`\`${embed.description}\`\`\`
`,
            temperature: 0.3, // Lower temperature for more focused/deterministic output
          })

          // Update the embed description with the processed text
          // Extract just the summary part if the AI included the format
          const summaryMatch = processedResult.text.match(/Summary: ([\s\S]+)/)
          let finalDescription = summaryMatch
            ? summaryMatch[1].trim()
            : processedResult.text.trim()

          // Truncate to 297 characters and add "..." if exceeding 300 characters
          if (finalDescription.length > 300) {
            finalDescription = `${finalDescription.slice(0, 297)}...`
          }

          notification.embeds[i].description = finalDescription
        }
      }
    }

    await sendDiscordNotification(notification)

    return {
      message: 'Notification sent with AI-processed descriptions',
    }
  },
})
