# pc-form

- 说明：通过拖拽表达你组件生成表单（PC端）设计器

## 表单组件列表

### 基础组件

- 文本框
  组件数据：

    ```json
    {
        "id": "id",
        "code": "input", // 组件code
        "name": "输入框",
        "description": "普通的文本输入框",
        "formAttributes": {
            "label": "标签",
            "prop": "键名",
            "rules": "表单验证规则",
            "required": "是否必填项",
            "labelPosition": "标签的位置"
        },
        "componentAttributes": {
            "placeholder": "占位符",
            "maxLength": "最大长度",
            "minLength": "最小长度"
        },
        "componentEvents": {
            "change": "change事件",
            "input": "input事件"
        },
        "settingData": {}
    }
    ```

    - 组件code：input
    - 名称：输入框
    - 描述：普通的文本输入框
    - 表单属性
        - 标签：label
        - 键名：prop
        - 表单验证规则：rules
        - 是否必填项：required
        - 标签的位置：label-position

    组件设置：
    - 占位符
    - 最大长度
    - 最小长度
    - 正则表达式校验
    - 自定义校验函数

- 密码框
- 文本域
- 单选框
- 复选框
- 下拉选择框
- 日期选择器
- 时间选择器
- 日期时间选择器
- 文件上传
- 图片上传
- 颜色选择器
- 滑块
- 范围滑块
- 进度条
- 开关
- 评分
- 标签
- 按钮
- 链接
- 分隔线
- 标题
- 段落
- 列表
- 表格
- 网格布局
- 自定义组件

### 将字符串解析成可执行JavasCript代码

- 说明：可以使用Function构造函数来动态创建函数并执行。new Function(arg1, arg2, ..., argN, function_body)构造函数接受任意数量的参数，最后一个参数为函数体字符串，其参数和函数体都以字符串形式传入。例如：

```js
const codeString = "var sum ; sum = x+y;return sum;";
const myFunction = new Function("x", "y", codeString);
myFunction(2, 3);
```

- 需要注意的是，new Function中的代码执行时的作用域为全局作用域，不论它在哪个地方被调用，它访问的都是全局变量和内部定义的参数变量，它是无法访问函数内的局部变量。
- 使用Function构造函数同样具有一定的安全风险，因为它可以动态创建和执行任意的JavaScript代码。因此，在使用Function构造函数时，需要谨慎处理传入的参数和函数体字符串，避免执行恶意代码。
