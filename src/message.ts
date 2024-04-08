import { Context, Element, MessageEncoder } from 'koishi'
import { KritorBot } from './bot'
import { KritorElement } from './types'

export class KritorMessageEncoder<C extends Context = Context> extends MessageEncoder<C, KritorBot<C>> {
    private elements: KritorElement[] = []

    private addResult(msgId: string) {
        if (!msgId)
            return
        const session = this.bot.session()
        this.results.push({ id: msgId })
        session.messageId = msgId
        session.app.emit(session, 'send', session)
    }

    private async fetchMedia(type: KritorElement['type'], element: Element): Promise<KritorElement> {
        const { attrs } = element
        const url = attrs.src || attrs.url
        const capture = /^data:([\w/-]+);base64,(.*)$/.exec(url)
        const file = capture?.[2] ? Buffer.from(capture[2], 'base64') : Buffer.from((await this.bot.http.file(url)).data)
        const property = typeof type === 'string' ? type.toLowerCase() : type
        const res = {
            type,
            [property]: {
                data: 'file',
                file
            }
        }
        return res
    }

    async flush() {
        if (!this.elements) return
        let res = (await this.bot.internal.sendMessage(this.channelId, this.elements)).messageId
        this.addResult(res)
        this.elements = []
    }

    async visit(element: Element) {
        const { type, attrs, children } = element
        switch (type) {
            case 'quote':
                this.elements.push({
                    type: 'REPLY',
                    reply: {
                        messageId: attrs.id
                    }
                })
                break
            case 'at':
                this.elements.push({
                    type: 'AT',
                    at: {
                        uid: attrs.id.replace('kritor:', '')
                    }
                })
                break
            case 'text':
                this.elements.push({
                    text: {
                        text: attrs.content
                    }
                })
                break
            case 'img':
                this.elements.push(await this.fetchMedia('IMAGE', element))
                break
            case 'video':
                this.elements.push(await this.fetchMedia('VIDEO', element))
                break
            case 'audio':
                this.elements.push(await this.fetchMedia('VOICE', element))
                break
            // case 'file':
            //     await this.flush()
            //     await this.sendMedia(element)
            //     break
            default:
                break
        }
    }
}
