<template>
  <v-app-bar v-if="hideBar" :clipped-left="true" fixed app color="#13202a">
    <v-app-bar-nav-icon @click.stop="toggleNavigationDrawer" />
    <v-toolbar-title v-text="'Franzible'" />
    <v-spacer v-if="!search" />
    <v-btn icon :color="search ? 'secondary' : undefined" @click="toggleSearch">
      <v-icon>mdi-magnify</v-icon>
    </v-btn>

    <v-text-field
      v-if="search"
      ref="searchInput"
      v-model="searchTerm"
      hide-details
      single-line
      label="Search"
      autofocus
      clearable
    >
    </v-text-field>
  </v-app-bar>
</template>
<script>
export default {
  props: {
    hideBar: Boolean,
  },
  data() {
    return {
      search: false,
      drawer: false,
    }
  },
  computed: {
    searchTerm: {
      get() {
        return this.$store.getters.getSearchTerm
      },
      set(val) {
        this.$store.dispatch('setSearchTerm', val)
      },
    },
    showNavigationDrawer: {
      get() {
        return this.$store.getters.getShowNavigationDrawer
      },
      set(val) {
        console.log('Navigationdrawer ', val)
        this.$store.dispatch('setShowNavigationDrawer', val)
      },
    },
  },
  methods: {
    toggleSearch() {
      this.search = !this.search
      this.seachTerm = ''
    },
    toggleNavigationDrawer() {
      this.showNavigationDrawer = !this.showNavigationDrawer
    },
  },
}
</script>
