<template>
  <div>
    <q-layout>
      <router-view />
    </q-layout>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.my-card {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.filter-btn {
  height: 40px;
}
</style>
