
class CacheGrid {
    static DIMENSION = {w: 2 ** 5, h: 2 ** 5}
    static MAX_SIZE  = 128
    static HOT_SIZE  = 32
    static PRELOAD_TRESHHOLD = 8
    
    static indexLastView = 0
    static first         = null
    static last          = null
    static hashdata      = {}
    static size          = 0
    static overallSize   = {w: 0, h: 0}
  
    static init(size) {
      this.overallSize = size;
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
      return null;
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
  
    static getViewGridIds({offset: {x, y}, viewSize: {w, h}}) {
      let point = {};
      const lastX = Math.min(x + w + this.PRELOAD_TRESHHOLD,  this.overallSize.w);
      const lastY = Math.min(y + h + this.PRELOAD_TRESHHOLD, this.overallSize.h);
      let rtrnArray = [];
      for(point.x = Math.max(0, x - this.PRELOAD_TRESHHOLD); point.x < lastX; point.x += this.DIMENSION.w ) {
        for(point.y = Math.max(0, y - this.PRELOAD_TRESHHOLD); point.y < lastY; point.y += this.DIMENSION.h) {
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
      if (!this.isLoaded) return null;
      const {localX, localY} = CacheGrid.getCoordinatesInGrid(point);
      if (this.indexView + CacheGrid.HOT_SIZE < CacheGrid.indexLastView)
        this.indexView = ++CacheGrid.indexLastView;
      return this.data[localX][localY];
    }
  
    _getCell({localX, localY}) {
      if (!this.isLoaded) return null;
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

export default CacheGrid