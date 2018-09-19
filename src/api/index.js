export const getSizes = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve({data: {w: 40000, h: 40000}}) }, 500);
  } );
}

export function getData({x, y, w, h}) {
  return new Promise((resolve, reject) => {
    setTimeout( () =>
      {
        try {
         let array = [];
          for(let c = 0; c < w; c++) {
            array[c] = [];
            for(let r = 0; r < h; r++)
              array[c][r] = Math.round( Math.random() * 1000 );
          }
          resolve( {data: {x, y, array}} );
        } catch (error) {
          reject("error");
        }
      }
    , 500 );
  } )
}