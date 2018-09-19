<style scoped>
  .flex11 {
    flex: 1 1;
  }

  .container {
    display: flex;
    /* background: gray; */
    flex-direction: column;
    min-width: 400px;
    width: 100%;
    height: 100%;
  }
  .middle {
    display: flex;
    width: 100%;
  }

  .wrap-table {
    overflow: hidden;
    flex: 1 1;
  }

  table {
    background: #fafafa;
    border-spacing: unset;
    table-layout:fixed;
  }
  th {
    height: 32px;
    width: 64px;
    /* border: 1px dotted black; */
  }
  td {
    border: 1px solid transparent;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
  }
  td.usual .wrap-flex {
    display: flex;
    justify-content: space-between;
  }
  td.usual .number {
    width: 100%;
    text-align: right; 
  }
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
  input[type=number] {
    border: 1px solid #eee;
  }
  input[type=number]:hover {
    border: 1px solid #bbb;
  }

  td:hover {
    /* border: 1px solid red; */
    background: #fcc !important;
  }
  tr:hover td {
    /* border-top: 1px solid gray; */
    /* border-bottom: 1px solid gray; */
    background: #f3f3f3;
  }
  td.changed {
    border: 1px solid red;
  }
  .h-ruler {
    font-weight: 600;
  }

  table.bottom tr.blank td.usual, table.right tr.not-blank .column-blank {
    background: blue;
  }

  .wrap-right-scroll {
    width: 16px;
  }  
  .wrap-bottom-scroll {
    height: 16px;
    display: flex;
  }

  .wrap-bottom-scroll .square {
    width: 16px;
    background: yellow;
  }

</style>

<template>
  <div class="container">

    <div class="first">
      <input
        type="submit"
        @click="save"
        :disabled="isDisableSave"
        value="Save"
      />
    </div>

    <div class="middle flex11">
      
      <div ref="wrapTable" class="wrap-table" @wheel.passive="onscroll">
        <table ref="table" :class="tableClass" :style="{width: tableWidth + 'px'}">

          <thead>
            <th class="square" @click="moveStart" @dblclick="moveEnd">##</th>
            <th class="v-ruler" v-for="columnNumber in columns" :key="columnNumber" v-text="columnNumber"></th>
            <th class="column-blank">--</th>
          </thead>

          <tbody>
            <tr class="not-blank" v-for="row in rows" :key="row">
              <td class="h-ruler" v-text="row"></td>
              <td
                class="usual"
                :class="{changed: isChanged(column, row)}"
                v-for="column in columns" :key="column + '.' + row"
              >
                <div class="wrap-flex">
                  <input
                    class="checkbox"
                    :checked="values[column][row].checked"
                    @input="oncheckbox(column, row, $event)"
                    type="checkbox"
                  />
                  <input
                    class="number"
                    :value="values[column][row].value"
                    @input="onnumber(column, row, $event)"
                    :disabled="values[column][row].checked"
                    type="number"
                  />
                </div>
              </td>
              <td class="column-blank"></td>
            </tr>
            <tr class="blank">
              <td class="h-ruler">--</td>
              <td class="usual" v-for="column in columns" :key="column"></td>
              <td class="column-blank"></td>
            </tr>
          </tbody>

        </table>
      </div>

      <div class="wrap-right-scroll">
        <Scroll v-bind="propsRightScroll" />
      </div>

    </div>
    
    <div class="wrap-bottom-scroll">
      <Scroll v-bind="propsBottomScroll" />
      <div class="square" @click="moveEnd" @dblclick="moveStart"></div>
    </div>

  </div>
</template>

