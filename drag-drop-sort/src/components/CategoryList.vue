<template>
  <div id="categories-table" class="wrapper container p-5 pt-0">
    <div class="row p-2 d-flex shadow" style="border-color: #999 !important;">
      <div class="col-12"><h1> Categorias</h1></div>
    </div>
    <div class="row mt-3">
      <div class="col-4" v-for="(section, idn) in sortedSections" :value="section.id" :key="idn">
        <div class="card my-1 shadow">
          <div class="card-header"
            :data-item-id="section.id"
            :data-drag-position="idn"
            data-item-type="section"
            draggable="true"
            @dragend="dragEnd($event)"
            @dragstart="dragStart($event, item)"
            :data-drop-position="idn"
            @dragover.prevent
            @dragenter.prevent="dragEnter($event)"
            @dragleave.prevent="dragLeave($event)"
            @drop="onDrop($event)">
              <h6 class="card-subtitle float-start mt-0">{{ section.name }}</h6>
              <div class="float-end">
                <i class="bi bi-plus-square" @click="addNewCategory(section.id)"></i>
              </div>
          </div>
          <!-- dynamically define ref for element -->
          <div :ref="el => { setElementRef(section.id, el) }" style="height:210px;" class="card-body overflow-auto p-0">
            <div
              v-for="(category, idx) in getCategoriesBySection(section.id)"
              :key="category.id"
              @mouseleave="showCategoryOptions=null"
              class="row m-1 my-2 p-1">
              <div
                class="position-drop p-0 draggable-item border col-12 p-2" style="padding-left: 14px;"
                :data-item-id="category.id"
                :data-drag-position="idx"
                data-item-type="category"
                draggable="true"
                @dragend="dragEnd($event)"
                @dragstart="dragStart($event, item)"
                :data-drop-position="idx"
                @dragover.prevent
                @dragenter.prevent="dragEnter($event)"
                @dragleave.prevent="dragLeave($event)"
                @drop="onDrop($event)"
                @mouseover="showCategoryOptions=category.id">
                  {{ idx }}
                  <span v-if="editCategory===category.id">
                    <input
                      :ref="el => { categoryInput = el }"
                      type="text"
                      @keyup.enter="saveCategory(category.id)"
                      @keyup.esc="editCategory=null"
                      @blur="editCategory=null"
                      v-model="category.name">
                  </span>
                  <span v-else>{{ category.name }}</span>
                  <div class="float-end category-options" v-if="showCategoryOptions===category.id">
                    <i
                      @click="openEditCategory(category.id)"
                      title="Renomear"
                      class="bi bi-pencil-square mx-1">
                    </i>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CategoryList',

  data () {
    return {
      apiUrl: 'http://localhost:3030/api',
      dragging: {
        id: null,
        fromPosition: null,
        toPosition: null,
        itemType: null,
      },
      categories: [],
      sections: [],
      showCategoryOptions: null,
      editCategory: '',
      categoryInput: '',
      elementRefs: [],
      categoriesLoadScrollBottom: false
    }
  },

  mounted() {
    this.getSections()
    this.getCategories()
  },

  methods: {
    dragStart (event, item) {
      this.dragging.id = parseInt(event.target.dataset.itemId)
      this.dragging.fromPosition = parseInt(event.target.dataset.dragPosition)
      this.dragging.itemType = event.target.dataset.itemType
    },

    dragEnd (event) {
      this.dragging.id = null
      this.dragging.fromPosition = null
      this.dragging.toPosition = null
      let itemType = this.dragging.itemType
      this.dragging.itemType = null
      this.saveUpdatedPosition(itemType)
    },

    dragEnter (event) {
      let elementItemType = event.target.dataset.itemType
      if (elementItemType !== this.dragging.itemType) return
      if (elementItemType === 'category') {
        const elementItemId = parseInt(event.target.dataset.itemId)
        const elementItemObj = this.categories.filter((cat) => { return cat.id === elementItemId })[0]
        const draggingItemObj = this.categories.filter((cat) => { return cat.id === this.dragging.id })[0]
        if (elementItemObj.section !== draggingItemObj.section) return
      }
      this.dragging.toPosition = parseInt(event.target.dataset.dropPosition)
      this.updatePosition()
    },

    dragLeave (event) {
    },

    onDrop (event) {
    },

    updatePosition () {
      let toPosition = this.dragging.toPosition
      let fromPosition = this.dragging.fromPosition
      let dropGroup = []
      let draggedItem = []
      if (fromPosition === toPosition) return
      if (this.dragging.itemType == 'section') {
        draggedItem = this.sections.filter((section) => { return section.id === this.dragging.id })[0]
        dropGroup = this.sections.sort((a,b) => a.position - b.position )
      }
      if (this.dragging.itemType == 'category') {
        draggedItem = this.categories.filter((cat) => { return cat.id === this.dragging.id })[0]
        dropGroup = this.categories.filter((cat) => { return cat.section === draggedItem.section })
                                   .sort((a,b) => a.position - b.position )
      }
      dropGroup.forEach((itemObj, itemPos) => {
        if (toPosition > fromPosition && (itemPos > fromPosition && itemPos <= toPosition)) {
          itemObj.position = (itemPos - 1)
        } else if (toPosition < fromPosition && (itemPos < fromPosition && itemPos >= toPosition)) {
          itemObj.position = (itemPos + 1)
        }
      })
      draggedItem.position = toPosition
      this.dragging.fromPosition = toPosition
    },

    getSections () {
      axios.get(`${this.apiUrl}/sections/`)
        .then(response => {
          this.sections = response.data.results
        })
    },

    getCategories () {
      axios.get(`${this.apiUrl}/categories/`)
        .then(response => {
          this.categories = response.data.results
        })
        .finally(() => {
          if (this.categoriesLoadScrollBottom) {
            this.$nextTick(() => {
              let sectionId = this.categoriesLoadScrollBottom
              let sectionElRef = this.elementRefs.filter((eElement) => eElement.id === sectionId)
                                            .map((eElement) => eElement.el)[0]
              sectionElRef.lastElementChild.scrollIntoView({ behavior: 'smooth' })
              this.categoriesLoadScrollBottom = false
            })
          }
        })
    },

    getCategoriesBySection (sectionId) {
      let sortedCats = this.categories.filter((category) => {
        return category.section === sectionId
      })
      .sort((a,b) => a.position - b.position)
      sortedCats.forEach((cat,idx) => {
        cat.position = idx
      })
      return sortedCats
    },

    saveUpdatedPosition () {
      axios.patch(`${this.apiUrl}/categories/`, this.categories)
        .then(response => {
          console.log(response)
        })
      axios.patch(`${this.apiUrl}/sections/`, this.sections)
        .then(response => {
          console.log(response)
        })
    },

    setElementRef(elId, el) {
      let elUpdated = false
      this.elementRefs.forEach((eElement) => {
        if (eElement.id === elId) {
          eElement.el = el
          elUpdated = true
        }
      })
      if (!elUpdated) {
        this.elementRefs.push({ 'id': elId, 'el': el })
      }
    },

    addNewCategory (sectionId) {
      let newCategory = {
        'name': 'New category',
        'section': sectionId
      }
      axios.post(`${this.apiUrl}/category/`, newCategory)
        .then(response => {
          if (response.status === 201) {
            this.categoriesLoadScrollBottom = sectionId
            this.getCategories()
          }
        })
    },

    saveCategory (categoryId) {
      const category = this.categories.filter((cat) => cat.id === categoryId)
      if (category.length === 0)
        return
      axios.patch(`${this.apiUrl}/category/${categoryId}`, { 'name': category[0].name })
        .then(response => {
          if (response.status === 200) {
            this.editCategory = null
          }
        })
    },

    openEditCategory (categoryId) {
      this.editCategory = categoryId
      this.$nextTick(() => {
        if (this.categoryInput != '') {
          this.categoryInput.focus()
          this.categoryInput.select()
        }
      })
    }
  },

  computed: {
    sortedSections () {
      let sortedSections = this.sections
      sortedSections.sort((a,b) => a.position - b.position)
      // adjustment to always have consistency on position numbers
      sortedSections.forEach((mt,idx) => {
        mt.position = idx
      })
      return sortedSections
    }
  },
}
</script>

<style scoped>
.position-drop {
  position: relative;
  z-index: 0;
}
.drop-active {
  z-index:101;
}
.draggable-item {
  position: relative;
  z-index: 100;
  cursor: pointer;
}
.drop-spotted {
  background-color: #edd;
}
.dragging {
  opacity: 0.4;
}
.dragging-one {
  background-color:#c6c6c6;
}
.category-options i {
  padding: 2px;
}
.category-options i:hover {
  background-color: #ba6;
}
</style>