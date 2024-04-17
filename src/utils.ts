import { Universal, h } from 'koishi'
import { KritorBot } from './bot'
import * as Kritor from './types'

export async function createSession(bot: KritorBot, input: Kritor.EventStructure__Output) {
    if (input.type === 1) {
        const session = bot.session()
        session.type = 'message'
        await decodeMessage(bot, input.message, session.event.message = {}, session.event)
        session.subtype = session.isDirect ? 'private' : 'group'
        if (session.content.length > 0 && session.channelId !== undefined) return session
    }
}

function decodeGuildChannelId(contact: Kritor.Contact__Output, sender: Kritor.Sender__Output) {
    if (!contact.scene) {
        return [contact.peer, contact.peer]
    } else if (contact.scene === 1) {
        const userId = contact.peer === sender.uid ? sender.uin : contact.peer
        return [undefined, 'private:' + userId]
    }
}

export async function decodeMessage(
    bot: KritorBot,
    data: Kritor.PushMessageBody__Output,
    message: Universal.Message = {},
    payload: Universal.MessageLike = message
) {
    message.id = data.messageId
    message.elements = await parseElement(bot, data.elements ?? [], message)
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

async function parseElement(
    bot: KritorBot,
    elements: Kritor.Element__Output[],
    message: Universal.Message
) {
    const result: h[] = []
    for (const v of elements) {
        switch (v.type) {
            case 0:
            case undefined:
                result.push(h.text(v.text.text))
                break
            case 1:
                result.push(h.at(v.at.uin.toString()))
                break
            case 2: {
                let id = `${v.face.id}`
                if (v.face.isBig) {
                    id += `:big`
                }
                result.push(h('face', { id, platform: bot.platform }))
                break
            }
            case 3:
                break
            case 4: {
                message.quote = {
                    id: v.reply.messageId
                }
                break
            }
            case 5:
                result.push(h.image(v.image.fileUrl, { [`${bot.platform}:face`]: v.image.subType === 1 }))
                break
            case 6:
                result.push(h.video(v.voice.fileUrl))
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

export function decodeLoginUser(data: Kritor.GetCurrentAccountResponse__Output): Universal.User {
    const id = data.accountUin.toString()
    return {
        id,
        name: data.accountName,
        avatar: `http://q.qlogo.cn/headimg_dl?dst_uin=${id}&spec=640`
    }
}

export function getContact(channelId: string): Kritor.Contact {
    if (channelId.startsWith('private:')) {
        return {
            scene: 'FRIEND',
            peer: channelId.replace('private:', '')
        }
    } else {
        return { scene: 'GROUP', peer: channelId }
    }
}

export function decodeGuild(data: Kritor.GroupInfo__Output): Universal.Guild {
    const id = data.groupId.toString()
    return {
        id,
        name: data.groupName,
        avatar: `https://p.qlogo.cn/gh/${id}/${id}/640`
    }
}

export function decodeUser(data: Kritor.ProfileCard__Output): Universal.User {
    const id = data.uin.toString()
    return {
        id,
        name: data.nick,
        avatar: `http://q.qlogo.cn/headimg_dl?dst_uin=${id}&spec=640`
    }
}

export function decodeFriendList(data: Kritor.FriendInfo__Output[]): Universal.User[] {
    const result: Universal.User[] = []
    for (const v of data) {
        const id = v.uin.toString()
        result.push({
            id,
            name: v.nick,
            avatar: `http://q.qlogo.cn/headimg_dl?dst_uin=${id}&spec=640`
        })
    }
    return result
}