<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
    console.info("App onMounted");
});

onUnmounted(() => {
    console.info("App onUnmounted");
});
</script>

<template>
    <img alt="Vue logo" src="@/assets/logo.png" />
    <HelloWorld msg="Hello Vue 3 + TS" />
</template>

<style>
#app-edit {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
