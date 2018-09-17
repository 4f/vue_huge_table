<template>
  <div class="scroll" @click="click">
    <div class="thumb" :style="thumbStyle"></div>
  </div>
</template>

<script>
  export default {
    name: 'Scroll',
    computed: {
      thumbOffset: function() { return this.offsetCount * 100 / this.overallCount + "%"; },
      thumbWidth:  function() { return this.showedCount / this.overallCount + "%"; },
      thumbStyle:  function() { return this[ this.side + "Style"] },
      rightStyle:  function() { return { top: this.thumbOffset,  height: this.thumbWidth } },
      bottomStyle: function() { return { left: this.thumbOffset, width: this.thumbWidth } },
      isBottom:    function() { return this.side === 'bottom' }
    },
    props: {
      showedCount:  { type: Number,   required: true },
      overallCount: { type: Number,   required: true },
      offsetCount:  { type: Number,   required: true },
      move:         { type: Function, required: true },
      side:         { type: String,   required: true,
        validator: function(side){ return ['right', 'bottom'].indexOf(side) !== -1 }
      }
    },
    methods: {
      onscroll: function(ev) {
      },
      click: function(ev) { this.move(this[ this.side + 'NewFirstCell'](ev)); },
      bottomNewFirstCell: function(ev) { return Math.round(this.overallCount * ev.offsetX / ev.target.offsetWidth) },
      rightNewFirstCell:  function(ev) { return Math.round(this.overallCount * ev.offsetY / ev.target.offsetHeight) }
    }
  }
</script>

<style scoped>
  .scroll {
    background: lightgray;
    width: 100%;
    height: 100%;
    position: relative;
  }
  .thumb {
    min-width: 1px;
    min-height: 1px;
    width: 100%;
    background: green;
    height: 100%;
    position: absolute;
    cursor: pointer;
  }
</style>
