import {getSizes, getData} from '../../../api'

import {registerModule as _registerModule} from '../../';


let export_default = {namespaced: true};

class CacheGrid {
  static DIMENSION = {w: 2 ** 5, h: 2 ** 5}
  static MAX_SIZE  = 128
  static HOT_SIZE  = 32
  
  static indexLastView = 0
  static first         = null
  static last          = null
  static hashdata      = {}
  static size          = 0
  static tableSize     = {w: 0, h: 0}

  static init({w, h}) {
    this.tableSize = {w, h};
    this.first = new this(0, 0); //placeholder
    this.last  = this.first;//placeholder
    this.hashdata = {};
    return this;
  }

  static getId({gridX, gridY}) { return `${gridX}-${gridY}` }

  static getCell( point ) {
    const id = this.getId( this.getGridCoordinates(point) );
    const cachedGrid = this.hashdata[id];
    if (cachedGrid) {
      const {localX, localY} = this.getCoordinatesInGrid(point);
      return cachedGrid._getCell({localX, localY});
    }
    return Symbol('empty');
  }

  static getGridCoordinates({x, y}) {
    return {
      gridX: Math.trunc(x / CacheGrid.DIMENSION.w),
      gridY: Math.trunc(y / CacheGrid.DIMENSION.h)
    }
  }
  static getCoordinatesInGrid({x, y}) {
    return {
      localX: x % CacheGrid.DIMENSION.w,
      localY: y % CacheGrid.DIMENSION.h
    }
  }
  static increaseSize() {
    this.size++;
    if (this.size > this.MAX_SIZE){
      const second = this.first.next;
      delete this.hashdata[this.first.id];
      this.first = second;
      this.hashdata = {...this.hashdata};
    }
  }
  static isInCache( point ) {
    const id = this.getId( this.getGridCoordinates( point ) );
    return !!this.hashdata[id];
  }

  static getViewGridIds({x, y, width, height}) {
    let point = {};
    const lastX = Math.min(x + width + 2,  this.tableSize.w);
    const lastY = Math.min(y + height + 2, this.tableSize.h);
    let rtrnArray = [];
    for(point.x = Math.max(0, x - 2); point.x < lastX; point.x += this.DIMENSION.w ) {
      for(point.y = Math.max(0, y - 2); point.y < lastY; point.y += this.DIMENSION.h) {
        rtrnArray.push( new this( this.getGridCoordinates(point) ) );
      }
      point.y = lastY;
      rtrnArray.push( new this( this.getGridCoordinates(point) ) );
    }
    point = {x: lastX, y: lastY};
    rtrnArray.push( new this( this.getGridCoordinates(point) ) );
    return rtrnArray;
  }

  constructor({gridX, gridY}) {
    this.gridPoint = {x: gridX, y: gridY};
    this.id = CacheGrid.getId({gridX, gridY});
    this.next = null;
    this.prev = null;
    this.data = [];
    this.isLoaded = false;
    this.indexView = 0;
  }
  getCell(point) {
    if (!this.isLoaded) return Symbol('empty');
    const {localX, localY} = CacheGrid.getCoordinatesInGrid(point);
    if (this.indexView + CacheGrid.HOT_SIZE < CacheGrid.indexLastView)
      this.indexView = ++CacheGrid.indexLastView;
    return this.data[localX][localY];
  }

  _getCell({localX, localY}) {
    if (!this.isLoaded) return Symbol('empty');
    if (this.indexView + CacheGrid.HOT_SIZE < CacheGrid.indexLastView)
      this.indexView = ++CacheGrid.indexLastView;
    return this.data[localX][localY];
  }

  isQuered()   { return !!CacheGrid.hashdata[this.id] }
  putToQuery() {
    CacheGrid.hashdata[this.id] = this;
    this.prev = CacheGrid.last;
    CacheGrid.last.next = this;
    this.indexView = ++CacheGrid.indexLastView;
    CacheGrid.increaseSize();
  }
  getFirstPoint(){
    return {x: this.gridPoint.x * CacheGrid.DIMENSION.w, y: this.gridPoint.y * CacheGrid.DIMENSION.h};
  }
  rect() { return {...this.getFirstPoint(), ...CacheGrid.DIMENSION } }
  setLoaded({array}) {
    this.data = array;
    this.isLoaded = true;
  }
}

