import { Universal, h } from 'koishi'
import { KritorBot } from './bot'
import { _kritor_common_Element_ElementType__Output, EventStructure__Output, Contact__Output, Element__Output } from './types'

export async function createSession(bot: KritorBot, input: EventStructure__Output) {
    if (input.event === 'message' || input.message) {
        const session = bot.session()
        session.type = 'message'
        await decodeMessage(bot, input.message, session.event.message = {}, session.event)
        session.subtype = session.isDirect ? 'private' : 'group'
        if (session.content.length > 0) return session
    }
}

function decodeGuildChannelId(contact: Contact__Output) {
    // 某些 SDK 未实现 contact.scene
    if (contact.scene === 'FRIEND' || contact.peer !== contact.subPeer) {
        return [undefined, 'private:' + contact.peer]
    } else {
        return [contact.peer, contact.peer]
    }
}

async function decodeMessage(
    bot: KritorBot,
    data: EventStructure__Output['message'],
    message: Universal.Message = {},
    payload: Universal.MessageLike = message
) {
    message.id = data.messageId
    message.elements = parseElement(data.elements)
    message.content = message.elements.join('')

    if (!payload) return message

    const [guildId, channelId] = decodeGuildChannelId(data.contact)
    payload.user = {
        id: data.sender.uid,
        name: data.sender.nick
    }
    payload.timestamp = data.time * 1000
    payload.guild = guildId && { id: guildId }
    payload.channel = { id: channelId, type: guildId ? Universal.Channel.Type.TEXT : Universal.Channel.Type.DIRECT }

    return message
}

function parseElement(elements: Element__Output[]) {
    const result: h[] = []
    for (const v of elements) {
        let type = v.type as number | string
        if (v.text) {
            type = 0
        }
        switch (type) {
            case 0:
            case 'TEXT':
                result.push(h.text(v.text.text))
                break
            case 1:
            case 'AT':
                result.push(h.at(v.at.uid))
                break
            case 2:
            case 'FACE':
                result.push(h.text(JSON.stringify(v.face)))
                break
            case 3:
            case 'BUBBLEFACE':
                break
            case 4:
            case 'REPLY':
                result.push(h.quote(v.reply.messageId))
                break
            case 5:
            case 'IMAGE':
                result.push(h.image(v.image.fileUrl))
                break
            case 6:
            case 'VOICE':
                break
            case 7:
            case 'VIDEO':
                result.push(h.video(v.video.fileUrl))
                break
            case 22:
            case 'FILE':
                result.push(h.file(v.file.url))
                break
        }
    }
    return result
}