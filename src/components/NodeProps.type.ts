/**
 * NodeProps.type.ts
 * Copyright (c) 2024 Symplsoft, Inc. All rights reserved.
 * Not for distribution, reproduction, or use in derivative works
 * without permission.
 *
 * @author Matthew Ary <matthew.ary@symplisoft.com> < matthewj.c.ary@gmail.com>
 * Created on 2024-05-28.
 */

export interface BaseNodeProps {
  id: string
  label: string
  deletable?: boolean
  parentNode?: string
  description?: string
  hasSource?: boolean
  hasTarget?: boolean
  canHideSelf?: boolean
  canHideChildren?: boolean
}
