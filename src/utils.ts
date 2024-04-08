import { Context, Universal, h } from 'koishi'
import { KritorBot } from './bot'
import { PushMessageBody__Output, _kritor_common_Element_ElementType__Output } from './types'

type MessageBody = PushMessageBody__Output

const yellow = '\x1b[33m'
const reset = '\x1b[0m'
const green = '\x1b[32m'

/**
 * 创建 session
 */
export async function createSession(bot: KritorBot<Context>, message: MessageBody) {
    const session = bot.session()
    session.type = 'message'
    session.event.message = await adaptMessage(message)
    session.elements = session.event?.message?.elements
    // const name = session?.event?.message?.member?.name ?? message?.sender?.nick
    //bot.logger.info(`机器人:${yellow}${bot.config.selfId}${reset} 收到消息: 发送者: ${green}${name}${reset} 内容: ${session.event.message.content}`)
    let channelId = message.contact.peer
    if (channelId !== message.contact.subPeer) {
        channelId = 'private:' + channelId
        session.subtype = 'private'
    }
    session.userId = message.sender.uid
    session.channelId = channelId
    session.guildId = channelId
    session.content = session.event.message?.content ?? ''
    if (session?.event?.member) {
        session.event.member = session.event.message.member
    }
    session.elements = await messageToElement(bot, message)
    session.event.timestamp = session.event.message.timestamp
    return session
}

async function adaptMessage(message: MessageBody): Promise<Universal.Message> {
    return {
        id: message.messageId,
        content: JSON.stringify(message.elements),
        channel: {
            id: message.contact.peer,
            type: 0
        },
        guild: {
            id: message.contact.peer,
        },
        user: {
            id: message.sender.uid,
        },
        timestamp: message.time,
        createdAt: message.time,
    }
}

/**
 * 将消息转为 Element[]
 * @param bot 
 * @param detail 
 * @returns 
 */
async function messageToElement(bot: KritorBot<Context>, detail: MessageBody) {
    const elements: h[] = []
    for (var i of detail.elements ?? []) {
        if (i.text) {
            let text = i.text.text
            elements.push(h.text(text))
            continue
        }
        const messageType = i.type as number | string
        switch (messageType) {
            case 0:
                let text = i.text.text
                elements.push(h.text(text))
                break
            case 1:
                elements.push(h.at(i.at.uid))
                break
            case 2:
                elements.push(h.text(JSON.stringify(i.face)))
                break
            case 3:
                break
            case 4:
                elements.push(h.quote(i.reply.messageId))
                break
            case 5:
                elements.push(h.image(i.image.fileUrl))
                break
            case 6:
                break
            case 7:
                elements.push(h.video(i.video.fileUrl))
                break
            case 22:
                elements.push(h.file(i.file.url))
                break
            default:
                return
        }
    }

    return elements
}