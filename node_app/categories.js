const categories = [
  {
    id: 1,
    section: 1,
    name: 'Cat 1.1',
    position: 0
  },
  {
    id: 2,
    section: 1,
    name: 'Cat 1.2',
    position: 1
  },
  {
    id: 3,
    section: 1,
    name: 'Cat 1.3',
    position: 2
  },
  {
    id: 4,
    section: 2,
    name: 'Cat 2.1',
    position: 0
  },
  {
    id: 5,
    section: 2,
    name: 'Cat 2.2',
    position: 1
  },
  {
    id: 6,
    section: 2,
    name: 'Cat 2.3',
    position: 2
  },
  {
    id: 7,
    section: 3,
    name: 'Cat 3.1',
    position: 0
  },
  {
    id: 8,
    section: 3,
    name: 'Cat 3.2',
    position: 1
  },
  {
    id: 9,
    section: 3,
    name: 'Cat 3.3',
    position: 2
  }
];

const sections = [
  {
    id: 1,
    name: 'Test Section #1',
    position: 0
  },
  {
    id: 2,
    name: 'Test Section #2',
    position: 1
  },
  {
    id: 3,
    name: 'Test Section #3',
    position: 2
  },
  {
    id: 4,
    name: 'Test Section #4',
    position: 3
  }
];

exports.getCategories = (sectionId) => {
  if (!sectionId) return categories;
  return categories.filter((cat) => cat.section === sectionId);
}

exports.addCategory = (category) => {
  if (category.section && category.name) {
    const getLastId = categories.map((cat) => cat.id).sort((a, b) => a-b)
    let lastId = getLastId.length > 0 ? getLastId[getLastId.length-1] : 0
    category.id = lastId+1
    categories.push(category);
    return true
  }
  return false
}

exports.updateCategory = (categoryId, category) => {
  if (categoryId && category.name) {
    categories.filter((cat) => cat.id === parseInt(categoryId)).map((catUpdate) => {
      catUpdate.name = category.name;
    });
  }
}

exports.updateCategories = (updateCategories) => {
  updateCategories.forEach((inCat) => {
    categories.filter((cat) => cat.id === parseInt(inCat.id)).map((cat) => {
      Object.assign(cat, inCat)
    })
  })
}

exports.getSections = () => {
  return sections;
}

exports.updateSections = (updateSections) => {
  updateSections.forEach((inSection) => {
    sections.filter((section) => section.id === parseInt(inSection.id)).map((section) => {
      Object.assign(section, inSection)
    })
  })
}