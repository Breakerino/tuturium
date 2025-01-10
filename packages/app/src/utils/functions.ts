import _ from 'lodash';

const mergeByProp = <T extends Record<string, any>>(property: keyof T, ...arrays: T[][]): T[] => {
  const map = new Map<any, T>();

  arrays.forEach(arr => {
    arr.forEach(obj => {
      if (map.has(obj[property])) {
        _.merge(map.get(obj[property]), obj);
      } else {
        map.set(obj[property], _.cloneDeep(obj));
      }
    });
  });

  return Array.from(map.values());
};

export default mergeByProp;
