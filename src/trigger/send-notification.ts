import {sendDiscordNotification} from '@/use-cases/notification'
import {schemaTask} from '@trigger.dev/sdk/v3'
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
  maxDuration: 30, // 30 seconds
  schema: notificationSchema,
  run: async notification => {
    await sendDiscordNotification(notification)

    return {
      message: 'Notification sent',
    }
  },
})
