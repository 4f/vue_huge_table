<template>
  <div id="app">
    <Table :offsetRow="11111" :offsetColumn="11113" />
  </div>
</template>

<script>
import Table from './components/table'
import store from './store'

export default {
  name: 'app',
  store,
  components: {
    Table
  }
}
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 5vh;
    height: 80vh;
    min-height: 600px;
    min-width: 700px;
  }
</style>
