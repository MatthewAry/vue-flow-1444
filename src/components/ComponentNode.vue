<!-- ComponentNode.vue
  Created by Matthew Ary on 2024-05-23.
-->

<script setup lang="ts">
import BaseNode from './BaseNode.vue'
import type { BaseNodeProps } from './NodeProps.type'

const props = withDefaults(defineProps<BaseNodeProps>(), {
  deletable: true,
})
</script>

<template>
  <BaseNode v-bind="props" has-source has-target color="red" />
</template>

<style scoped lang="scss"></style>
