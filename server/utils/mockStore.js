const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
  const file = getFilePath(collection);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return [];
  }
};

const writeData = (collection, data) => {
  const file = getFilePath(collection);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = {
  find: (collection, query = {}) => {
    const list = readData(collection);
    return list.filter(item => {
      for (let key in query) {
        // Stringify comparisons to allow simple ID matches
        if (String(item[key]) !== String(query[key])) return false;
      }
      return true;
    });
  },
  
  findOne: (collection, query = {}) => {
    const list = readData(collection);
    return list.find(item => {
      for (let key in query) {
        if (String(item[key]) !== String(query[key])) return false;
      }
      return true;
    }) || null;
  },
  
  findById: (collection, id) => {
    const list = readData(collection);
    return list.find(item => String(item._id) === String(id) || String(item.id) === String(id)) || null;
  },
  
  create: (collection, data) => {
    const list = readData(collection);
    const newItem = {
      _id: 'mock_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...data
    };
    list.push(newItem);
    writeData(collection, list);
    return newItem;
  },
  
  findOneAndUpdate: (collection, query, updateData, options = {}) => {
    const list = readData(collection);
    let itemIndex = list.findIndex(item => {
      for (let key in query) {
        if (String(item[key]) !== String(query[key])) return false;
      }
      return true;
    });
    
    let item;
    if (itemIndex === -1) {
      if (options.upsert) {
        item = {
          _id: 'mock_' + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          ...query,
          ...updateData
        };
        list.push(item);
      } else {
        return null;
      }
    } else {
      list[itemIndex] = {
        ...list[itemIndex],
        ...updateData
      };
      item = list[itemIndex];
    }
    
    writeData(collection, list);
    return item;
  },

  findByIdAndUpdate: (collection, id, updateData) => {
    const list = readData(collection);
    const itemIndex = list.findIndex(item => String(item._id) === String(id) || String(item.id) === String(id));
    if (itemIndex === -1) return null;
    list[itemIndex] = {
      ...list[itemIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeData(collection, list);
    return list[itemIndex];
  },

  findByIdAndDelete: (collection, id) => {
    const list = readData(collection);
    const itemIndex = list.findIndex(item => String(item._id) === String(id) || String(item.id) === String(id));
    if (itemIndex === -1) return null;
    const deleted = list.splice(itemIndex, 1)[0];
    writeData(collection, list);
    return deleted;
  }
};
