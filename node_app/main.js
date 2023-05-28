const cors = require('cors')
const express = require('express');
const app = express();
const port = 3030;

app.use(express.json())
// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
  app.use(cors());
  next();
})

// Category App Module
const categoryApp = require("./categories");

// Routes
app.get("/api/categories/:sectionId?", (req, res) => {
  const categories = categoryApp.getCategories();
  if (!categories) {
    res.status(404).json({'msg': 'object not found'});
    return;
  }
  res.status(200);
  res.json({ results: categories });
})
app.post("/api/category/", (req, res) => {
  if (categoryApp.addCategory(req.body)) {
    res.status(201);
    res.json({ error: 0 });
    return
  }
  res.status(200)
  res.json({ error: 1, msg: 'nothing happened' });

})
app.patch("/api/category/:categoryId", (req, res) => {
  categoryApp.updateCategory(req.params.categoryId, req.body);
  res.status(200);
  res.json({ error: 0 });
})

app.get("/api/sections/", (req, res) => {
  const sections = categoryApp.getSections();
  if (!sections) {
    res.status(404).json({'msg': 'object not found'});
    return;
  }
  res.status(200);
  res.json({ results: sections });
})

app.listen(port, () => {
  console.log(`Express app server initialized on port ${port}`);
});
