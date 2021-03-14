<template>
  <fragment>
    <v-app-bar v-if="hideBar" :clipped-left="true" fixed app color="#13202a">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="'Franzible'" />
      <v-spacer v-if="!search" />
      <v-btn
        icon
        :color="search ? 'secondary' : undefined"
        @click="toggleSearch"
      >
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
      >
      </v-text-field>
    </v-app-bar>
    <v-navigation-drawer
      v-if="!hideBar"
      v-model="drawer"
      fixed
      app
      temporary
      style="background-color: #13202a"
    >
      <side-menue />
    </v-navigation-drawer>
  </fragment>
</template>
<script>
import { Fragment } from 'vue-fragment'
import SideMenue from '~/components/SideMenu.vue'
export default {
  components: {
    SideMenue,
    Fragment,
  },
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
        return this.$store.getters.search
      },
      set(val) {
        this.$store.dispatch('setSearch', val)
      },
    },
  },
  methods: {
    toggleSearch() {
      this.search = !this.search
      this.seachTerm = ''
    },
  },
}
</script>
