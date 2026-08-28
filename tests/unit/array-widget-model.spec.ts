/**
 * @fileoverview 验证复选框组和 Upload 在默认数据、设置同步及渲染边界始终使用数组模型。
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { useCreateDefaultData as createCheckboxGroupDefaultData, useSettingDataValueChange as changeCheckboxGroupSetting } from "@/views/composables/widgets/checkbox-group";
import { useCreateDefaultData as createUploadDefaultData, useSettingDataValueChange as changeUploadSetting } from "@/views/composables/widgets/upload";

const widgetRendererSource = readFileSync(new URL("../../src/views/components/widget-renderer.vue", import.meta.url), "utf-8");
const checkboxGroupSettingSource = readFileSync(new URL("../../src/views/components/widgets-setting/checkbox-group.vue", import.meta.url), "utf-8");

describe("array widget model", () => {
    it("复选框组默认值使用相互隔离的空数组", () => {
        const first = createCheckboxGroupDefaultData();
        const second = createCheckboxGroupDefaultData();

        expect(first.defaultValue).toEqual([]);
        expect(first.settingData.defaultValue).toEqual([]);
        expect(first.defaultValue).not.toBe(first.settingData.defaultValue);
        expect(first.defaultValue).not.toBe(second.defaultValue);
    });

    it("Upload 文件列表默认值使用相互隔离的空数组", () => {
        const first = createUploadDefaultData();
        const second = createUploadDefaultData();

        expect(first.defaultValue).toEqual([]);
        expect(first.settingData.defaultValue).toEqual([]);
        expect(first.defaultValue).not.toBe(first.settingData.defaultValue);
        expect(first.defaultValue).not.toBe(second.defaultValue);
    });

    it("设置入口把复选框组和 Upload 的空值归一化为空数组", () => {
        const checkboxGroup = createCheckboxGroupDefaultData();
        const upload = createUploadDefaultData();

        changeCheckboxGroupSetting(checkboxGroup, "defaultValue", null);
        changeUploadSetting(upload, "defaultValue", null);

        expect(checkboxGroup.defaultValue).toEqual([]);
        expect(checkboxGroup.settingData.defaultValue).toEqual([]);
        expect(upload.defaultValue).toEqual([]);
        expect(upload.settingData.defaultValue).toEqual([]);
    });

    it("复选框组设置面板按多选模式编辑默认值", () => {
        expect(checkboxGroupSettingSource).toMatch(/<option-config[\s\S]*?:multiple="true"/);
    });

    it("渲染边界直接绑定已由数据层保证为数组的模型", () => {
        expect(widgetRendererSource).toMatch(/<el-checkbox-group[\s\S]*?v-model="renderValue"/);
        expect(widgetRendererSource).toMatch(/<el-upload[\s\S]*?v-model:file-list="renderValue"/);
        expect(widgetRendererSource).not.toContain("checkboxGroupValue");
        expect(widgetRendererSource).not.toContain("uploadFileList");
    });
});
