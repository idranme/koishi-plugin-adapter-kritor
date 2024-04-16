import * as Kritor from './types'
import { KritorBot } from './bot'

export class Internal {
    constructor(private bot: KritorBot) {
    }

    /**
     * 发送消息
     */
    sendMessage(channelId: string, elements: Kritor.Element[]) {
        return new Promise<Kritor.SendMessageResponse__Output>((resolve, reject) => {
            let contact: Kritor.Contact = { scene: 'GROUP', peer: channelId }
            if (channelId.startsWith('private:')) {
                contact.scene = "FRIEND"
                contact.peer = channelId.replace('private:', '')
            }
            const { messageClient } = this.bot.adapter.client
            messageClient.sendMessage({ contact, elements, retryCount: 3 }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }

    getCurrentAccount() {
        return new Promise<Kritor.GetCurrentAccountResponse__Output>((resolve, reject) => {
            const { coreClient } = this.bot.adapter.client
            coreClient.getCurrentAccount({}, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }
}