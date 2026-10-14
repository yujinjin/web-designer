# Views 单元测试覆盖说明

本次范围为 `src/views` 全部 101 个 TS/Vue 文件。以功能行为覆盖为目标，不要求“一文件一测试文件”，不以源码字符串存在或恒真断言作为完整功能验证。所有单测集中在 `tests/unit`，宿主辅助逻辑集中在 `tests/helpers`。

最终验证：2026-10-14 执行 30 个 Views 测试文件，共 363 项检查符合预期，其中 360 项正常通过、3 项预期失败回归。相较原有 170 项新增 193 项检查。类型契约、新增测试类型检查及实际修改文件的定向 ESLint 通过；业务源码未修改。

## 执行方式

```sh
npm run test:views
npm run test:views:types
npx vue-tsc --noEmit -p tests/tsconfig.views-tests.json
```

`test:views` 执行 Views 的测试，排除无关的 storage Store 专项。`test:views:types` 验证纯类型文件的正负契约；第三条检查本次新增测试代码及其必要源码依赖。没有执行构建、开发服务器或 Git 操作。

## 测试方法与边界

- 新增 Happy DOM 仅作为测试依赖，两个 Vue 行为测试文件使用 DOM 环境，其余仍为 Node。
- `component-host.ts` 使用 Vue 自定义宿主运行真实项目组件，组件 setup、render、watch、事件处理和生命周期正常执行；Element Plus 外壳仅转发输入输出。
- 浏览器文件 API、Sortable、Monaco、存储、消息确认及外部 HTML 解析器按需替身化；不会替换项目的树管理、适配器、文档规则或草稿提交逻辑。
- Alert 关闭与恢复还使用真实 Element Plus 组件挂载，验证连续两次关闭后重新显示。
- 不安装覆盖率统计提供器，不宣称行/分支覆盖率达到 100%。文件映射表示已有可追溯行为检查，不能证明任何输入下绝无缺陷。
- 布局像素、实际原生文件拖拽、浏览器兼容、Monaco 的真实编辑手势及 Element Plus 内部行为不由这些单测保证，仍需浏览器交互验收。

## 新增测试文件

| 测试                                     | 主要行为                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| `composables-behavior.spec.ts`           | 编辑会话、字段名称校验、渲染值增删、拖拽独立状态、操作目标、窗口监听          |
| `document-actions-behavior.spec.ts`      | 保存/恢复/导入/导出，风险确认、取消、大小限制、存储/读取/下载失败             |
| `widget-manage-boundaries.spec.ts`       | 无效目标、嵌套/数量约束、排序跨度、复制身份、删除选择、根数据替换             |
| `domain-behavior.spec.ts`                | 树、表单、规则、事件参数、上传钩子、模板构建、文档校验及已知间距缺陷          |
| `utils-behavior.spec.ts`                 | 非空属性投影、脚本返回/异常、文件边界与资源清理、HTML检查异常、布局与拖拽配置 |
| `settings-components-behavior.spec.ts`   | 19个设置面板及两个共享编辑器的真实事件和草稿/确认/清理；两项已知选项缺陷      |
| `rendering-workspace-components.spec.ts` | 17类分发、画布和工作区、异步设置、完整预览、错误隔离、页面保存/预览装配       |
| `views-types.contract.ts`                | 全部类型公共入口、只读身份、联合、级联 Props、结果收窄、控制状态负例          |

## 逐文件映射

以下路径均相对于 `src/views`，测试文件均位于 `tests/unit`。模板分组通过真实 catalog→factory 实例化覆盖，不另造重复注册项；类型入口检查会解析全部具体类型文件。