<script>
  import Scroll from './scroll';

  import CacheGrid from '@/services/cache'

  // import {onceGlobalRegisterStoreModule as tableStore} from '../../store/dynamic/table';
  import {registerModule} from '@/store/dynamic/table';
  const tableStore = registerModule(null);

  export default {
    name: 'Table',
    data() { return { 
      tableWidth: 660 //for first cell size 10 * 66
    } },
    props: {
      offsetRow:    { type: Number, default: 1 },
      offsetColumn: { type: Number, default: 1 }
    },
    computed: {
      ...tableStore.mapState(["values", "changedValues", "counterCache", "overallSize", "offset", "viewSize"]),
      // ...tableStore.mapGetters(['cell']),
      rows() {
        const length = this.viewSize.h,
              offset = this.offset.y;
        let rows =  new Array(length);
        for(let i = 0; i < length; ) rows[i] = ++i + offset
        return rows;
      },
      columns() {
        const length = this.viewSize.w,
              offset = this.offset.x;
        let columns =  new Array(length);
        for(let i = 0; i < length; ) columns[i] = ++i + offset
        return columns;
      },
      isDisableSave() { return !Object.keys(this.changedValues).length },
      tableClass() {
        return {
          top:    this.offset.y === 0,
          bottom: this.offset.y + this.viewSize.h >= this.overallSize.h,
          right:  this.offset.x + this.viewSize.w >= this.overallSize.w,
          left:   this.offset.x === 0
        }
      },
      propsRightScroll() {
        return {
          side:        'right',
          showedCount:  this.viewSize.h,
          overallCount: this.overallSize.h,
          offsetCount:  this.offset.y,
          move:         y => this.setOffset({y})
        }
      },
      propsBottomScroll() {
        return {
          class:       "flex11",
          side:        'bottom',
          showedCount:  this.viewSize.w,
          overallCount: this.overallSize.w,
          offsetCount:  this.offset.x,
          move:         x => this.setOffset({x})
        }
      }
    },
    methods: {
      ...tableStore.mapMutations(['initValues', 'setChangedValue', 'removeChangedValue']),
      ...tableStore.mapActions(['setOffset', 'setViewSize']),
      isChanged(x, y) {
        const column = this.changedValues[x];
        return column && column[y];
      },
      save() {
        console.log( JSON.stringify(this.changedValues), JSON.parse(JSON.stringify(this.changedValues)) );
      },
      moveEnd() { this.setOffset({x: this.overallSize.w, y: this.overallSize.h}) },
      moveStart() { this.setOffset({x: 0, y: 0}) },
      oncheckbox(x, y, ev) {
        const isChecked = ev.target.checked;
        this[isChecked ? 'setChangedValue' : 'removeChangedValue']({x, y, field: 'checked', value: isChecked});
      },
      onnumber(x, y, ev) {
        const serverValue = CacheGrid.getCell({x, y});
        const value = +ev.target.value || serverValue;
        this[value === serverValue ? 'removeChangedValue' : 'setChangedValue']({x, y, field: 'value', value});
      },
      onscroll(ev) {
        const DELTA_Y_ONE_SCROLL_PIXEL = 100;
        const countPages = Math.round( ev.deltaY / DELTA_Y_ONE_SCROLL_PIXEL ) || 1;
        this.setOffset( ev.altKey ? {x: this.offset.x + countPages} : {y: this.offset.y + countPages} );
      },
      onresize() {
        this.setViewSize( {w: this.computeColumnsCount(), h: this.computeRowsCount()} );
        this.tableWidth = this.computeTableWidth();
      },
      computeRowsCount(){
        const firstRow  = this.$refs.table.querySelector('th'),
              restRow   = this.$refs.table.querySelector('tr'),
              heightWrap    = this.$refs.wrapTable.offsetHeight;
        return Math.floor( (heightWrap - firstRow.offsetHeight) / restRow.offsetHeight );
      },
      computeColumnsCount(){
        const firstColumn  = this.$refs.table.querySelector('th'),
              restColumn   = firstColumn.nextElementSibling,
              widthWrap    = this.$refs.wrapTable.offsetWidth;
        return Math.floor( (widthWrap - firstColumn.offsetWidth) / restColumn.offsetWidth );
      },
      computeTableWidth(){
        const firstColumn  = this.$refs.table.querySelector('th'),
              restColumn   = firstColumn.nextElementSibling;
        return firstColumn.offsetWidth + restColumn.offsetWidth * this.computeColumnsCount()
      }
    },

    beforeCreate() {
      tableStore.dispatch('getOverallSize');
      tableStore.commit('initValues'); //init values
    },
    mounted() {
      this.onresize();
      this.setOffset( {x: this.offsetColumn, y: this.offsetRow} );
      window.addEventListener('resize', this.onresize);
    },
    beforeDestroy() {
      tableStore.destroy();
      window.removeEventListener('resize', this.onresize);
    },
    components: {
      Scroll
    }
  }
</script>
