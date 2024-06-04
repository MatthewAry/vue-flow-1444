/**
 * useLayout.ts
 *
 * @author Matthew Ary
 * Created on 2024-05-23.
 */
import dagre from '@dagrejs/dagre'
import { Position, useVueFlow } from '@vue-flow/core'
import type { Connection, Edge, Node } from '@vue-flow/core'
import { ref, nextTick } from 'vue'

/**
 * The direction of the layout.
 * Direction for rank nodes. Can be TB, BT, LR, or RL, where T = top, B = bottom, L = left, and R = right.
 */
export type Direction = 'LR' | 'TB' | 'RL' | 'BT'
/**
 * The alignment of the layout.
 * Alignment for rank nodes. Can be UL, UR, DL, or DR, where U = up, D = down, L = left, and R = right.
 */
export type Align = 'UL' | 'UR' | 'DL' | 'DR'

export function useLayout() {
  const { findNode } = useVueFlow()

  const graph = ref(new dagre.graphlib.Graph())

  const previousDirection = ref('LR')

  async function layout(nodes: Ref<Node[]>, edges: (Edge | Connection)[], direction: Direction, align: Align) {
    // we create a new graph instance, in case some nodes/edges were removed, otherwise dagre would act as if they were still there
    const dagreGraph = new dagre.graphlib.Graph()

    graph.value = dagreGraph

    dagreGraph.setDefaultEdgeLabel(() => ({}))

    const isHorizontal = direction === 'LR'
    dagreGraph.setGraph({
      rankdir: direction,
      // marginx: 0,
      // marginy: 0,
      // nodesep: 50, // Gap between nodes in the same rank on the Y axis
      ranksep: 100, // Gap between ranks on the X axis
      // align,
    })

    previousDirection.value = direction

    for (const node of nodes.value) {
      // if you need width+height of nodes for your layout, you can use the dimensions property of the internal node (`GraphNode` type)
      const graphNode = findNode(node.id)
      if (!graphNode)
        throw new Error(`Node with id ${node.id} not found`)

      // console.log(graphNode)
      dagreGraph.setNode(node.id, { width: graphNode.dimensions.width || 150, height: graphNode.dimensions.height || 50 })
    }

    for (const edge of edges)
      dagreGraph.setEdge(edge.source, edge.target)

    dagre.layout(dagreGraph, {
      // ranker: 'longest-path`',
      // labelpos: 'l',
    })

    /**
     * This is a hacky solution to make the layout system work and be stable.
     */
    let stable = false
    let stableCount = 0
    const requiredStableIterations = 3
    let iterations = 0
    const maxIterations = 300

    while (stableCount < requiredStableIterations && iterations < maxIterations) {
      dagre.layout(dagreGraph)

      const newNodes = nodes.value.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        const { data, ...rest } = node
        return {
          data,
          ...rest,
          targetPosition: isHorizontal ? Position.Left : Position.Top,
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
          position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
        }
      })

      stable = JSON.stringify(newNodes) === JSON.stringify(nodes.value)

      if (stable) {
        stableCount++
      }
      else {
        stableCount = 0
      }

      nodes.value = newNodes

      await nextTick()

      iterations++
    }
  }

  return { graph, layout, previousDirection }
}