| 源文件                                                        | 行为验证入口                                                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `app.vue`                                                     | rendering-workspace-components：拖入后保存同一树、打开/关闭独立预览                                          |
| `components/canvas/center-render-panel.vue`                   | rendering-workspace-components：模板优先、克隆清理、无效排序、导入input重置、工具栏事件                      |
| `components/canvas/row-container-renderer.vue`                | rendering-workspace-components：拒绝嵌套/第7项、父ID插入、子项删除、Sortable销毁                             |
| `components/workspace/left-widget-panel.vue`                  | rendering-workspace-components：34模板、两类来源组、拖拽禁用Tooltip、实例清理                                |
| `components/workspace/right-setting-panel.vue`                | rendering-workspace-components：空选择、异步加载顶层/行内设置                                                |
| `components/rendering/widget-renderer.vue`                    | rendering-workspace-components：17类分发、数组模型、事件上下文、上传file-list和提示、HTML门禁、真实Alert恢复 |
| `components/preview/designer-form-preview-dialog.vue`         | rendering-workspace-components：关闭回调、无footer、快照隔离                                                 |
| `components/preview/designer-form-preview-renderer.vue`       | rendering-workspace-components：初始化等待、错误摘要、空态、脚本恢复隐藏字段                                 |
| `components/preview/designer-form-preview-row.vue`            | rendering-workspace-components：span归一、保留隐藏列、子字段回传                                             |
| `components/preview/designer-form-preview-error-boundary.vue` | rendering-workspace-components：真实子树异常、其他内容保留、隐藏敏感详情                                     |
| `components/settings/inputs/text.vue`                         | settings-components-behavior：控制/标签、字数统计确认与取消                                                  |
| `components/settings/inputs/input-number.vue`                 | settings-components-behavior：控制/标签；domain-behavior：新旧值事件                                         |
| `components/settings/inputs/switch.vue`                       | settings-components-behavior：控制/标签；widget-native-attribute-functions：切换前回调                       |
| `components/settings/inputs/rate.vue`                         | settings-components-behavior：控制/标签；domain-behavior：评分事件                                           |
| `components/settings/inputs/slider.vue`                       | settings-components-behavior：控制/标签；domain-behavior：input/change事件                                   |
| `components/settings/inputs/color-picker.vue`                 | settings-components-behavior：控制/标签；domain-behavior：临时颜色、清空、焦点                               |
| `components/settings/inputs/upload.vue`                       | settings-components-behavior：控制/标签；domain-behavior：全部上传钩子与前置校验                             |
| `components/settings/selections/radio-group.vue`              | settings-components-behavior：控制/标签；共享option-config事件；widget-default-setting                       |
| `components/settings/selections/checkbox-group.vue`           | settings-components-behavior：控制/标签；共享option-config事件；array-widget-model                           |
| `components/settings/selections/select.vue`                   | settings-components-behavior：控制/标签；共享option-config事件；array-widget-model                           |
| `components/settings/selections/cascader.vue`                 | settings-components-behavior：控制/标签、非法JSON草稿保留、合法换行树/文本同时提交                           |
| `components/settings/datetime/date-picker.vue`                | settings-components-behavior：控制/标签；widget-default-setting：类型切换清默认值                            |
| `components/settings/datetime/time-picker.vue`                | settings-components-behavior：控制/标签；widget-default-setting：范围切换清默认值                            |
| `components/settings/datetime/time-select.vue`                | settings-components-behavior：控制/标签；widget-default-setting：默认值写回                                  |
| `components/settings/display/html.vue`                        | settings-components-behavior：非法草稿和错误展示、合法内容才提交                                             |
| `components/settings/display/alert.vue`                       | settings-components-behavior：清隐藏、恢复key、保留标题                                                      |
| `components/settings/display/divider.vue`                     | settings-components-behavior：隐藏往返；widget-runtime-attributes：方向/线型                                 |
| `components/settings/layout/form.vue`                         | settings-components-behavior：根标签同步、onInit编辑存体而不执行                                             |
| `components/settings/layout/row-container.vue`                | settings-components-behavior：清空间距0、名称、关闭手动恢复均分、单列跨度归一                                |
| `components/settings/shared/option-config.vue`                | settings-components-behavior：增删排序、默认值事件、投影不泄漏checked、销毁；两项已知缺陷回归                |
| `components/settings/shared/js-code-editor-dialog.vue`        | settings-components-behavior：首尾行保护、最近合法源码、应用/销毁                                            |
| `composables/use-alert-render-state.ts`                       | alert-restore、composables-behavior、真实ElAlert行为                                                         |
| `composables/use-designer-document-actions.ts`                | document-actions-behavior，页面装配测试                                                                      |
| `composables/use-designer-workspace-layout.ts`                | composables-behavior：SSR、resize、手动调整、清理                                                            |
| `composables/use-form-render-data.ts`                         | composables-behavior：初始嵌套值、空/false/0保留、增删排序                                                   |
| `composables/use-js-code-editor.ts`                           | composables-behavior：保存完整源码、未打开保存、异常                                                         |
| `composables/use-prop-name-validator.ts`                      | composables-behavior：必填/格式/顶层重名/自身排除/缺注入                                                     |
| `composables/use-sortable-drag-state.ts`                      | composables-behavior：只读、独立、重复开始/停止；左栏事件                                                    |
| `composables/use-widget-manage.ts`                            | widget-manage、widget-manage-boundaries、页面装配                                                            |
| `composables/use-widget-operation-target.ts`                  | composables-behavior、designer-workspace-ui：悬停/焦点/选中优先级                                            |
| `domain/document/document.ts`                                 | designer-form-document、document-actions-behavior：外部JSON、安全门禁、动态内容                              |
| `domain/document/restore.ts`                                  | designer-form-document：错误结构、嵌套恢复、运行属性、显隐保留                                               |
| `domain/document/serialization.ts`                            | designer-form-document、document-actions-behavior：递归排除、独立文档、循环失败                              |
| `domain/document/validation.ts`                               | domain-behavior：错误路径、ISO日期、脚本只编译、HTML；designer-form-document                                 |
| `domain/document/types.ts`                                    | domain-behavior：错误结果路径；views-types.contract：结果收窄                                                |
| `domain/form/form-adapter.ts`                                 | domain-behavior：独立工厂、根属性同步、onInit存体清空                                                        |
| `domain/form/form-runtime.ts`                                 | domain-behavior：展平、业务路径提交、规则顺序/默认消息/正则/动态参数                                         |
| `domain/preview/preview-runtime.ts`                           | designer-form-preview、preview组件行为：隔离快照、同步异步初始化及失败                                       |
| `domain/widgets/registry.ts`                                  | widget-registry、widget-runtime-attributes、domain-behavior、17分发测试                                      |
| `domain/widgets/tree.ts`                                      | domain-behavior、widget-manage-boundaries：定位siblings、复制身份、错误复制、删除选择                        |
| `domain/widgets/layout/row-container-layout.ts`               | row-container-layout、domain-behavior、行容器面板：均分、归一、移动插入删除                                  |
| `domain/widgets/adapters/text.ts`                             | widget-runtime-attributes、domain-behavior、widget-default-setting、text-widget-setting                      |
| `domain/widgets/adapters/input-number.ts`                     | widget-runtime-attributes、domain-behavior新旧参数、隐藏组合往返                                             |
| `domain/widgets/adapters/radio-group.ts`                      | widget-runtime-attributes、domain-behavior、隐藏组合往返                                                     |
| `domain/widgets/adapters/checkbox-group.ts`                   | widget-runtime-attributes、domain-behavior、array-widget-model                                               |
| `domain/widgets/adapters/select.ts`                           | widget-runtime-attributes、domain-behavior专属事件、array-widget-model                                       |
| `domain/widgets/adapters/cascader.ts`                         | cascader-options、cascader-widget、widget-runtime-attributes、domain-behavior                                |
| `domain/widgets/adapters/date-picker.ts`                      | widget-runtime-attributes、widget-native-attribute-functions、默认值切换、事件                               |
| `domain/widgets/adapters/time-picker.ts`                      | widget-runtime-attributes、widget-native-attribute-functions、范围默认值切换、事件                           |
| `domain/widgets/adapters/time-select.ts`                      | widget-runtime-attributes、domain-behavior、默认值写回                                                       |
| `domain/widgets/adapters/switch.ts`                           | widget-native-attribute-functions、widget-runtime-attributes、domain-behavior                                |
| `domain/widgets/adapters/rate.ts`                             | widget-runtime-attributes、domain-behavior、默认隐藏/禁用往返                                                |
| `domain/widgets/adapters/color-picker.ts`                     | widget-runtime-attributes、domain-behavior：activeChange/focus/clear                                         |
| `domain/widgets/adapters/slider.ts`                           | widget-runtime-attributes、domain-behavior：input/change与脚本                                               |
| `domain/widgets/adapters/upload.ts`                           | domain-behavior：7回调参数、钩子清空、beforeUpload false、beforeRemove拒绝                                   |
| `domain/widgets/adapters/html.ts`                             | html-widget-setting、settings-components-behavior：安全内容提交                                              |
| `domain/widgets/adapters/alert.ts`                            | widget-runtime-attributes、widget-default-setting、恢复保留配置                                              |
| `domain/widgets/adapters/divider.ts`                          | widget-runtime-attributes、widget-default-setting                                                            |
| `domain/widgets/adapters/row-container.ts`                    | domain-behavior、row-container-layout、行容器设置；NaN边界为已知失败                                         |
| `domain/templates/builders.ts`                                | domain-behavior：显式默认值、隐藏/禁用、选项隔离、无效行/类型、联动、金额                                    |
| `domain/templates/catalog.ts`                                 | form-template-registry：34注册元数据/资源与全工厂                                                            |
| `domain/templates/registry.ts`                                | form-template-registry：未知ID、候选约束、身份隔离、分组                                                     |
| `domain/templates/types.ts`                                   | views-types.contract：工厂、分类、成功失败结果                                                               |
| `domain/templates/examples/labels.ts`                         | form-template-registry：真实工厂标签位置与设置态一致                                                         |
| `domain/templates/examples/layout.ts`                         | form-template-registry：双/三列、宽窄、换行合法结构                                                          |
| `domain/templates/examples/inputs.ts`                         | form-template-registry：全部类型、模型/属性和独立实例                                                        |
| `domain/templates/examples/display-interaction.ts`            | form-template-registry：展示、显隐、格式和跨字段校验                                                         |
| `domain/templates/industry/commerce-delivery.ts`              | form-template-registry、domain-behavior：金额双侧/清空、配送字段创建与初始隐藏配置                           |
| `domain/templates/industry/education-medical.ts`              | form-template-registry：字段数量、独立实例、默认可见与控制一致                                               |
| `domain/templates/industry/hotel-property.ts`                 | form-template-registry：晚数/倒置/清空、模型与跨度                                                           |
| `domain/templates/industry/quality-employment.ts`             | form-template-registry：字段配置、隐藏学校及实例隔离                                                         |
| `domain/templates/questionnaires/experience.ts`               | form-template-registry：低分、其他问题分支、重复实例隔离                                                     |
| `domain/templates/questionnaires/training-activity.ts`        | form-template-registry：10题、默认可见、纵向结构/配置独立                                                    |
| `domain/templates/questionnaires/employee-priority.ts`        | form-template-registry：10题、默认值/选项及实例隔离                                                          |
| `domain/templates/questionnaires/branch.ts`                   | form-template-registry：回访条件必填和显隐，默认至少8题                                                      |
| `utils/browser-json-file.ts`                                  | browser-json-file、utils-behavior：UTF8/大小边界、读失败、append/click异常清理                               |
| `utils/drag-drop-config.ts`                                   | utils-behavior、designer-workspace-ui：模板只进根、来源隔离                                                  |
| `utils/html-safety.ts`                                        | html-safety、utils-behavior、组件：检查失败关闭、移除定位、解析器异常                                        |
| `utils/widget-attributes.ts`                                  | utils-behavior：保留false/0/空串、省略null、派生覆盖、不改源                                                 |
| `utils/widget-scripts.ts`                                     | widget-script-utils、utils-behavior：取体、参数/返回值/异常及Promise                                         |
| `utils/workspace-layout.ts`                                   | designer-workspace-ui、utils-behavior：范围、比例、收缩与最小宽                                              |
| `types/base.ts`                                               | views-types.contract：只读身份、设置函数契约                                                                 |
| `types/form.ts`                                               | views-types.contract：表单/初始化/节点集合                                                                   |
| `types/widget.ts`                                             | views-types.contract：普通与行容器联合完整性                                                                 |
| `types/index.ts`                                              | views-types.contract：全部公共导出可用                                                                       |
| `types/widgets/inputs.ts`                                     | views-types.contract：默认值、属性可选、控制状态                                                             |
| `types/widgets/selections.ts`                                 | views-types.contract：选项模型与控制状态                                                                     |
| `types/widgets/cascader.ts`                                   | views-types.contract：真实外层Props、合法值、结果判别                                                        |
| `types/widgets/datetime.ts`                                   | views-types.contract：日期时间节点及属性                                                                     |
| `types/widgets/display.ts`                                    | views-types.contract：HTML/提示/分割线节点                                                                   |
| `types/widgets/row-container.ts`                              | views-types.contract：子项仅普通节点、禁止嵌套                                                               |

