<template>
  <div class="container flex">
    <div class="top flex">
      <div class="square left-width"></div>
      <div class='ruler flex11a flex'>
        <div class="cell">40000</div>
        <div class="cell">40000</div>
        <div class="cell">40000</div>
        <div class="cell">40000</div>
      </div>
      <div class="square right-width"></div>
    </div>
    <div class="middle flex flex11a">
      <div class='left-ruler left-width'>
        <div class="cell">40000</div>
        <div class="cell">40000</div>
        <div class="cell">40000</div>
        <div class="cell">40000</div>
      </div>
      <div class='body flex11a'></div>
      <div class='right-scroll right-width'></div>
    </div>
    <div class="bottom flex">
      <div class="square left-width"></div>
      <div class='scroll flex11a'></div>
      <div class="square right-width"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<style scoped>
  .top .ruler .cell {
    width: 64px;
    height: 100%;
    text-align: center;
    line-height: 32px;
    border-left: 1px solid lightgray;
  }
  .middle .left-ruler .cell {
    width: 100%;
    height: 32px;
    text-align: center;
    line-height: 32px;
  }

  .flex {
    display: flex;
  }
  .flex11a {
    flex: 1 1 auto;
  }
  .container {
    height: 100%;
    width: 100%;
    min-height: 400px;
    min-width: 400px;
    flex-direction: column;
  }

  .top {
    height: 32px;
  }
  .bottom {
    height: 16px;
  }
  .left-width {
    width: 64px;
  }
  .right-width {
    width: 16px;
  }
  .middle {
  }
  
  .top .ruler {
    background: lightgreen;
  }
  .middle .left-ruler {
    background: red;
  }
  .bottom .scroll {
    background: gray;
  }
  .middle .right-scroll {
    background: red;
  }
  .body {
    background: lightgray;
  }
</style>
