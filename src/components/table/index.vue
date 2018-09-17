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
      
      <div ref="wrapTable" class="wrap-table" @wheel="onscroll">
        <table ref="table" :class="tableClass" :style="{width: tableWidth + 'px'}">

          <thead>
            <th class="square" @click="moveStart" @dblclick="moveEnd">##</th>
            <th class="v-ruler" v-for="id in columnsInTable" :key="id" v-text="firstColumn + id"></th>
            <th class="column-blank">--</th>
          </thead>

          <tbody>
            <tr class="not-blank" v-for="row_i in rowsInTable" :key="row_i">
              <td class="h-ruler" v-text="firstRow + row_i"></td>
              <td
                class="usual"
                :class="{changed: isChanged(column_i, row_i)}"
                v-for="column_i in columnsInTable" :key="column_i"
                :title="cell(column_i, row_i)
              ">
                <div class="wrap-flex">
                  <input
                    class="checkbox"
                    :checked="isChecked(column_i, row_i)"
                    @input="oncheckbox(column_i, row_i, $event)"
                    type="checkbox"
                  />
                  <input
                    class="number"
                    :value="getNumber(column_i, row_i)"
                    @input="onnumber(column_i, row_i, $event)"
                    :disabled="isChecked(column_i, row_i)"
                    type="number"
                  />
                </div>
              </td>
              <td class="column-blank"></td>
            </tr>
            <tr class="blank">
              <td class="h-ruler">--</td>
              <td class="usual" v-for="column_i in columnsInTable" :key="column_i"></td>
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

  // import {onceGlobalRegisterStoreModule as tableStore} from '../../store/dynamic/table';
  import {registerModule} from '../../store/dynamic/table';
  const tableStore = registerModule(null);

  export default {
    name: 'Table',
    data() { return { 
      tableWidth: 1666,
      changedValues: {}
    } },
    props: {
      offsetRow:    { type: Number, default: 1 },
      offsetColumn: { type: Number, default: 1 }
    },
    computed: {
      ...tableStore.mapState(["ROWS", "COLUMNS", "firstRow", "firstColumn", "rowsInTable", "columnsInTable"]),
      ...tableStore.mapGetters(['cell']),
      isDisableSave() { return !Object.keys(this.changedValues).length },
      tableClass() {
        return {
          top:    this.firstRow === 0,
          bottom: this.firstRow + this.rowsInTable >= this.ROWS,
          right:  this.firstColumn + this.columnsInTable >= this.COLUMNS,
          left:   this.firstColumn === 0
        }
      },
      propsRightScroll() {
        return {
          side:        'right',
          showedCount:  this.rowsInTable,
          overallCount: this.ROWS,
          offsetCount:  this.firstRow,
          move:         this.setFirstRow
        }
      },
      propsBottomScroll() {
        return {
          class:       "flex11",
          side:        'bottom',
          showedCount:  this.columnsInTable,
          overallCount: this.COLUMNS,
          offsetCount:  this.firstColumn,
          move:         this.setFirstColumn
        }
      }
    },
    methods: {
      ...tableStore.mapMutations(['setFirstRow', 'setFirstColumn', 'setRowsInTable', 'setColumnsInTable']),
      isChecked(localX, localY) {
        const x = this.firstColumn + localX, y = this.firstRow + localY;
        const column = this.changedValues[x];
        return column && column[y] && column[y].checked;
      },
      isChanged(localX, localY) {
        const x = this.firstColumn + localX, y = this.firstRow + localY;
        const column = this.changedValues[x];
        return column && column[y];
      },
      getNumber(localX, localY) {
        const x = this.firstColumn + localX, y = this.firstRow + localY;
        const column = this.changedValues[x];
        const changedValue = column && column[y] && column[y].value;
        return changedValue || this.cell(x, y);
      },
      save() {
        console.log( JSON.stringify(this.changedValues), JSON.parse(JSON.stringify(this.changedValues)) );
      },
      moveEnd() {
        this.setFirstRow(this.ROWS);
        this.setFirstColumn(this.COLUMNS);
      },
      moveStart() {
        this.setFirstRow(0);
        this.setFirstColumn(0);
      },
      oncheckbox(localX, localY, ev) {
        const isChecked = ev.target.checked;
        const x = this.firstColumn + localX, y = this.firstRow + localY;
        this[isChecked ? 'setChangedValue' : 'removeChangedValue']({x, y, field: 'checked', value: isChecked});
      },
      removeChangedValue({x, y, field}){
        let point = this.changedValues;
        if ( !( point[x] && point[x][y] && point[x][y][field]) ) return
        delete point[x][y][field];
        if (Object.keys(point[x][y]).length)
          this.changedValues[x][y] = {...point[x][y] }
        else {
          delete point[x][y];
          if (Object.keys(point[x]).length)
            this.changedValues[x] = {...point[x]}
          else {
            delete point[x];
            this.changedValues = { ...point};
          }
        }
      },
      setChangedValue({x, y, field, value}){
        if (this.changedValues[x] === undefined)
          this.changedValues = { ...this.changedValues, [x]: {[y]: {[field]: value}} }
        else if (this.changedValues[x][y] === undefined)
          this.changedValues[x] = { ...this.changedValues[x], [y]: {[field]: value} }
        else
          this.changedValues[x][y] = { ...this.changedValues[x][y], [field]: value }
      },
      onnumber(localX, localY, ev) {
        const x = this.firstColumn + localX, y = this.firstRow + localY;
        const serverValue = this.cell(x, y);
        const value = +ev.target.value || serverValue;
        this[value === serverValue ? 'removeChangedValue' : 'setChangedValue']({x, y, field: 'value', value});
      },
      onscroll(ev) {
        const DELTA_Y_ONE_SCROLL_PIXEL = 100;
        const countPages = Math.round( ev.deltaY / DELTA_Y_ONE_SCROLL_PIXEL ) || 1;
        if ( ev.altKey )
          this.setFirstColumn(this.firstColumn + countPages);
        else
          this.setFirstRow(this.firstRow + countPages);
      },
      onresize(ev) {
        this.setRowsInTable(this.computeRowsCount());
        this.setColumnsInTable(this.computeColumnsCount());
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


    mounted() {
      this.onresize();
      window.addEventListener('resize', this.onresize);
      this.setFirstRow(this.offsetRow);
      this.setFirstColumn(this.offsetColumn);
      tableStore.dispatch('getTableDimension');
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
