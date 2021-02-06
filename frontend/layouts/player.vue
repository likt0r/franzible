<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :clipped="clipped"
      fixed
      app
      temporary
    >
      <side-menue />
    </v-navigation-drawer>
    <v-app-bar :clipped-left="true" fixed app>
      <v-btn icon to="/">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <nuxt />
    </v-main>

    <v-navigation-drawer v-model="fileListState" right app :width="425" fixed>
      <playlist />
      <template #append>
        <div class="pa-2">
          <v-btn block @click.stop="fileListState = !fileListState">
            Schließen
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
import Playlist from '../components/Playlist.vue'
import SideMenue from '../components/SideMenu'
export default {
  components: { SideMenue, Playlist },
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire',
        },
      ],
      miniVariant: false,
      right: true,
      title: 'Vuetify.js',
    }
  },
  computed: {
    fileListState: {
      get() {
        return this.$store.state.fileListState
      },
      set(value) {
        this.$store.commit('SET_FILE_LIST', value)
      },
    },
  },
  methods: {},
}
</script>