## 已知失败回归（不能视为功能通过）

测试使用 `it.fails` 表达已确认但本次未修复的问题；Vitest 会把符合预期的失败计入 passed，因此汇报必须将它们从正常通过数中区分。相应正常夹具/挂载场景也有独立测试，减少环境错误被误判为已知缺陷的风险。

| 问题                           | 复现与影响                                                                            | 后续修复验收                          |
| ------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------- | ----------------------------- |
| 选项编辑器多选默认值首次不回显 | `defaultValue: ['a']` 时初始 checked 使用单值严格相等，第一项未勾选；影响多选设置回显 | 默认数组按成员勾选，并确认单选不退化  |
| 选项编辑器中间态错误           | 2项中选择1项时 indeterminate 仍 false；实现与全选使用相同数量判断                     | 部分选中为中间态，全选或全不选为false |
| 行容器gutter归一化被覆盖       | 适配器传入 NaN 后末尾赋值覆盖0；当前设置面板 `value                                   |                                       | 0` 有输入保护，属API边界缺陷 | 非有限值回落0，普通有限值保持 |

本次不修改 `src/views` 业务源码来让测试通过。已确认边界：字段名唯一性校验当前仅检查顶层，HTML解析器的真实浏览器行为不由测试替身保证。这些不应被“覆盖全部文件”的映射掩盖。
