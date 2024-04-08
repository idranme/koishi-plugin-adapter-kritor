import { init, sendMessage } from './api'
import { Contact } from './generated/kritor/common/Contact'

export class Internal {
    client: ReturnType<typeof init>

    /**
     * 发送消息
     * @param channelId
     * @param content
     * @returns
     */
    async sendMessage(channelId, content) {
        let contact: Contact = { scene: 'GROUP', peer: channelId }
        if (channelId.startsWith('private:')) {
            contact.scene = "FRIEND"
            contact.peer = channelId.replace('private:', '')
        }
        let res: { messageId: string, messageTime: number }
        sendMessage(this.client, contact, content, 3, (messageId, messageTime) => {
            res = { messageId, messageTime }
        })
        return res
    }
}