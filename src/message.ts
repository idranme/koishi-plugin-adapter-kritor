import { Context, Element, MessageEncoder } from 'koishi'
import { KritorBot } from './bot'
import { Element_input } from './type'
import { adapterMedia } from './utils'

export class KritorMessageEncoder<C extends Context = Context> extends MessageEncoder<C, KritorBot<C>> {
    private elements: Element_input[] = []

    private addResult(msgId: string) {
        if (!msgId)
            return
        const session = this.bot.session()
        this.results.push({ id: msgId })
        session.messageId = msgId
        session.app.emit(session, 'send', session)
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
                    type:'REPLY',
                    reply: {
                        messageId: attrs.id
                    }
                })
                break
            case 'at':
                this.elements.push({
                    type: 'AT',
                    at: {
                        uid: attrs.id.replace('kritor:','')
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
                this.elements.push(await adapterMedia(this.bot.http, 'image', element))
                break
            case 'video':
                this.elements.push(await adapterMedia(this.bot.http, 'video', element))
                break
            case 'audio':
                this.elements.push(await adapterMedia(this.bot.http, 'voice', element))
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
