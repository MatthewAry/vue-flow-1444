<!-- TheLetterA.vue
  Created by Matthew Ary on 2024-05-31.
-->

<script setup lang="ts">
import type { Edge, Node } from '@vue-flow/core'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import RootNode from '../components/RootNode.vue'
import SiloNode from '../components/SiloNode.vue'
import ComponentNode from '../components/ComponentNode.vue'
import { useLayout } from '../composables/useLayout'
import type { Align, Direction } from '../composables/useLayout'
import { Flow } from '../composables/flowSymbols'
import { provide, ref, nextTick, onMounted } from 'vue'

const position = { x: 0, y: 0 }

const nodes = ref<Node[]>([
  {
    id: '1',
    type: 'root',
    position,
    data: {
      label: 'Root',
    },
  },
])

const edges = ref<Edge[]>([])

type NodeTypes = 'root' | 'silo' | 'component'
function addNodesAndEdges(names: string[], type: NodeTypes, parent?: string) {
  const listLen = nodes.value.length
  nodes.value.push(...names.map((label, index) => ({
    id: String(listLen + index + 1),
    type,
    position,
    data: {
      label,
      parentNode: parent,
    },
  } as Node)))
  if (parent) {
    edges.value.push(...names.map((_, index) => ({
      id: `e${parent}-${listLen + index + 1}`,
      source: parent,
      target: String(listLen + index + 1),
    } as Edge)))
  }
}

function generateLetters(length: number) {
  return Array.from({ length }, (_, i) => String.fromCharCode(65 + i))
}

addNodesAndEdges(generateLetters(5), 'silo', '1')
addNodesAndEdges(generateLetters(5), 'component', '2')
addNodesAndEdges(generateLetters(5), 'component', '3')
addNodesAndEdges(generateLetters(10), 'component', '4')

const flow = useVueFlow()
const { layout } = useLayout()
onMounted(() => {
  flow.addEdges(edges.value)
})

async function layoutGraph(direction: Direction, align: Align) {
  await layout(nodes, edges.value, direction, align)
  // setTimeout(() => {
  //   nodes.value = layout(nodes.value, edges.value, direction, align)
  // }, 100)
  nextTick(() => {
    flow.fitView()
  })
}

function intLayoutGraph() {
  layoutGraph('LR', 'DL')
}

provide(Flow, flow)
</script>

<template>
  <VueFlow :nodes="nodes" :edges="edges" :min-zoom="0.05" @nodes-initialized="intLayoutGraph" >
    <template #node-root="{ id, data }">
      <RootNode :id="id" v-bind="data" />
    </template>
    <template #node-silo="{ id, data }">
      <SiloNode :id="id" v-bind="data" />
    </template>
    <template #node-component="{ id, data }">
      <ComponentNode :id="id" v-bind="data" />
    </template>
    <div style="position: relative; z-index: 9999 !important;">
      zoom: {{ flow.viewport.value.zoom }}
      <VBtn color="primary" @click="layoutGraph('LR', 'DL')">
        Layout
      </VBtn>
    </div>
  </VueFlow>
</template>

<style lang="scss">
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