export_default.state = () => (
  {
    firstRow:       0,
    firstColumn:    0,
    rowsInTable:    25,
    columnsInTable: 35,
    loading:        false,
    errorRequest:   false,
    COLUMNS:        0,
    ROWS:           0,
    hashdata:       {}
  }
)

export_default.getters = {
  cell: state => (x, y) => {
    const id = CacheGrid.getId( CacheGrid.getGridCoordinates({x, y}) );
    const data = state.hashdata[id];
    if ( data ) {
      const {localX, localY} = CacheGrid.getCoordinatesInGrid({x, y});
      return data[localX][localY];
      // return grid.getCell({x, y});

    }
      
    return "";
  }
}

export_default.actions = {
  getTableDimension({commit, dispatch}) {
    commit('loading', true);
    getSizes()
      .then   ( ({data}) => {
        commit('setTableDimension', data);
        dispatch('checkViewInCache');
      } )
      .catch  (      (e) => commit('errorRequest', e) )
      .finally(       () => commit('loading', false) );
  },
  load ({ commit, state }, grid) {
    commit('loading', true);
    getData( grid.rect() )
      .then   ( ({data}) => commit('updateCache', {grid, data}) )
      .catch  (      (e) => commit('errorRequest', e) )
      .finally(       () => commit('loading', false) );
  },
  setTableDimension({commit, dispatch}, {columns, rows}) {
    commit('setTableDimension', {columns, rows});
    dispatch('checkViewInCache');
  },
  setFirstRow({commit, dispatch}, row) {
    commit('setFirstRow', row);
    dispatch('checkViewInCache');
  },
  setFirstColumn({commit, dispatch}, column) {
    commit('setFirstColumn', column);
    dispatch('checkViewInCache');
  },
  setRowsInTable({commit, dispatch}, rows) {
    commit('setRowsInTable', rows);
    dispatch('checkViewInCache');
  },
  setColumnsInTable({commit, dispatch}, columns) {
    commit('setColumnsInTable', columns)
    dispatch('checkViewInCache');
  },
  checkViewInCache({state, dispatch}){
    if(!state.COLUMNS && !state.ROWS) return null;
    const arr = CacheGrid.getViewGridIds( {
      x: state.firstColumn,
      y: state.firstRow,
      width: state.columnsInTable,
      height: state.rowsInTable
    });
    arr.forEach( grid => {
      if ( !grid.isQuered() ){
        grid.putToQuery();
        dispatch("load", grid);
        console.log("update", grid);
      }
    } )

  }
}

export_default.mutations = {
  loading(state, b) { state.loading = b },
  errorRequest(state, bool_text) { state.errorRequest = bool_text },
  setTableDimension(state, {columns, rows}) {
    CacheGrid.init({w: columns, h: rows});
    state.COLUMNS = columns;
    state.ROWS    = rows;
  },
  setFirstRow(state, row) {
    state.firstRow = Math.max(0, Math.min(row, state.ROWS - state.rowsInTable));
  },
  setFirstColumn(state, column) {
    state.firstColumn = Math.max(0, Math.min(column, state.COLUMNS - state.columnsInTable));
  },
  setRowsInTable(state, rows) {
    state.rowsInTable = rows;
    if ( state.rowsInTable + state.firstRow > state.ROWS )
      state.firstRow = state.ROWS - state.rowsInTable;
  },
  setColumnsInTable(state, columns) {
    state.columnsInTable = columns;
    if ( state.columnsInTable + state.firstColumn > state.COLUMNS )
      state.firstColumn = state.COLUMNS - state.columnsInTable;
  },
  updateCache(state, {grid, data}) {
    grid.setLoaded(data);
    state.hashdata = {...state.hashdata, [grid.id]: grid.data };
    console.log(grid, data, state.hashdata);
  }
}



export const registerModule = store => _registerModule(store, export_default, "tableStore");
// export const onceGlobalRegisterStoreModule = registerModule(null);

export default export_default;