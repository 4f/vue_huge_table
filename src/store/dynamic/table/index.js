import {getSizes, getData} from '../../../api'

import {registerModule as _registerModule} from '../../';


let export_default = {namespaced: true};

class CacheShape {
  DIMENSION = {columns: 2 ** 5, rows: 2 ** 5}
  MAX_SIZE = 128
  HOT_SIZE = 32
  
  width = null
  height=  null
  indexLastView = 0
  first = null
  last  = null
  hashdata = {}
  size = 0

  static init(columns = 40000, rows = 40000) {
    this.width  = Math.ceil( columns / this.DIMENSION.columns );
    this.height = Math.ceil( rows / this.DIMENSION.rows );
    this.first = new this(0, 0); //placeholder
    this.hashdata = {};
  }

  static getId(shapeX, shapeY) { return `${shapeX}-${shapeY}` }

  static getCell(x, y) {
    const {shapeX, shapeY} = this.getShapeCoordinate(x, y);
    const id = this.getId(shapeX, shapeY);
    const cachedShape = this.hashdata[id];
    if (cachedShape) {
      const {localX, localY} = this.getCoordinateInShape(x, y);
      return cachedShape.getCell(localX, localY);
    }
    else
      this.hashdata[id] = new this(shapeX, shapeY)
    return Symbol('empty');
  }

  static getShapeCoordinate(x, y) {
    return {
      shapeX: Math.trunc(x / CacheShape.DIMENSION.columns),
      shapeY: Math.trunc(y / CacheShape.DIMENSION.rows)
    }
  }
  static getCoordinateInShape(x, y) {
    return {
      localX: x % CacheShape.DIMENSION.columns,
      localY: y % CacheShape.DIMENSION.rows
    }
  }

  constructor(shapeX, shapeY) {
    this.x = shapeX;
    this.y = shapeY;
    this.next = null;
    this.prev = CacheShape.last;
    this.array = [];
    this.isLoaded = false;
    this.indexView = ++CacheShape.indexLastView;
    CacheShape.last = this;
  }
  getCell(x, y) {
    if (!this.isLoaded) return Symbol('empty');
    if (this.indexView + CacheShape.HOT_SIZE < CacheShape.indexLastView)
      this.indexView = 5;

  }
}

export_default.state = () => (
  {
    value:          6,
    firstRow:       0,
    firstColumn:    0,
    rowsInTable:    25,
    columnsInTable: 35,
    loading:        false,
    errorRequest:   false,
    COLUMNS:        33333,
    ROWS:           33333
  }
)

export_default.getters = {
  cell: state => (x, y) => {
    // const shapeX = x % CacheShape.DIMENSION.columns;
    // const shapeY = y % CacheShape.DIMENSION.rows;
    // const cacheX = x / CacheShape.DIMENSION.columns;
    // const cacheY = y / CacheShape.DIMENSION.rows;
    return state.value;
  }
}

export_default.actions = {
  getTableDimension({commit}) {
    commit('loading', true);
    getSizes()
      .then   ( ({data}) => commit('setTableDimension', data) )
      .catch  (      (e) => commit('errorRequest', e) )
      .finally(       () => commit('loading', false) );
  },
  load ({ commit, state }, {rowStart, columnStart}) {
    commit('loading', true);
    getData( { rowStart, columnStart, ...CacheShape.DIMENSION } )
      .then   ( ({data}) => commit('updateCache', data) )
      .catch  (      (e) => commit('errorRequest', e) )
      .finally(       () => commit('loading', false) );
  }
}

export_default.mutations = {
  loading(state, b) { state.loading = b },
  errorRequest(state, bool_text) { state.errorRequest = bool_text },
  setTableDimension(state, {columns, rows}) {
    console.log("SD", columns, rows);
    state.COLUMNS = columns;
    state.ROWS    = rows;
  },
  setFirstRow(state, row) {
    state.firstRow = Math.max(0, Math.min(row, state.ROWS - state.rowsInTable));
  },
  setFirstColumn(state, column) {
    state.firstColumn = Math.max(0, Math.min(column, state.COLUMNS - state.columnsInTable));
  },
  setRowsInTable(state, rows) { state.rowsInTable = rows },
  setColumnsInTable(state, columns) { state.columnsInTable = columns },
}



export const registerModule = store => _registerModule(store, export_default, "tableStore");
// export const onceGlobalRegisterStoreModule = registerModule(null);

export default export_default;