export const getSizes = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve({data: {columns: 40000, rows: 40000}}) }, 500);
  } );
}

export function getData({rowStart, columnStart, width, height}) {
  return new Promise((resolve, reject) => {
    setTimeout( () =>
      {
        try {
         let array = [];
          for(let c = 0; c < width; c++) {
            array[c] = [];
            for(let r = 0; r < height; r++)
              array[c][r] = Math.round( Math.random() * 10000 );
          }
          resolve( {data: {rowStart, columnStart, array}} );
        } catch (error) {
          reject("error");
        }
      }
    , 500 );
  } )
}