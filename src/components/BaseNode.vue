<!-- BaseNode.vue
  Created by Matthew Ary on 2024-05-23.
-->

<script setup lang="ts">
import { type GraphNode, Handle, Position, useNode } from '@vue-flow/core'
import { mdiCreation, mdiDelete, mdiEye, mdiEyeOff, mdiPencil, mdiPlusCircle } from '@mdi/js'
import { Flow } from '../composables/flowSymbols'
import type { BaseNodeProps } from './NodeProps.type'
import { defineProps, defineSlots, inject, ref, watch, computed, unref, withDefaults } from 'vue'

const props = withDefaults(defineProps<BaseNodeProps>(), {
  deletable: true,
  canHideSelf: false,
  canHideChildren: true,
})

const slots = defineSlots<{
  default?: (props: { description: string }) => any
}>()

const vueFlow = inject(Flow)!

const { node, connectedEdges } = useNode(props.id)

// TODO: Locate Parent Node by Graph Edge
const parentNode = computed(() => {
  const edge = connectedEdges.value.find(edge => edge.target === props.id)
  return edge ? vueFlow.findNode(edge.source) : null
})

const children = computed(() => {
  const edges = connectedEdges.value.filter(edge => edge.source === props.id)
  const t = edges.map(edge => vueFlow.findNode(edge.target)).filter(v => v != null)
  return t as GraphNode[]
})

// Used for keeping track of the parent's previous position
const parentOld = ref(parentNode.value)
watch(() => parentNode.value, (parent) => {
  // console.log({ parent, parentOld })
  const p = unref(parent)
  const pOld = unref(parentOld)
  if (p != null) {

    // Move relative to parent
    if (pOld != null && (p.position.x !== pOld.position.x || p.position.y !== pOld.position.y)) {
      node.position = {
        x: p.position.x + (node.position.x - pOld.position.x),
        y: p.position.y + (node.position.y - pOld.position.y),
      }
    }
    parentOld.value = { ...p }
  }
}, { deep: true })

const childrenHidden = ref(false)
function toggleVisibility(_node = node, hideSelf = false) {
  const descendants = hideSelf ? [_node] : []
  const stack = [_node]

  while (stack.length > 0) {
    const currentNode = stack.pop()
    if (currentNode == null)
      continue
    const edges = vueFlow.getConnectedEdges(currentNode.id).filter(edge => edge.source === currentNode.id)

    for (const edge of edges) {
      const targetNode = vueFlow.findNode(edge.target)
      if (targetNode == null)
        continue
      descendants.push(targetNode)
      stack.push(targetNode)
    }
  }

  for (const descendant of descendants) {
    descendant.hidden = !descendant.hidden
  }
  childrenHidden.value = !childrenHidden.value
}

function toggleChildrenVisibility() {
  if (props.canHideChildren != null && !props.canHideChildren)
    return
  toggleVisibility(node, false)
}

function toggleSelfAndChildrenVisibility() {
  if (!props.canHideSelf)
    return
  toggleVisibility(node, true)
}

</script>

<template>
  <div class="node">
    <div v-ripple class="add-above add-node rounded-t">
      <VIcon :icon="mdiPlusCircle" />
    </div>
    <VCard v-bind="$attrs" class="d-flex flex-column">
      <div class="d-flex align-stretch">
        <div>
          <VCardTitle class="d-flex align-center">
            {{ label }} <VBtn icon variant="text" size="24" class="ml-2">
              <VIcon :icon="mdiPencil" size="24" />
            </VBtn>
          </VCardTitle>
          <VCardText>
            <slot :description="description!">
              {{ description }}
            </slot>
            <!-- <div class="d-flex">
              <pre>{{ node }}</pre>
            </div> -->
          </VCardText>
          <VCardActions>
            <VTooltip location="bottom">
              <template #activator="{ props }">
                <VBtn v-if="deletable" icon variant="text" size="small" v-bind="props">
                  <VIcon :icon="mdiDelete" size="28" />
                </VBtn>
              </template>
              <span>Delete Node</span>
            </VTooltip>
            <VTooltip location="bottom">
              <template #activator="{ props }">
                <VBtn v-if="children.length > 0" variant="text" icon size="small" v-bind="props" @click="toggleChildrenVisibility()">
                  <VIcon :icon="childrenHidden ? mdiEye : mdiEyeOff" size="28" />
                </VBtn>
              </template>
              <span>Hide Children</span>
            </VTooltip>
            <VTooltip location="bottom">
              <template #activator="{ props }">
                <VBtn variant="text" icon size="small" v-bind="props">
                  <VIcon :icon="mdiCreation" size="28" />
                </VBtn>
              </template>
              <span>Use AI</span>
            </VTooltip>
            <VTooltip location="bottom">
              <template #activator="{ props }">
                <VBtn variant="text" icon size="small" v-bind="props">
                  <VIcon icon="M17.5 21h1v-2.5H21v-1h-2.5V15h-1v2.5H15v1h2.5zm.5 2q-2.075 0-3.537-1.463T13 18t1.463-3.537T18 13t3.538 1.463T23 18t-1.463 3.538T18 23M7 9h10V7H7zm4.675 12H5q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v6.7q-.725-.35-1.463-.525T18 11q-.275 0-.513.012t-.487.063V11H7v2h6.125q-.45.425-.812.925T11.675 15H7v2h4.075q-.05.25-.062.488T11 18q0 .825.15 1.538T11.675 21" size="28" />
                </VBtn>
              </template>
              <span>Add Note</span>
            </VTooltip>
          </VCardActions>
        </div>
        <div v-ripple class="add-child add-node d-flex align-center pr-2">
          <VIcon :icon="mdiPlusCircle" />
        </div>
      </div>
    </VCard>
    <div v-ripple class="add-below add-node rounded-b">
      <VIcon :icon="mdiPlusCircle" />
    </div>
  </div>
  <Handle v-if="hasSource" :id="id" type="source" :position="Position.Right" connectable="single" />
  <Handle v-if="hasTarget" :id="id" type="target" :position="Position.Left" connectable="single" />
</template>

<style scoped lang="scss">
@use '@/styles/settings';
.vue-flow__handle {
  width: 12px;
  height: 12px;
  z-index: 3;
  // background: initial;
  // border: none;
  // &-right {
  //   right: -10px;
  // }
}
.v-card-title {
  .v-icon {
    transition-property: opacity;
    opacity: 0.2;
  }
  &:hover {
    .v-icon {
      opacity: 1;
    }
  }
}
.node {
  .add-node {
    cursor: pointer;
    .v-icon {
      transition-property: opacity;
      opacity: 0;
    }
  }
  &:hover {
    .add-node {
      .v-icon {
        opacity: 0.3;
      }
      &:hover {
        .v-icon {
          opacity: 1;
        }
      }
    }
  }
  .v-card {
    z-index: 2;
  }
  .add-below,
  .add-above {
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    height: 30px;
  }
  --distance: 24px;
  .add-above {
    top: calc(-1 * var(--distance));
  }
  .add-below {
    bottom: calc(-1 * var(--distance));
  }
}
</style>
