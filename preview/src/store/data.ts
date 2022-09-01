/**
 * 作者：yujinjin9@126.com
 * 时间：2021-12-30
 * app数据管理入口文件
 */
import { App } from "/#/app";

export default {
    state: {
        /* 站点临时数据*/
        locationInfo: <App.LocationInfo>{}
    },
    mutations: {
        //修改站点临时数据
        updateLocationInfo(state, data: Array<{ key; value }>) {
            data.forEach(item => {
                state.locationInfo[item.key] = item.value;
            });
        }
    },
    actions: {
        // 更新当前站点临时数据
        updateLocationInfo({ commit }, { key, value }) {
            commit("updateLocationInfo", [{ key, value }]);
        },
        // 批量更新当前站点临时数据
        batchUpdateLocationInfo({ commit }, data: Array<{ key; value }>) {
            commit("updateLocationInfo", data);
        }
    }
};
