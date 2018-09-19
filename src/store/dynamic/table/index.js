import Vue from 'vue'

import {getSizes, getData} from '@/api'

import CacheGrid from '@/services/cache'

import {registerModule as _registerModule} from '@/store';

let export_default = {namespaced: true};

export_default.state = () => (
  {
    offset:         {x: 0, y: 0},
    viewSize:       {w: 9, h: 9},
    loading:        false,
    errorRequest:   false,
    overallSize:    {w: 0, h: 0},
    changedValues:  {},
    values:         {}
  }
)

export_default.getters = {
}

export_default.actions = {
  getOverallSize({commit, dispatch}) {
    commit('loading', true);
    getSizes()
      .then   ( ({data}) => {
        commit('setOverallSize', data);
        dispatch('checkViewInCache');
      } )
      .catch  (      (e) => commit('errorRequest', e) )
      .finally(       () => commit('loading', false) );
  },
  load ({ commit }, grid) {
    commit('loading', true);
    getData( grid.rect() )
      .then   ( ({data}) => commit('updateCache', {grid, data}) )
      .catch  (      (e) => commit('errorRequest', e) )
      .finally(       () => commit('loading', false) );
  },
  setOverallSize({commit, dispatch}, size) {
    commit('setOverallSize', size);
    dispatch('checkViewInCache');
  },
  setOffset({commit, dispatch}, point) {
    commit('setOffset', point);
    dispatch('checkViewInCache');
  },
  setViewSize({commit, dispatch}, size) {
    commit('setViewSize', size);
    dispatch('checkViewInCache');
  },
  checkViewInCache({state: {overallSize, viewSize, offset}, dispatch}){
    if(!overallSize.w && !overallSize.h) return null;
    const gridArrayForCaching = CacheGrid.getViewGridIds( {viewSize, offset} );
    gridArrayForCaching.forEach( grid => {
      if ( !grid.isQuered() ){
        grid.putToQuery();
        dispatch("load", grid);
      }
    } )
  }
}

export_default.mutations = {
  loading(state, b) { state.loading = b },
  errorRequest(state, bool_text) { state.errorRequest = bool_text },
  initValues (state) { computeValues(state) },

  setOverallSize(state, size) {
    CacheGrid.init(size);
    state.overallSize = size;
    computeValues(state);
  },
  setOffset(state, {x, y}) {
    if (y !== undefined)
      state.offset.y = Math.max(0, Math.min(y, state.overallSize.h - state.viewSize.h));
    if (x !== undefined)
      state.offset.x = Math.max(0, Math.min(x, state.overallSize.w - state.viewSize.w));
    computeValues(state);
  },
  setViewSize(state, {w, h}) {
    if (w !== undefined) {
      state.viewSize.w = w;
      if ( state.overallSize.w !== 0 && w + state.offset.x > state.overallSize.w ) state.offset.x = state.overallSize.w - w;
    }
    if (h !== undefined) {
      state.viewSize.h = h;
      if ( state.overallSize.h !== 0 && h + state.offset.y > state.overallSize.h ) state.offset.y = state.overallSize.h - h;
    }
    computeValues(state);
  },
  updateCache(state, {grid, data}) {
    grid.setLoaded(data);
    computeValues(state);
  },
  removeChangedValue({changedValues, values}, {x, y, field}) {
    let pointerX = changedValues[x];
    if ( !( pointerX && pointerX[y] && pointerX[y][field]) ) return
    delete pointerX[y][field];
    if (!Object.keys(pointerX[y]).length) delete pointerX[y];
    if (!Object.keys(pointerX).length) delete changedValues[x];
    values[x][y].checked = false;
  },
  setChangedValue({changedValues, values}, {x, y, field, value}) {
    if (changedValues[x] === undefined)
      Vue.set(changedValues, x, {[y]: {[field]: value}});
    else if (changedValues[x][y] === undefined)
      Vue.set(changedValues[x], y, {[field]: value});
    else
      Vue.set(changedValues[x][y], field, value);
    values[x][y][field] = value;
  }
}


function computeValues({offset, viewSize, values, changedValues}) {
  for(let x = offset.x + 1, length = viewSize.w + offset.x; x <= length; x++ ) {
    if (values[x] === undefined) Vue.set(values, x, {})
    for(let y = offset.y + 1, length = viewSize.h + offset.y; y <= length; y++) {
      if (values[x][y] === undefined || values[x][y].value === null) {
        let setValue = {};
        
        if (changedValues[x] && changedValues[x][y])
          setValue = {...changedValues[x][y]};
        if (setValue.value === undefined)
          setValue.value = CacheGrid.getCell({x, y});
        setValue.checked = setValue.checked || false;
        Vue.set(values[x], y, setValue);
      }
    }
  }
}



export const registerModule = store => _registerModule(store, export_default, "tableStore");
// export const onceGlobalRegisterStoreModule = registerModule(null);

export default export_default;