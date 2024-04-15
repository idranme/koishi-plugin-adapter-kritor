import * as Kritor from './types'
import { KritorBot } from './bot'

export class Internal {
    constructor(private bot: KritorBot) {
    }

    /**
     * 发送消息
     */
    sendMessage(channelId: string, elements: Kritor.Element[]) {
        return new Promise<Kritor.SendMessageResponse__Output>((resolve) => {
            let contact: Kritor.Contact = { scene: 'GROUP', peer: channelId }
            if (channelId.startsWith('private:')) {
                contact.scene = "FRIEND"
                contact.peer = channelId.replace('private:', '')
            }
            const { messageClient } = this.bot.adapter.client
            messageClient.sendMessage({ contact, elements, retryCount: 3 }, (err, response) => {
                if (err) throw err
                resolve(response)
            })
        })
    }

    getCurrentAccount() {
        return new Promise<Kritor.GetCurrentAccountResponse__Output>((resolve) => {
            const { coreClient } = this.bot.adapter.client
            coreClient.getCurrentAccount({}, (err, response) => {
                if (err) throw err
                resolve(response)
            })
        })
    }
}