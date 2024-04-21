import { KritorBot } from './bot'
import { Internal } from './internal'
import * as Kritor from './types'

export default KritorBot

declare module '@satorijs/core' {
    interface Session {
        kritor: Kritor.EventStructure__Output & Internal
    }
}