/**
 * @fileoverview 验证文本组件设置面板中字数统计与最大长度的交互约束。
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const textSettingSource = readFileSync(new URL("../../src/views/components/widgets-setting/text.vue", import.meta.url), "utf-8");

describe("text widget setting", () => {
    it("最大长度配置展示在字数统计开关之前", () => {
        expect(textSettingSource.indexOf('label="最大长度"')).toBeLessThan(textSettingSource.indexOf('label="显示字数统计"'));
    });

    it("开启字数统计但未设置最大长度时确认写入默认值", () => {
        expect(textSettingSource).toContain('@update:model-value="value => handleShowWordLimitChange(value === true)"');
        expect(textSettingSource).toContain("ElMessageBox.confirm");
        expect(textSettingSource).toContain("显示字数统计需要设置最大长度，是否将最大长度设置为 100？");
        expect(textSettingSource).toContain('confirmButtonText: "是"');
        expect(textSettingSource).toContain('cancelButtonText: "否"');

        const handlerSource = textSettingSource.slice(textSettingSource.indexOf("const handleShowWordLimitChange"), textSettingSource.indexOf("const propNameValidator"));
        expect(handlerSource.lastIndexOf('useSettingDataValueChange, "maxlength", 100')).toBeLessThan(handlerSource.lastIndexOf('useSettingDataValueChange, "showWordLimit", true'));
        expect(handlerSource).toContain('useSettingDataValueChange, "showWordLimit", false');
        expect(handlerSource).toContain("catch");
    });
});
