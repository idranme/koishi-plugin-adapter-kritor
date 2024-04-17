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

    getGroupList(refresh?: boolean) {
        return new Promise<Kritor.GetGroupListResponse__Output>((resolve, reject) => {
            const { groupClient } = this.bot.adapter.client
            groupClient.getGroupList({ refresh }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }

    getGroupInfo(groupId: number | string) {
        return new Promise<Kritor.GetGroupInfoResponse__Output>((resolve, reject) => {
            const { groupClient } = this.bot.adapter.client
            groupClient.getGroupInfo({ groupId }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }

    // sham 报错 UNKNOWN
    getGroupMemberInfo(groupId: number | string, targetUin: number | string, refresh?: boolean) {
        return new Promise<Kritor.GetGroupMemberInfoResponse__Output>((resolve, reject) => {
            const { groupClient } = this.bot.adapter.client
            groupClient.getGroupMemberInfo({ groupId, targetUin, target: 'targetUin', refresh }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }

    // sham 报错 UNKNOWN
    getGroupMemberList(groupId: number | string, refresh?: boolean) {
        return new Promise<Kritor.GetGroupMemberListResponse__Output>((resolve, reject) => {
            const { groupClient } = this.bot.adapter.client
            groupClient.getGroupMemberList({ groupId, refresh }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }

    kickMember(groupId: number | string, targetUin: number | string, rejectAddRequest?: boolean, kickReason?: string) {
        return new Promise<Kritor.KickMemberResponse__Output>((resolve, reject) => {
            const { groupClient } = this.bot.adapter.client
            groupClient.kickMember({ groupId, targetUin, target: 'targetUin', rejectAddRequest, kickReason }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }

    banMember(groupId: number | string, targetUin: number | string, duration: number) {
        // duration 单位：秒
        return new Promise<Kritor.BanMemberResponse__Output>((resolve, reject) => {
            const { groupClient } = this.bot.adapter.client
            groupClient.banMember({ groupId, targetUin, target: 'targetUin', duration }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }

    getFriendProfileCard(targetUins: (string | number)[]) {
        return new Promise<Kritor.GetFriendProfileCardResponse__Output>((resolve, reject) => {
            const { friendClient } = this.bot.adapter.client
            friendClient.getFriendProfileCard({ targetUins }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }

    getFriendList(refresh?: boolean) {
        return new Promise<Kritor.GetFriendListResponse__Output>((resolve, reject) => {
            const { friendClient } = this.bot.adapter.client
            friendClient.getFriendList({ refresh }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }

    getMessage(contact: Kritor.Contact, messageId: string) {
        return new Promise<Kritor.GetMessageResponse__Output>((resolve, reject) => {
            const { messageClient } = this.bot.adapter.client
            messageClient.getMessage({ contact, messageId }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }

    // sham 报错 UNKNOWN
    getHistoryMessage(contact: Kritor.Contact, startMessageId?: string, count?: number) {
        return new Promise<Kritor.GetHistoryMessageResponse__Output>((resolve, reject) => {
            const { messageClient } = this.bot.adapter.client
            messageClient.getHistoryMessage({ contact, startMessageId, count }, (err, response) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(response)
                }
            })
        })
    }
}