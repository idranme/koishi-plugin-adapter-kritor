import { init } from './grpc'
import { Contact__Output, Element__Output, SendMessageResponse } from './types'

export class Internal {
    client: ReturnType<typeof init>

    /**
     * 发送消息
     */
    sendMessage(channelId: string, elements: Element__Output[]) {
        return new Promise<SendMessageResponse>((resolve, reject) => {
            let contact: Contact__Output = { scene: 'GROUP', peer: channelId, _subPeer: 'subPeer' }
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