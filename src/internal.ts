import { init } from './grpc'
import { Contact, Element as KritorElement, SendMessageResponse__Output } from './types'

export class Internal {
    client: ReturnType<typeof init>

    /**
     * 发送消息
     */
    sendMessage(channelId: string, elements: KritorElement[]) {
        return new Promise<SendMessageResponse__Output>((resolve, reject) => {
            let contact: Contact = { scene: 'GROUP', peer: channelId }
            if (channelId.startsWith('private:')) {
                contact.scene = "FRIEND"
                contact.peer = channelId.replace('private:', '')
            }
            const { messageClient } = this.client
            messageClient.sendMessage({ contact, elements, retryCount: 3 }, (err, response) => {
                if (err) {
                    throw err
                }
                resolve(response)
            })
        })
    }
}