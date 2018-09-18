import Vue from 'vue';
import Vuex, {mapState, mapActions, mapMutations, mapGetters } from 'vuex';

Vue.use(Vuex);

const isDevelop = process.env.NODE_ENV !== 'production';

const export_store = new Vuex.Store({
  strict: false //isDevelop
});

const generateModuleName = (store, name, number = 0) => {
  const moduleName = number > 0 ? `${name}_${number}` : name;
  const isModuleExists = store.state[moduleName];
  return isModuleExists ? generateModuleName(store, name, number + 1) : moduleName;
};


export const registerModule = (store, module, name) => {
  store = store || export_store;
  const moduleName = generateModuleName(store, name);
  store.registerModule(moduleName, module);
  return {
    namespace: moduleName,
    state(name){ return store.state[moduleName][name] },
    getter(name){ return store.getters[`${moduleName}/${name}`] },
    commit(mutation, payload){ store.commit(`${moduleName}/${mutation}`, payload) },
    dispatch(action, payload){ store.dispatch(`${moduleName}/${action}`, payload) },
    destroy(){ store.unregisterModule(moduleName) },

    mapState     (list){ return mapState(moduleName, list) },
    mapActions   (list){ return mapActions(moduleName, list) },
    mapGetters   (list){ return mapGetters(moduleName, list) },
    mapMutations (list){ return mapMutations(moduleName, list) },
  }
};

export default export_store;