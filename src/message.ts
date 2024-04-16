import { Context, Element, MessageEncoder, base64ToArrayBuffer } from 'koishi'
import { KritorBot } from './bot'
import { getContact } from './utils'
import * as Kritor from './types'

type MediaElementType = 'IMAGE' | 'VOICE' | 'VIDEO'

export class KritorMessageEncoder<C extends Context = Context> extends MessageEncoder<C, KritorBot<C>> {
    private elements: Kritor.Element[] = []
    private contact: Kritor.Contact

    async prepare() {
        this.contact = getContact(this.channelId)
    }

    private async fetchMedia(type: MediaElementType, element: Element): Promise<Kritor.Element> {
        const url: string = element.attrs.src ?? element.attrs.url
        let data: 'file' | 'fileName' | 'filePath' | 'fileUrl'
        let file: Uint8Array
        let fileUrl: string
        if (url.startsWith('http://') || url.startsWith('https://')) {
            fileUrl = url
            data = 'fileUrl'
        } else {
            data = 'file'
            const capture = /^data:([\w/-]+);base64,(.*)$/.exec(url)
            if (capture?.[2]) {
                file = new Uint8Array(base64ToArrayBuffer(capture[2]))
            } else {
                const res = await this.bot.http.file(url)
                file = new Uint8Array(res.data)
            }
        }
        const key = type.toLowerCase() as Lowercase<typeof type>
        const res = {
            type,
            [key]: {
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

        const { messageId, messageTime } = await this.bot.internal.sendMessage(this.contact, this.elements)
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
            case 'at': {
                if (this.contact.scene === 'GROUP') {
                    let uid: string
                    if (attrs.type === 'all') {
                        // https://github.com/whitechi73/OpenShamrock/blob/59d762eecf6627bd5480cd308e2f6171118a3bc0/xposed/src/main/java/qq/service/msg/NtMsgConvertor.kt#L139C21-L139C24
                        uid = 'all'
                    } else {
                        const id: string = attrs.id
                        uid = id.startsWith('u_') ? id : Object.values((await this.bot.internal.getUidByUin([id])).uidMap)[0]
                    }
                    this.elements.push({
                        type: 'AT',
                        at: {
                            uid
                        }
                    })
                }
                break
            }
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
            case 'face': {
                const [id, flag] = attrs.id.split(':')
                this.elements.push({
                    type: 'FACE',
                    face: {
                        id,
                        isBig: flag === 'big'
                    }
                })
                break
            }
            case 'a': {
                await this.render(children)
                const prev = this.elements.at(-1)
                if (prev.type === 'TEXT') {
                    prev.text.text += ` ( ${attrs.href} )`
                }
                break
            }
            default:
                await this.render(children)
                break
        }
    }
}
