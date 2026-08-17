# 表单渲染数据流修正设计

## 背景

`widget-renderer` 当前通过 `const renderFormData = props.formData` 保存父组件表单模型的对象引用，并在模板中对该引用使用 `v-model`。这会让子组件绕过事件契约直接修改 prop 内部数据。

`useFormRenderData` 当前还使用空值合并判断字段是否已经初始化，导致用户主动清空为 `null` 的字段在组件列表变化后恢复默认值；删除组件后，对应字段也会残留在表单模型中。

## 目标行为

1. `widget-renderer` 不直接修改 `formData` prop。
2. 字段组件通过 `modelValue` 接收当前值，通过 `update:modelValue` 提交新值。
3. 完整 `formData` 继续作为只读运行上下文传给校验函数和组件事件函数。
4. `defaultValue` 只在字段 ID 首次进入表单模型时写入。
5. 用户值为 `null`、`false`、`0` 或空字符串时均视为已经初始化，不得恢复默认值。
6. widget 被删除或清空后，其字段 ID 必须从表单模型中移除。
7. 修改已有 widget 的 `defaultValue` 不覆盖当前表单值。

## 组件数据流

`center-render-panel` 持有由 `useFormRenderData` 创建的表单模型。顶层 widget 和行容器内 widget 都将各自字段值传给 `widget-renderer`：

```text
formData[widget.id]
    -> widget-renderer.modelValue
    -> Element Plus 字段组件
    -> update:modelValue
    -> formData[widget.id] = newValue
```

`widget-renderer` 仍接收完整的 `formData`，但仅用于生成校验规则、组件属性和事件上下文。字段更新必须通过 `update:modelValue` 事件返回拥有表单模型的渲染层。

`row-container-renderer` 不创建第二份表单状态。它负责把行容器内字段的更新事件写回同一个 `formData`。

## 表单模型同步

`useFormRenderData` 每次检测到扁平化 widget ID 列表变化时执行同步：

1. 生成当前普通 widget 的 ID 集合。
2. 删除 `formData` 中不在集合内的 key。
3. 对集合内尚未拥有 key 的 widget，写入 `widget.defaultValue ?? null`。
4. 对已经拥有 key 的 widget，不修改其当前值。

同步的监听源只需要 widget ID 列表。默认值变化不属于模型结构变化，因此不会触发覆盖。

## 测试

增加回归测试验证：

- 新字段使用默认值首次初始化。
- 已有字段值为 `null` 后，新增、删除或排序 widget 不恢复默认值。
- `false`、`0` 和空字符串不会被视为未初始化。
- 删除普通 widget 或行容器内 widget 后清理对应 key。
- 清空 widget 列表后清空表单模型。
- 修改已有 widget 的默认值不覆盖当前表单值。
- `widget-renderer` 通过 `update:modelValue` 更新字段，不直接修改传入的 `formData`。

## 非目标

- 不改变自定义校验器和组件事件函数的参数结构。
- 不改变提交数据的 `propName` 映射规则。
- 不引入独立表单状态库。
- 不处理与本次数据流修正无关的现有 TypeScript 错误。
