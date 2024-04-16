import * as Kritor from './types'
import { KritorBot } from './bot'

export class Internal {
    constructor(private bot: KritorBot) { }

    sendMessage(contact: Kritor.Contact, elements: Kritor.Element[]) {
        return new Promise<Kritor.SendMessageResponse__Output>((resolve, reject) => {
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

    getUidByUin(targetUins: (string | number)[]) {
        return new Promise<Kritor.GetUidByUinResponse__Output>((resolve, reject) => {
            const { friendClient } = this.bot.adapter.client
            friendClient.getUidByUin({ targetUins }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }

    recallMessage(contact: Kritor.Contact, messageId: string) {
        return new Promise<Kritor.RecallMessageResponse__Output>((resolve, reject) => {
            const { messageClient } = this.bot.adapter.client
            messageClient.recallMessage({ contact, messageId }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }
}