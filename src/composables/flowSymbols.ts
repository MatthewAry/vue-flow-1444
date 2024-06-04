/**
 * flowSymbols.ts
 *
 * @author Matthew Ary
 * Created on 2024-05-28.
 */

import type { VueFlowStore } from '@vue-flow/core'
import type { InjectionKey } from 'vue'

export const Flow: InjectionKey<VueFlowStore> = Symbol('Flow')
