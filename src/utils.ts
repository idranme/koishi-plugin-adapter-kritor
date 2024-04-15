import { Universal, h } from 'koishi'
import { KritorBot } from './bot'
import { _kritor_common_Element_ElementType__Output, EventStructure__Output, Contact__Output, Element__Output, Sender__Output } from './types'

export async function createSession(bot: KritorBot, input: EventStructure__Output) {
    if (input.type === 1) {
        const session = bot.session()
        session.type = 'message'
        await decodeMessage(bot, input.message, session.event.message = {}, session.event)
        session.subtype = session.isDirect ? 'private' : 'group'
        if (session.content.length > 0) return session
    }
}

function decodeGuildChannelId(contact: Contact__Output, sender: Sender__Output) {
    if (contact.scene === 1) {
        return [undefined, 'private:' + sender.uin]
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

    const [guildId, channelId] = decodeGuildChannelId(data.contact, data.sender)
    payload.user = {
        id: data.sender.uin.toString(),
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
        let type = v.type
        if (v.text) {
            type = 0
        }
        switch (type) {
            case 0:
                result.push(h.text(v.text.text))
                break
            case 1:
                result.push(h.at(v.at.uid))
                break
            case 2:
                result.push(h.text(JSON.stringify(v.face)))
                break
            case 3:
                break
            case 4:
                result.push(h.quote(v.reply.messageId))
                break
            case 5:
                result.push(h.image(v.image.fileUrl))
                break
            case 6:
                break
            case 7:
                result.push(h.video(v.video.fileUrl))
                break
            case 22:
                result.push(h.file(v.file.url))
                break
        }
    }
    return result
}