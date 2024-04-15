import { Context, Element, MessageEncoder } from 'koishi'
import { KritorBot } from './bot'
import * as Kritor from './types'

export class KritorMessageEncoder<C extends Context = Context> extends MessageEncoder<C, KritorBot<C>> {
    private elements: Kritor.Element[] = []

    private async fetchMedia(type: Kritor.Element['type'], element: Element): Promise<Kritor.Element> {
        const url = element.attrs.src || element.attrs.url
        let data = 'file'
        let file: Buffer
        let fileUrl: string
        if (url.startsWith('http://') || url.startsWith('https://')) {
            fileUrl = url
            data = 'fileUrl'
        }
        if (data === 'file') {
            const capture = /^data:([\w/-]+);base64,(.*)$/.exec(url)
            file = capture?.[2] ? Buffer.from(capture[2], 'base64') : Buffer.from((await this.bot.http.file(url)).data)
        }
        const property = typeof type === 'string' ? type.toLowerCase() : type
        const res = {
            type,
            [property]: {
                data,
                file,
                fileUrl
            }
        }
        return res
    }

    async flush() {
        if (this.elements.at(-1)?.text?.text === '\n') {
            this.elements.pop()
        }
        this.elements = this.elements.reduce<Kritor.Element[]>(
            (acc, cur) => {
                const last = acc.at(-1)
                if (typeof cur.text?.text === 'string' && typeof last?.text?.text === 'string') {
                    last.text.text += cur.text.text
                } else {
                    acc.push(cur)
                }
                return acc
            },
            []
        )
        if (this.elements.length === 0) return

        const { messageId, messageTime } = await this.bot.internal.sendMessage(this.channelId, this.elements)
        const session = this.bot.session()
        session.event.message ??= {}
        session.event.message.id = messageId
        session.event.timestamp = messageTime * 1000
        this.results.push(session.event.message)
        session.app.emit(session, 'send', session)

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
                        uid: attrs.id.startsWith('u_') ? attrs.id : '' // TODO: getUidByUin
                    }
                })
                break
            case 'text':
                this.elements.push({
                    type: 'TEXT',
                    text: {
                        text: attrs.content
                    }
                })
                break
            case 'img':
            case 'image':
                this.elements.push(await this.fetchMedia('IMAGE', element))
                break
            case 'video':
                this.elements.push(await this.fetchMedia('VIDEO', element))
                await this.flush()
                break
            case 'audio':
                this.elements.push(await this.fetchMedia('VOICE', element))
                await this.flush()
                break
            case 'p': {
                const prev = this.elements.at(-1)
                if (prev && prev.text?.text !== '\n') {
                    this.elements.push({
                        type: 'TEXT',
                        text: {
                            text: '\n'
                        }
                    })
                }
                await this.render(children)
                const last = this.elements.at(-1)
                if (last?.text?.text !== '\n') {
                    this.elements.push({
                        type: 'TEXT',
                        text: {
                            text: '\n'
                        }
                    })
                }
                break
            }
            case 'br':
                this.elements.push({
                    type: 'TEXT',
                    text: {
                        text: '\n'
                    }
                })
                break
            case 'message':
                await this.flush()
                await this.render(children, true)
                break
            // case 'file':
            //     await this.flush()
            //     await this.sendMedia(element)
            //     break
            default:
                await this.render(children)
                break
        }
    }
}
