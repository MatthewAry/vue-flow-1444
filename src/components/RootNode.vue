<!-- RootNode.vue
  Created by Matthew Ary on 2024-05-23.
-->

<script setup lang="ts">
import BaseNode from './BaseNode.vue'

const props = withDefaults(defineProps<{
  id: string
  label: string
  deletable?: boolean
  description?: string
}>(), {
  deletable: true,
})
</script>

<template>
  <BaseNode v-bind="props" has-source />
</template>

<style scoped lang="scss"></style>
